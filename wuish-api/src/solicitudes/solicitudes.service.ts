import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SolicitudesService {
  constructor(private prisma: PrismaService) {}

  async findByUsuario(usuarioId: string) {
    return this.prisma.solicitud.findMany({
      where: { usuario_id: usuarioId },
      include: {
        plan: { include: { tipo_servicio: true } },
        admin_asignado: { select: { id: true, nombres: true, apellidos: true } },
        historial: { orderBy: { changed_at: 'desc' } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findAll(filters?: { estado?: string; tipo?: string }) {
    return this.prisma.solicitud.findMany({
      where: {
        ...(filters?.estado ? { estado: filters.estado } : {}),
        ...(filters?.tipo ? { tipo: filters.tipo } : {}),
      },
      include: {
        usuario: { select: { id: true, nombres: true, apellidos: true, correo: true, telefono: true } },
        plan: { include: { tipo_servicio: true } },
        admin_asignado: { select: { id: true, nombres: true, apellidos: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, nombres: true, apellidos: true, correo: true, telefono: true, numero_cedula: true } },
        plan: { include: { tipo_servicio: true } },
        admin_asignado: { select: { id: true, nombres: true, apellidos: true } },
        ajustes: {
          include: { respondidoPor: { select: { id: true, nombres: true, apellidos: true } } },
          orderBy: { created_at: 'desc' },
        },
        historial: { orderBy: { changed_at: 'desc' } },
        mensajes: { orderBy: { created_at: 'desc' } },
      },
    });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
    return solicitud;
  }

  async create(data: {
    usuario_id: string;
    tipo: string;
    descripcion?: string;
    plan_id?: string;
  }) {
    const solicitud = await this.prisma.solicitud.create({
      data: {
        usuario_id: data.usuario_id,
        tipo: data.tipo,
        estado: 'pendiente',
        descripcion: data.descripcion,
        plan_id: data.plan_id || null,
        fecha_solicitud: new Date(),
      },
      include: {
        plan: { include: { tipo_servicio: true } },
        usuario: { select: { id: true, nombres: true, apellidos: true, correo: true } },
      },
    });

    // Create initial history entry
    await this.prisma.solicitudHistorialEstado.create({
      data: {
        solicitud_id: solicitud.id,
        estado_anterior: null,
        estado_nuevo: 'pendiente',
        motivo: 'Solicitud creada',
      },
    });

    return solicitud;
  }

  async updateEstado(id: string, data: {
    estado: string;
    motivo?: string;
    admin_asignado_id?: string;
  }) {
    const current = await this.prisma.solicitud.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Solicitud no encontrada');

    const updated = await this.prisma.solicitud.update({
      where: { id },
      data: {
        estado: data.estado,
        admin_asignado_id: data.admin_asignado_id || current.admin_asignado_id,
        updated_at: new Date(),
      },
      include: {
        usuario: { select: { id: true, nombres: true, apellidos: true, correo: true } },
        plan: true,
      },
    });

    // Log state change
    await this.prisma.solicitudHistorialEstado.create({
      data: {
        solicitud_id: id,
        estado_anterior: current.estado,
        estado_nuevo: data.estado,
        motivo: data.motivo || null,
      },
    });

    return updated;
  }

  async addAjuste(solicitudId: string, data: {
    descripcion_ajuste: string;
    respondido_por: string;
  }) {
    return this.prisma.solicitudAjuste.create({
      data: {
        solicitud_id: solicitudId,
        descripcion_ajuste: data.descripcion_ajuste,
        respondido_por: data.respondido_por,
      },
      include: {
        respondidoPor: { select: { id: true, nombres: true, apellidos: true } },
      },
    });
  }

  async delete(id: string) {
    await this.prisma.solicitudHistorialEstado.deleteMany({ where: { solicitud_id: id } });
    await this.prisma.solicitudAjuste.deleteMany({ where: { solicitud_id: id } });
    await this.prisma.mensaje.deleteMany({ where: { solicitud_id: id } });
    return this.prisma.solicitud.delete({ where: { id } });
  }
}
