import {
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Metric } from './metric.entity';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import * as moment from 'moment';
import { Transform } from 'stream';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { GetAggregationDto, AggType } from './dto/get-aggregation.dto';
import * as path from 'path';

@Injectable()
export class MetricService {
  private readonly logger = new Logger(MetricService.name);
  private readonly BATCH_SIZE = 1000; // Tamanho do lote de inserção
  private readonly REPORTS_DIR = path.join(__dirname, '../../reports'); // Pasta para salvar relatórios

  constructor(
    @InjectRepository(Metric)
    private metricRepository: Repository<Metric>,
  ) {
    // Cria a pasta reports se não existir
    if (!fs.existsSync(this.REPORTS_DIR)) {
      fs.mkdirSync(this.REPORTS_DIR, { recursive: true });
    }
  }

  /**
   * Importa dados de um arquivo CSV para o banco de dados.
   * @param filePath Caminho do arquivo CSV.
   */
  async importCsv(filePath: string): Promise<string> {
    const results: Partial<Metric>[] = [];

    this.logger.log(`Iniciando leitura do arquivo CSV: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Arquivo não encontrado: ${filePath}`);
    }

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(
          new Transform({
            transform(chunk, encoding, callback) {
              const content = chunk.toString().replace(/^﻿/, ''); // Remove BOM
              callback(null, content);
            },
          }),
        )
        .pipe(csv({ separator: ';' }))
        .on('data', async (data) => {
          try {
            const formattedDate = moment(
              data.dateTime,
              'DD/MM/YYYY HH:mm',
              true,
            );

            if (!formattedDate.isValid()) {
              this.logger.warn(
                `Data inválida descartada: ${data.dateTime}`,
              );
              return;
            }

            const entry: Partial<Metric> = {
              metricId: this.validateMetricId(data.metricId || 0),
              dateTime: formattedDate.toDate(),
              aggDay: this.validateAggregation(data.aggDay, 1),
              aggMonth: this.validateAggregation(data.aggMonth, 1),
              aggYear: this.validateAggregation(
                data.aggYear,
                new Date().getFullYear(),
              ),
            };

            await this.metricRepository.save(entry);

            this.logger.log(
              `Registro salvo ou atualizado: metricId=${entry.metricId}, dateTime=${entry.dateTime}`,
            );
          } catch (error) {
            this.logger.error(
              `Erro ao processar linha: ${JSON.stringify(
                data,
              )} - ${error.message}`,
            );
          }
        })
        .on('end', () => {
          resolve('Importação concluída com sucesso!');
        })
        .on('error', (error) => {
          this.logger.error('Erro durante a leitura do arquivo CSV.', error);
          reject(
            new InternalServerErrorException(
              'Erro durante a leitura do arquivo.',
            ),
          );
        });
    });
  }

  /**
   * Retorna métricas agregadas com base nos parâmetros fornecidos.
   * @param dto Parâmetros de agregação.
   */
  async getAggregatedMetrics(dto: GetAggregationDto) {
    const { metricId, aggType, dateInitial, finalDate } = dto;

    let groupBy: string;
    switch (aggType) {
      case AggType.DAY:
        groupBy = `DATE_TRUNC('day', "dateTime")`;
        break;
      case AggType.MONTH:
        groupBy = `DATE_TRUNC('month', "dateTime")`;
        break;
      case AggType.YEAR:
        groupBy = `DATE_TRUNC('year', "dateTime")`;
        break;
      default:
        throw new BadRequestException('Tipo de agregação inválido.');
    }

    const result = await this.metricRepository
      .createQueryBuilder('metric')
      .select(`${groupBy} AS date`)
      .addSelect('SUM("aggDay")', 'value')
      .where('metric."metricId" = :metricId', { metricId })
      .andWhere('metric."dateTime" BETWEEN :start AND :end', {
        start: dateInitial,
        end: finalDate,
      })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    if (result.length === 0) {
      throw new NotFoundException(
        'Nenhum dado encontrado para o período solicitado.',
      );
    }

    return result;
  }

  /**
   * Gera e exporta um relatório Excel com base nas métricas agregadas.
   * Salva o arquivo na pasta reports.
   * @param dto Parâmetros de filtro do relatório.
   * @param res Resposta HTTP para download do arquivo.
   */
  async generateExcelReport(dto: GetAggregationDto, res: Response) {
    try {
      const startDate = new Date(dto.dateInitial);
      const endDate = new Date(dto.finalDate);

      const data = await this.metricRepository.find({
        where: {
          metricId: dto.metricId,
          dateTime: Between(startDate, endDate),
        },
        order: { dateTime: 'ASC' },
      });

      this.logger.log(`Registros encontrados para o relatório: ${data.length}`);

      if (data.length === 0) {
        throw new NotFoundException(
          'Nenhum dado encontrado para o período solicitado.',
        );
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Relatório de Métricas');

      worksheet.columns = [
        { header: 'MetricId', key: 'metricId', width: 15 },
        { header: 'DateTime', key: 'dateTime', width: 20 },
        { header: 'Aggday', key: 'aggDay', width: 15 },
        { header: 'AggMonth', key: 'aggMonth', width: 15 },
        { header: 'AggYear', key: 'aggYear', width: 15 },
      ];

      data.forEach((record) => {
        worksheet.addRow({
          metricId: record.metricId,
          dateTime: moment(record.dateTime).format('DD/MM/YYYY'),
          aggDay: record.aggDay,
          aggMonth: record.aggMonth,
          aggYear: record.aggYear.toString().slice(-2),
        });
      });

      const filePath = path.join(this.REPORTS_DIR, 'relatorio_metrico_completo.xlsx');
      await workbook.xlsx.writeFile(filePath);

      res.download(filePath);
      this.logger.log(`Relatório salvo em: ${filePath}`);
    } catch (error) {
      this.logger.error('Erro ao gerar relatório:', error);
      throw new InternalServerErrorException('Erro ao gerar relatório.');
    }
  }

  // Métodos de validação
  private validateMetricId(metricId: any): number {
    const parsedId = parseInt(metricId, 10);
    return isNaN(parsedId) || parsedId <= 0 ? 0 : parsedId;
  }

  private validateAggregation(value: any, defaultValue: number): number {
    const parsedValue = parseInt(value, 10);
    return isNaN(parsedValue) || parsedValue <= 0 ? defaultValue : parsedValue;
  }
}

