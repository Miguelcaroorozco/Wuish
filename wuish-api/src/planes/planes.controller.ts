import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Allow, IsBoolean, IsNumber, IsObject, IsOptional, IsString, Length, Matches } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { PlanesService } from './planes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class TipoServicioDto {
  @IsString() @Length(1, 100) nombre: string;
  @IsOptional() @IsString() @Length(1, 10000) descripcion?: string;
}

class PlanDto {
  @Matches(UUID_PATTERN) tipo_servicio_id: string;
  @IsString() @Length(1, 100) nombre: string;
  @IsOptional() @IsString() @Length(1, 10000) descripcion?: string;
  @IsOptional() @IsNumber() precio?: number;
  @IsOptional() @Allow() caracteristicas?: unknown;
  @IsOptional() @IsBoolean() activo?: boolean;
}
class UpdateTipoServicioDto extends PartialType(TipoServicioDto) {}
class UpdatePlanDto extends PartialType(PlanDto) {}

@ApiTags('Planes')
@Controller()
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
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
  createTipo(@Body() data: TipoServicioDto) {
    return this.planesService.createTipoServicio(data);
  }

  @Put('tipos-servicio/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar tipo de servicio (admin)' })
  updateTipo(@Param('id') id: string, @Body() data: UpdateTipoServicioDto) {
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
  create(@Body() data: PlanDto) {
    return this.planesService.createPlan(data);
  }

  @Put('planes/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar plan (admin)' })
  update(@Param('id') id: string, @Body() data: UpdatePlanDto) {
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
