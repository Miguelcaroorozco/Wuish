import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MensajesService } from './mensajes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@ApiTags('Mensajes')
@Controller('mensajes')
export class MensajesController {
  constructor(private mensajesService: MensajesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar mensajes del usuario' })
  findMine(@Request() req) {
    return this.mensajesService.findByUsuario(req.user.sub);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos los mensajes (admin)' })
  findAll() {
    return this.mensajesService.findAll();
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Contar mensajes no leídos' })
  countUnread(@Request() req) {
    return this.mensajesService.countUnread(req.user.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar mensaje o responder como admin' })
  create(
    @Request() req,
    @Body() data: { solicitud_id?: string; asunto?: string; contenido: string; usuario_id?: string },
  ) {
    const isAdmin = req.user.rol === 'admin' || req.user.rol === 'administrador';
    const targetUserId = (isAdmin && data.usuario_id) ? data.usuario_id : req.user.sub;
    const esAdmin = isAdmin && !!data.usuario_id;

    return this.mensajesService.create({
      usuario_id: targetUserId,
      solicitud_id: data.solicitud_id,
      asunto: data.asunto,
      contenido: data.contenido,
      es_admin: esAdmin,
    });
  }

  @Get('usuario/:usuarioId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar mensajes de un usuario específico (admin)' })
  findByTargetUsuario(@Param('usuarioId') usuarioId: string) {
    return this.mensajesService.findByUsuario(usuarioId);
  }

  @Put(':id/leer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar mensaje como leído' })
  markAsRead(@Param('id') id: string) {
    return this.mensajesService.markAsRead(id);
  }
}
