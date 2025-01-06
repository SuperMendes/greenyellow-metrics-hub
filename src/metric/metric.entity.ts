import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entidade Metric que representa a estrutura da tabela no banco de dados.
 * Esta entidade mapeia diretamente para a tabela 'metric'.
 */
@Entity()
export class Metric {
  /**
   * Chave primária gerada automaticamente para cada registro.
   * Representa o identificador único da métrica.
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Identificador da métrica. É usado para diferenciar diferentes métricas no banco de dados.
   */
  @Column()
  metricId: number;

  /**
   * Data e hora em que a métrica foi registrada.
   * Armazenado como timestamp para operações precisas de data/hora.
   */
  @Column({ type: 'timestamp' })
  dateTime: Date;

  /**
   * Valor agregado diário associado à métrica.
   * Representa um cálculo ou soma de um determinado valor por dia.
   */
  @Column()
  aggDay: number;

  /**
   * Valor agregado mensal associado à métrica.
   * Representa um cálculo ou soma de um determinado valor por mês.
   */
  @Column()
  aggMonth: number;

  /**
   * Valor agregado anual associado à métrica.
   * Representa um cálculo ou soma de um determinado valor por ano.
   */
  @Column()
  aggYear: number;
}

