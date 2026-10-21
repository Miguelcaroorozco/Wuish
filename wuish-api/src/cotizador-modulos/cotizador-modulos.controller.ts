import { Controller, Get, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CotizadorModulosService } from './cotizador-modulos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@ApiTags('Cotizador Módulos')
@Controller('cotizador-modulos')
export class CotizadorModulosController {
  constructor(private cotizadorModulosService: CotizadorModulosService) {}

  @Get()
  getAll(@Query('all') all?: string) {
    return this.cotizadorModulosService.getAll(all === 'true');
  }

  @Put()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  upsert(@Body() dto: any) {
    return this.cotizadorModulosService.upsert(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  delete(@Param('id') id: string) {
    return this.cotizadorModulosService.delete(id);
  }
}
