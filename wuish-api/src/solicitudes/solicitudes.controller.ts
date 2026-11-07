import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Allow, IsArray, IsIn, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { SolicitudesService } from './solicitudes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

class CreateSolicitudDto {
  @IsOptional() @IsIn(['servicio', 'cotizacion']) tipo?: string;
  @IsOptional() @IsString() @Length(1, 5000) descripcion?: string;
  @IsOptional() @IsUUID() plan_id?: string;
  @IsOptional() @IsString() @Length(1, 150) empresa?: string;
  @IsOptional() @IsString() @Length(7, 30) telefono_contacto?: string;
  @IsOptional() @Allow() servicios_seleccionados?: unknown;
  @IsOptional() @IsString() @Length(1, 30) velocidad_entrega?: string;
  @IsOptional() @IsString() @Length(1, 30) nivel_soporte?: string;
}

class UpdateEstadoDto {
  @IsString() estado: string;
  @IsOptional() @IsString() @Length(1, 255) motivo?: string;
  @IsOptional() @IsUUID() admin_asignado_id?: string;
}

class AssignAdminsDto {
  @IsArray() @IsUUID('4', { each: true }) admin_ids: string[];
}

@ApiTags('Solicitudes')
@Controller('solicitudes')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
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
  findOne(@Param('id') id: string, @Request() req) {
    const isAdmin = req.user.rol === 'admin' || req.user.rol === 'administrador';
    return this.solicitudesService.findOne(id, req.user.sub, isAdmin);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nueva solicitud / cotización' })
  create(
    @Request() req,
    @Body() data: CreateSolicitudDto,
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
    @Body() data: UpdateEstadoDto,
  ) {
    return this.solicitudesService.updateEstado(id, data);
  }

  @Put(':id/admins')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Asignar administradores a una solicitud' })
  assignAdmins(@Param('id') id: string, @Body() data: AssignAdminsDto) {
    return this.solicitudesService.assignAdmins(id, data.admin_ids);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar solicitud (admin)' })
  delete(@Param('id') id: string) {
    return this.solicitudesService.delete(id);
  }
}
