import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PlanesService } from './planes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@ApiTags('Planes')
@Controller()
export class PlanesController {
  constructor(private planesService: PlanesService) {}

  // ========== TIPOS DE SERVICIO ==========
  @Get('tipos-servicio')
  @ApiOperation({ summary: 'Listar tipos de servicio con sus planes' })
  findAllTipos() {
    return this.planesService.findAllTiposServicio();
  }

  @Post('tipos-servicio')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear tipo de servicio (admin)' })
  createTipo(@Body() data: { nombre: string; descripcion?: string }) {
    return this.planesService.createTipoServicio(data);
  }

  @Put('tipos-servicio/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar tipo de servicio (admin)' })
  updateTipo(@Param('id') id: string, @Body() data: { nombre?: string; descripcion?: string }) {
    return this.planesService.updateTipoServicio(id, data);
  }

  @Delete('tipos-servicio/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar tipo de servicio (admin)' })
  deleteTipo(@Param('id') id: string) {
    return this.planesService.deleteTipoServicio(id);
  }

  // ========== PLANES ==========
  @Get('planes')
  @ApiOperation({ summary: 'Listar todos los planes (público: solo activos)' })
  findAll(@Query('all') all?: string) {
    return this.planesService.findAllPlanes(all !== 'true');
  }

  @Get('planes/:id')
  @ApiOperation({ summary: 'Obtener plan por ID' })
  findOne(@Param('id') id: string) {
    return this.planesService.findOnePlan(id);
  }

  @Post('planes')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear plan (admin)' })
  create(@Body() data: {
    tipo_servicio_id: string;
    nombre: string;
    descripcion?: string;
    precio?: number;
    caracteristicas?: any;
  }) {
    return this.planesService.createPlan(data);
  }

  @Put('planes/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar plan (admin)' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.planesService.updatePlan(id, data);
  }

  @Delete('planes/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desactivar plan (admin)' })
  remove(@Param('id') id: string) {
    return this.planesService.deletePlan(id);
  }
}
