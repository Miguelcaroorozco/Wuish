import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProyectosPortafolioService {
  constructor(private prisma: PrismaService) {}

  async getAll(includeAll = false) {
    return this.prisma.proyectoPortafolio.findMany({
      where: includeAll ? undefined : { activo: true },
      orderBy: [{ orden: 'asc' }, { created_at: 'desc' }],
    });
  }

  async create(data: any) {
    return this.prisma.proyectoPortafolio.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.proyectoPortafolio.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.proyectoPortafolio.delete({ where: { id } });
  }
}
