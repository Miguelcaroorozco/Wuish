import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Allow, IsBoolean, IsInt, IsNumber, IsObject, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { InfoGeneralService } from './info-general.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

class InfoDto {
  @IsString() @Length(1, 100) seccion: string;
  @IsString() @Length(1, 10000) contenido: string;
}

class ModuloDto {
  @IsString() @Length(1, 60) id: string;
  @IsString() @Length(1, 150) nombre: string;
  @IsString() @Length(1, 50) categoria: string;
  @IsNumber() precio_base: number;
  @IsString() @Length(1, 10000) descripcion: string;
  @IsOptional() @IsBoolean() activo?: boolean;
  @IsOptional() @IsInt() orden?: number;
}

class ProyectoDto {
  @IsString() @Length(1, 150) titulo: string;
  @IsOptional() @IsString() @Length(1, 150) cliente?: string;
  @IsString() @Length(1, 50) categoria: string;
  @IsOptional() @IsString() @Length(1, 10) anio?: string;
  @IsOptional() @IsString() @Length(1, 10000) descripcion?: string;
  @IsOptional() @IsString() @Length(1, 2000) imagen_url?: string;
  @IsOptional() @Allow() tags?: unknown;
  @IsOptional() @IsInt() orden?: number;
}

class MetricaDto {
  @IsNumber() valor: number;
  @IsOptional() @IsString() @Length(1, 20) sufijo?: string;
  @IsString() @Length(1, 150) etiqueta: string;
  @IsOptional() @IsInt() orden?: number;
}

class UpdateProyectoDto extends PartialType(ProyectoDto) {}
class UpdateMetricaDto extends PartialType(MetricaDto) {}

@ApiTags('Info General & Contenido')
@Controller()
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class InfoGeneralController {
  constructor(private infoService: InfoGeneralService) {}

  // ========== INFO GENERAL (CMS) ==========
  @Get('info-general')
  @ApiOperation({ summary: 'Obtener toda la información general (público)' })
  findAllInfo() {
    return this.infoService.findAllInfo();
  }

  @Get('info-general/:seccion')
  @ApiOperation({ summary: 'Obtener info por sección' })
  findBySeccion(@Param('seccion') seccion: string) {
    return this.infoService.findInfoBySeccion(seccion);
  }

  @Put('info-general')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear o actualizar sección de info (admin)' })
  upsertInfo(@Request() req, @Body() data: InfoDto) {
    return this.infoService.upsertInfo(data.seccion, data.contenido, req.user.sub);
  }

  // ========== MÓDULOS DEL COTIZADOR ==========
  @Get('cotizador-modulos')
  @ApiOperation({ summary: 'Obtener módulos y opciones del cotizador (público / admin)' })
  findAllCotizadorModulos(@Query('all') all?: string) {
    const activeOnly = all !== 'true';
    return this.infoService.findAllCotizadorModulos(activeOnly);
  }

  @Put('cotizador-modulos')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear o actualizar módulo del cotizador (admin)' })
  upsertCotizadorModulo(
    @Body()
    data: ModuloDto,
  ) {
    return this.infoService.upsertCotizadorModulo(data);
  }

  @Delete('cotizador-modulos/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar módulo del cotizador (admin)' })
  deleteCotizadorModulo(@Param('id') id: string) {
    return this.infoService.deleteCotizadorModulo(id);
  }

  // ========== PROYECTOS / PORTAFOLIO ==========
  @Get('proyectos-portafolio')
  @ApiOperation({ summary: 'Obtener proyectos del portafolio' })
  findAllProyectos(@Query('all') all?: string) {
    const activeOnly = all !== 'true';
    return this.infoService.findAllProyectos(activeOnly);
  }

  @Post('proyectos-portafolio')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear proyecto en el portafolio (admin)' })
  createProyecto(@Body() data: ProyectoDto) {
    return this.infoService.createProyecto(data);
  }

  @Put('proyectos-portafolio/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar proyecto en el portafolio (admin)' })
  updateProyecto(@Param('id') id: string, @Body() data: UpdateProyectoDto) {
    return this.infoService.updateProyecto(id, data);
  }

  @Delete('proyectos-portafolio/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar proyecto del portafolio (admin)' })
  deleteProyecto(@Param('id') id: string) {
    return this.infoService.deleteProyecto(id);
  }

  // Compatibilidad con endpoint /resultados
  @Get('resultados')
  findAllResultadosLegacy(@Query('all') all?: string) {
    return this.findAllProyectos(all);
  }

  @Post('resultados')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  createResultadoLegacy(@Body() data: ProyectoDto) {
    return this.createProyecto(data);
  }

  @Put('resultados/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  updateResultadoLegacy(@Param('id') id: string, @Body() data: UpdateProyectoDto) {
    return this.updateProyecto(id, data);
  }

  @Delete('resultados/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  deleteResultadoLegacy(@Param('id') id: string) {
    return this.deleteProyecto(id);
  }

  // ========== MÉTRICAS DE LA LANDING ==========
  @Get('metricas-landing')
  @ApiOperation({ summary: 'Obtener métricas clave de la landing (público)' })
  findAllMetricas(@Query('all') all?: string) {
    const activeOnly = all !== 'true';
    return this.infoService.findAllMetricas(activeOnly);
  }

  @Post('metricas-landing')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear métrica (admin)' })
  createMetrica(@Body() data: MetricaDto) {
    return this.infoService.createMetrica(data);
  }

  @Put('metricas-landing/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar métrica (admin)' })
  updateMetrica(@Param('id') id: string, @Body() data: UpdateMetricaDto) {
    return this.infoService.updateMetrica(id, data);
  }

  @Delete('metricas-landing/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar métrica (admin)' })
  deleteMetrica(@Param('id') id: string) {
    return this.infoService.deleteMetrica(id);
  }
}
