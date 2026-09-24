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
  @ApiOperation({ summary: 'Enviar mensaje' })
  create(@Request() req, @Body() data: { solicitud_id?: string; asunto?: string; contenido: string }) {
    return this.mensajesService.create({
      usuario_id: req.user.sub,
      ...data,
    });
  }

  @Put(':id/leer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar mensaje como leído' })
  markAsRead(@Param('id') id: string) {
    return this.mensajesService.markAsRead(id);
  }
}
