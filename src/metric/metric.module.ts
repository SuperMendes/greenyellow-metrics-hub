import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricController } from './metric.controller';
import { MetricService } from './metric.service';
import { Metric } from './metric.entity';

/**
 * O módulo Metric é responsável por agrupar todos os componentes relacionados à funcionalidade de métricas,
 * como controladores, serviços e entidades.
 * 
 * A anotação @Module é usada para definir a estrutura do módulo no NestJS.
 */
@Module({
  // Imports define quais outros módulos ou entidades estão sendo utilizados neste módulo.
  imports: [
    // O TypeOrmModule.forFeature([Metric]) disponibiliza o repositório da entidade Metric
    // para ser injetado e utilizado dentro dos serviços que fazem parte deste módulo.
    TypeOrmModule.forFeature([Metric]),
  ],
  
  // Controllers são responsáveis por lidar com as requisições HTTP e encaminhá-las para os serviços apropriados.
  controllers: [
    // Define o controlador que gerencia as requisições para a rota de métricas.
    MetricController,
  ],
  
  // Providers são os serviços ou classes que contêm lógica de negócio e que podem ser injetados em outros componentes.
  providers: [
    // Registra o serviço MetricService como um provedor para ser utilizado dentro deste módulo.
    MetricService,
  ],
})
export class MetricModule {}

