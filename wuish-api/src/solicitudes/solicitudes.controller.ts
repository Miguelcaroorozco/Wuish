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
  @ApiOperation({ summary: 'Crear nueva solicitud' })
  create(@Request() req, @Body() data: { tipo: string; descripcion?: string; plan_id?: string }) {
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

  @Post(':id/ajustes')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agregar ajuste a solicitud (admin)' })
  addAjuste(
    @Param('id') id: string,
    @Request() req,
    @Body() data: { descripcion_ajuste: string },
  ) {
    return this.solicitudesService.addAjuste(id, {
      descripcion_ajuste: data.descripcion_ajuste,
      respondido_por: req.user.sub,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar solicitud (admin)' })
  remove(@Param('id') id: string) {
    return this.solicitudesService.delete(id);
  }
}
