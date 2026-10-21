import { Module } from '@nestjs/common';
import { MetricasLandingController } from './metricas-landing.controller';
import { MetricasLandingService } from './metricas-landing.service';

@Module({
  controllers: [MetricasLandingController],
  providers: [MetricasLandingService],
  exports: [MetricasLandingService],
})
export class MetricasLandingModule {}
