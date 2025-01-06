import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Res,
  Get,
  Query,
} from '@nestjs/common';
import { MetricService } from './metric.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import { GetAggregationDto } from './dto/get-aggregation.dto';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// Configuração para garantir que o diretório de uploads exista
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

@Controller('metrics')
export class MetricController {
  constructor(private readonly metricService: MetricService) {}

  /**
   * Importa métricas de um arquivo CSV
   */
  @Post('import')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async importMetrics(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException(
        { message: 'Nenhum arquivo enviado!' },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.metricService.importCsv(file.path);
      return { message: result };
    } catch (error) {
      console.error('Erro durante a importação:', error);
      throw new HttpException(
        { message: 'Erro ao importar arquivo!', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtém métricas agregadas com base nos parâmetros fornecidos
   */
  @Get('aggregate')
  async getAggregatedMetrics(@Query() query: GetAggregationDto) {
    try {
      const result = await this.metricService.getAggregatedMetrics(query);
      return result;
    } catch (error) {
      console.error('Erro ao buscar métricas agregadas:', error);
      throw new HttpException(
        { message: 'Erro ao obter dados agregados.', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Gera um relatório em formato Excel com base nos dados agregados
   */
  @Get('report')
  async generateReport(@Query() query: GetAggregationDto, @Res() res: Response) {
    try {
      await this.metricService.generateExcelReport(query, res);
    } catch (error) {
      console.error('Erro durante a geração do relatório:', error);
      throw new HttpException(
        { message: 'Erro ao gerar relatório.', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

