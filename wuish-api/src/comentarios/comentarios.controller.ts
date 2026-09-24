import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ComentariosService } from './comentarios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@ApiTags('Comentarios')
@Controller('comentarios')
export class ComentariosController {
  constructor(private comentariosService: ComentariosService) {}

  @Get('publicos')
  @ApiOperation({ summary: 'Obtener comentarios visibles en la página (público)' })
  findPublicos() {
    return this.comentariosService.findPublicos();
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos los comentarios (admin)' })
  findAll() {
    return this.comentariosService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crear comentario (público o autenticado)' })
  create(@Request() req, @Body() data: { contenido: string; calificacion?: number; usuario_id?: string }) {
    return this.comentariosService.create({
      usuario_id: data.usuario_id || undefined,
      contenido: data.contenido,
      calificacion: data.calificacion,
    });
  }

  @Put(':id/mostrar')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activar/desactivar comentario en página (admin)' })
  toggleMostrar(@Param('id') id: string, @Body() data: { mostrar: boolean; orden?: number }) {
    return this.comentariosService.toggleMostrar(id, data.mostrar, data.orden);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar comentario (admin)' })
  remove(@Param('id') id: string) {
    return this.comentariosService.delete(id);
  }
}
