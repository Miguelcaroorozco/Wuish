import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SolicitudesService } from './solicitudes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@ApiTags('Solicitudes')
@Controller('solicitudes')
export class SolicitudesController {
  constructor(private solicitudesService: SolicitudesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar solicitudes del usuario autenticado' })
  findMine(@Request() req) {
    return this.solicitudesService.findByUsuario(req.user.sub);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas las solicitudes (admin)' })
  findAll(@Query('estado') estado?: string, @Query('tipo') tipo?: string) {
    return this.solicitudesService.findAll({ estado, tipo });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener detalle de solicitud' })
  findOne(@Param('id') id: string) {
    return this.solicitudesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nueva solicitud / cotización' })
  create(
    @Request() req,
    @Body()
    data: {
      tipo?: string;
      descripcion?: string;
      plan_id?: string;
      empresa?: string;
      telefono_contacto?: string;
      servicios_seleccionados?: any;
      presupuesto_min?: number;
      presupuesto_max?: number;
      velocidad_entrega?: string;
      nivel_soporte?: string;
    },
  ) {
    return this.solicitudesService.create({
      usuario_id: req.user.sub,
      ...data,
    });
  }

  @Put(':id/estado')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar estado de solicitud (admin)' })
  updateEstado(
    @Param('id') id: string,
    @Body() data: { estado: string; motivo?: string; admin_asignado_id?: string },
  ) {
    return this.solicitudesService.updateEstado(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar solicitud (admin)' })
  delete(@Param('id') id: string) {
    return this.solicitudesService.delete(id);
  }
}
