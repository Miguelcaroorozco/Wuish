import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetricasLandingService {
  constructor(private prisma: PrismaService) {}

  async getAll(includeAll = false) {
    return this.prisma.metricaLanding.findMany({
      where: includeAll ? undefined : { activo: true },
      orderBy: { orden: 'asc' },
    });
  }

  async create(data: { valor: number; sufijo?: string; etiqueta: string; orden?: number }) {
    return this.prisma.metricaLanding.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.metricaLanding.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.metricaLanding.delete({ where: { id } });
  }
}
