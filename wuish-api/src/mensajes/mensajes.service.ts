import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MensajesService {
  constructor(private prisma: PrismaService) {}

  async findByUsuario(usuarioId: string) {
    return this.prisma.mensaje.findMany({
      where: { usuario_id: usuarioId },
      include: {
        usuario: { select: { id: true, nombres: true, apellidos: true, correo: true } },
        solicitud: { select: { id: true, tipo: true, estado: true } },
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.mensaje.findMany({
      include: {
        usuario: { select: { id: true, nombres: true, apellidos: true, correo: true } },
        solicitud: { select: { id: true, tipo: true, estado: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async create(data: {
    usuario_id: string;
    solicitud_id?: string;
    asunto?: string;
    contenido: string;
    es_admin?: boolean;
  }) {
    const msg = await this.prisma.mensaje.create({
      data: {
        usuario_id: data.usuario_id,
        solicitud_id: data.solicitud_id || null,
        asunto: data.asunto || null,
        contenido: data.contenido,
        es_admin: data.es_admin ?? false,
        leido: false,
      },
      include: {
        usuario: { select: { id: true, nombres: true, apellidos: true, correo: true } },
      },
    });

    // Notificaciones automáticas por nuevo mensaje
    try {
      if (data.es_admin) {
        // Mensaje de Admin -> Alerta para el Usuario
        await this.prisma.notificacion.create({
          data: {
            usuario_id: data.usuario_id,
            para_admin: false,
            titulo: 'Nuevo Mensaje del Equipo WUISH',
            mensaje: data.contenido.slice(0, 90) + (data.contenido.length > 90 ? '...' : ''),
            tipo: 'mensaje_admin',
            referencia_id: msg.id,
          },
        });
      } else {
        // Mensaje del Usuario -> Alerta para el Admin con nombre del remitente
        const clientName = `${msg.usuario?.nombres || 'Cliente'} ${msg.usuario?.apellidos || ''}`.trim();
        await this.prisma.notificacion.create({
          data: {
            para_admin: true,
            titulo: `Nuevo mensaje de ${clientName}`,
            mensaje: data.contenido.slice(0, 90) + (data.contenido.length > 90 ? '...' : ''),
            tipo: 'mensaje_usuario',
            referencia_id: msg.id,
          },
        });
      }
    } catch (err) {
      console.error('Error creando notificación de mensaje:', err);
    }

    return msg;
  }

  async markAsRead(id: string) {
    return this.prisma.mensaje.update({
      where: { id },
      data: { leido: true },
    });
  }

  async countUnread(usuarioId: string) {
    return this.prisma.mensaje.count({
      where: { usuario_id: usuarioId, leido: false },
    });
  }
}
