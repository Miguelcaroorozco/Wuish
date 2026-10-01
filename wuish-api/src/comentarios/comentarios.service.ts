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
    return this.prisma.comentario.create({
      data: {
        usuario_id: data.usuario_id || null,
        contenido: data.contenido,
        calificacion: data.calificacion,
        mostrar_en_pagina: false,
      },
    });
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
