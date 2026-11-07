import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { MensajesService } from './mensajes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class CreateMensajeDto {
  @IsOptional() @Matches(UUID_PATTERN) solicitud_id?: string;
  @IsOptional() @IsString() @Length(1, 150) asunto?: string;
  @IsString() @Length(1, 5000) contenido: string;
  @IsOptional() @Matches(UUID_PATTERN) usuario_id?: string;
}

@ApiTags('Mensajes')
@Controller('mensajes')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
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
    @Body() data: CreateMensajeDto,
  ) {
    const isAdmin = req.user.rol === 'admin' || req.user.rol === 'administrador';
    const targetUserId = (isAdmin && data.usuario_id) ? data.usuario_id : req.user.sub;
    const esAdmin = isAdmin && !!data.usuario_id;

    return this.mensajesService.create({
      requester_id: req.user.sub,
      requester_is_admin: isAdmin,
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
  markAsRead(@Param('id') id: string, @Request() req) {
    const isAdmin = req.user.rol === 'admin' || req.user.rol === 'administrador';
    return this.mensajesService.markAsRead(id, req.user.sub, isAdmin);
  }
}
