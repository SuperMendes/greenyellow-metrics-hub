import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MetricModule } from './metric/metric.module';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot(), // Carrega .env automaticamente
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    MetricModule,  // Registra o módulo MetricModule
  ],
})
export class AppModule {}

