import { IsEnum, IsInt, IsISO8601, IsNotEmpty, Min, ValidateIf, ValidationArguments } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Enum que define os tipos de agregação disponíveis
 */
export enum AggType {
  DAY = 'DAY',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

/**
 * DTO para validação dos parâmetros de agregação
 */
export class GetAggregationDto {
  /**
   * Identificação única da métrica
   */
  @IsInt({ message: 'O campo metricId deve ser um número inteiro.' })
  @IsNotEmpty({ message: 'O campo metricId é obrigatório.' })
  @Min(1, { message: 'O metricId deve ser um número inteiro maior que zero.' })
  @Type(() => Number)
  metricId: number;

  /**
   * Tipo de agregação (DAY, MONTH ou YEAR)
   */
  @IsEnum(AggType, {
    message: (args: ValidationArguments) => {
      return `O campo aggType deve ser um dos seguintes valores: ${Object.values(AggType).join(', ')}.`;
    },
  })
  @IsNotEmpty({ message: 'O campo aggType é obrigatório.' })
  aggType: AggType;

  /**
   * Data de início no formato ISO 8601
   */
  @IsISO8601(
    {},
    { message: 'A data de início (dateInitial) deve estar no formato ISO8601 (AAAA-MM-DD).' },
  )
  @IsNotEmpty({ message: 'A data de início (dateInitial) é obrigatória.' })
  dateInitial: string;

  /**
   * Data final no formato ISO 8601
   */
  @IsISO8601(
    {},
    { message: 'A data final (finalDate) deve estar no formato ISO8601 (AAAA-MM-DD).' },
  )
  @IsNotEmpty({ message: 'A data final (finalDate) é obrigatória.' })
  finalDate: string;

  /**
   * Validação personalizada para garantir que a data inicial não seja maior que a data final
   */
  @ValidateIf((o) => o.dateInitial && o.finalDate)
  validateDates() {
    const start = new Date(this.dateInitial);
    const end = new Date(this.finalDate);

    if (start > end) {
      throw new Error('A data de início (dateInitial) não pode ser posterior à data final (finalDate).');
    }
  }
}

