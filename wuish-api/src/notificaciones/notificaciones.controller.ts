import { Controller, Get, Put, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Notificaciones')
@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificacionesController {
  constructor(private notificacionesService: NotificacionesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificaciones del usuario o del admin' })
  findMine(@Request() req) {
    const isAdmin = req.user.rol === 'admin' || req.user.rol === 'administrador';
    if (isAdmin) {
      return this.notificacionesService.findForAdmin();
    }
    return this.notificacionesService.findForUser(req.user.sub);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Contar notificaciones no leídas' })
  countUnread(@Request() req) {
    const isAdmin = req.user.rol === 'admin' || req.user.rol === 'administrador';
    return this.notificacionesService.countUnread(req.user.sub, isAdmin);
  }

  @Put('leer-todas')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  markAllAsRead(@Request() req) {
    const isAdmin = req.user.rol === 'admin' || req.user.rol === 'administrador';
    return this.notificacionesService.markAllAsRead(req.user.sub, isAdmin);
  }

  @Put(':id/leer')
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  markAsRead(@Param('id') id: string) {
    return this.notificacionesService.markAsRead(id);
  }
}
