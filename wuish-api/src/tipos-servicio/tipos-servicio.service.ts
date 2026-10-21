import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TiposServicioService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.tipoServicio.findMany({ orderBy: { nombre: 'asc' } });
  }

  async create(data: { nombre: string; descripcion?: string }) {
    return this.prisma.tipoServicio.create({ data });
  }

  async update(id: string, data: { nombre?: string; descripcion?: string }) {
    return this.prisma.tipoServicio.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.tipoServicio.delete({ where: { id } });
  }
}
