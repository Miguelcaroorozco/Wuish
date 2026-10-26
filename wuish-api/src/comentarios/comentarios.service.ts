import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComentariosService {
  constructor(private prisma: PrismaService) {}

  async findPublicos() {
    return this.prisma.comentario.findMany({
      where: { mostrar_en_pagina: true },
      include: {
        usuario: { select: { id: true, nombres: true, apellidos: true } },
      },
      orderBy: { orden: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.comentario.findMany({
      include: {
        usuario: { select: { id: true, nombres: true, apellidos: true, correo: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async create(data: { usuario_id?: string; contenido: string; calificacion?: number }) {
    const comentario = await this.prisma.comentario.create({
      data: {
        usuario_id: data.usuario_id || null,
        contenido: data.contenido,
        calificacion: data.calificacion,
        mostrar_en_pagina: false,
      },
    });

    // Notificación automática al Administrador de nueva opinión/reseña
    try {
      let authorName = 'Un cliente';
      if (data.usuario_id) {
        const u = await this.prisma.usuario.findUnique({
          where: { id: data.usuario_id },
          select: { nombres: true, apellidos: true },
        });
        if (u) authorName = `${u.nombres} ${u.apellidos || ''}`.trim();
      }
      await this.prisma.notificacion.create({
        data: {
          para_admin: true,
          titulo: `Nueva Opinión de ${authorName}`,
          mensaje: `Calificación: ${data.calificacion || 5}★. "${data.contenido.slice(0, 80)}${data.contenido.length > 80 ? '...' : ''}"`,
          tipo: 'nuevo_comentario',
          referencia_id: comentario.id,
        },
      });
    } catch (err) {
      console.error('Error creando notificación de opinión:', err);
    }

    return comentario;
  }

  async toggleMostrar(id: string, mostrar: boolean, orden?: number) {
    return this.prisma.comentario.update({
      where: { id },
      data: {
        mostrar_en_pagina: mostrar,
        orden: orden ?? undefined,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.comentario.delete({ where: { id } });
  }
}
