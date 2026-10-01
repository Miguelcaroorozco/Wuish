import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InfoGeneralService } from './info-general.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@ApiTags('Info General')
@Controller()
export class InfoGeneralController {
  constructor(private infoService: InfoGeneralService) {}

  // ========== INFO GENERAL (Público) ==========
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
  upsertInfo(@Request() req, @Body() data: { seccion: string; contenido: string }) {
    return this.infoService.upsertInfo(data.seccion, data.contenido, req.user.sub);
  }

  // ========== EQUIPO (Público + Admin CRUD) ==========
  @Get('equipo')
  @ApiOperation({ summary: 'Obtener miembros del equipo (público)' })
  findAllEquipo() {
    return this.infoService.findAllEquipo();
  }

  @Post('equipo')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agregar miembro al equipo (admin)' })
  createEquipo(@Body() data: { nombre: string; cargo?: string; foto_url?: string; descripcion?: string; orden?: number }) {
    return this.infoService.createEquipo(data);
  }

  @Put('equipo/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar miembro del equipo (admin)' })
  updateEquipo(@Param('id') id: string, @Body() data: any) {
    return this.infoService.updateEquipo(id, data);
  }

  @Delete('equipo/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar miembro del equipo (admin)' })
  deleteEquipo(@Param('id') id: string) {
    return this.infoService.deleteEquipo(id);
  }

  // ========== RESULTADOS (Público + Admin CRUD) ==========
  @Get('resultados')
  @ApiOperation({ summary: 'Obtener resultados/portfolio (público)' })
  findAllResultados(@Query('all') all?: string) {
    return this.infoService.findAllResultados(all !== 'true');
  }

  @Post('resultados')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear resultado (admin)' })
  createResultado(@Body() data: { titulo: string; descripcion?: string; imagen_url?: string; orden?: number }) {
    return this.infoService.createResultado(data);
  }

  @Put('resultados/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar resultado (admin)' })
  updateResultado(@Param('id') id: string, @Body() data: any) {
    return this.infoService.updateResultado(id, data);
  }

  @Delete('resultados/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar resultado (admin)' })
  deleteResultado(@Param('id') id: string) {
    return this.infoService.deleteResultado(id);
  }

  // ========== PASOS DEL PROCESO (Público + Admin) ==========
  @Get('pasos-proceso')
  @ApiOperation({ summary: 'Obtener pasos del proceso (público)' })
  findAllPasos() {
    return this.infoService.findAllPasos();
  }

  @Put('pasos-proceso')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear o actualizar paso del proceso (admin)' })
  upsertPaso(@Body() data: { numero_paso: number; titulo: string; descripcion?: string; icono?: string }) {
    return this.infoService.upsertPaso(data);
  }

  @Delete('pasos-proceso/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar paso del proceso (admin)' })
  deletePaso(@Param('id') id: string) {
    return this.infoService.deletePaso(id);
  }
}
