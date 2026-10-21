import { Module } from '@nestjs/common';
import { ProyectosPortafolioController } from './proyectos-portafolio.controller';
import { ProyectosPortafolioService } from './proyectos-portafolio.service';

@Module({
  controllers: [ProyectosPortafolioController],
  providers: [ProyectosPortafolioService],
  exports: [ProyectosPortafolioService],
})
export class ProyectosPortafolioModule {}
