import { Module } from '@nestjs/common';
import { CotizadorModulosController } from './cotizador-modulos.controller';
import { CotizadorModulosService } from './cotizador-modulos.service';

@Module({
  controllers: [CotizadorModulosController],
  providers: [CotizadorModulosService],
  exports: [CotizadorModulosService],
})
export class CotizadorModulosModule {}
