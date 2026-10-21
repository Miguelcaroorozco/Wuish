import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TiposServicioService } from './tipos-servicio.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@ApiTags('Tipos de Servicio')
@Controller('tipos-servicio')
export class TiposServicioController {
  constructor(private tiposServicioService: TiposServicioService) {}

  @Get()
  getAll() {
    return this.tiposServicioService.getAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  create(@Body() dto: { nombre: string; descripcion?: string }) {
    return this.tiposServicioService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: { nombre?: string; descripcion?: string }) {
    return this.tiposServicioService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  delete(@Param('id') id: string) {
    return this.tiposServicioService.delete(id);
  }
}
