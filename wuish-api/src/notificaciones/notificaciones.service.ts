import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    usuario_id?: string;
    para_admin?: boolean;
    titulo: string;
    mensaje: string;
    tipo: string;
    referencia_id?: string;
  }) {
    return this.prisma.notificacion.create({
      data: {
        usuario_id: data.usuario_id || null,
        para_admin: data.para_admin ?? false,
        titulo: data.titulo,
        mensaje: data.mensaje,
        tipo: data.tipo,
        referencia_id: data.referencia_id || null,
        leido: false,
      },
    });
  }

  async findForUser(usuarioId: string) {
    return this.prisma.notificacion.findMany({
      where: {
        usuario_id: usuarioId,
        para_admin: false,
      },
      orderBy: { created_at: 'desc' },
      take: 40,
    });
  }

  async findForAdmin() {
    return this.prisma.notificacion.findMany({
      where: {
        para_admin: true,
      },
      orderBy: { created_at: 'desc' },
      take: 40,
    });
  }

  async countUnread(usuarioId: string, isAdmin: boolean) {
    if (isAdmin) {
      return this.prisma.notificacion.count({
        where: { para_admin: true, leido: false },
      });
    }
    return this.prisma.notificacion.count({
      where: { usuario_id: usuarioId, para_admin: false, leido: false },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notificacion.update({
      where: { id },
      data: { leido: true },
    });
  }

  async markAllAsRead(usuarioId: string, isAdmin: boolean) {
    if (isAdmin) {
      return this.prisma.notificacion.updateMany({
        where: { para_admin: true, leido: false },
        data: { leido: true },
      });
    }
    return this.prisma.notificacion.updateMany({
      where: { usuario_id: usuarioId, para_admin: false, leido: false },
      data: { leido: true },
    });
  }
}
