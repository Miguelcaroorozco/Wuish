import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CotizadorModulosService {
  constructor(private prisma: PrismaService) {}

  async getAll(includeAll = false) {
    return this.prisma.cotizadorModulo.findMany({
      where: includeAll ? undefined : { activo: true },
      orderBy: [{ categoria: 'asc' }, { orden: 'asc' }],
    });
  }

  async upsert(data: any) {
    return this.prisma.cotizadorModulo.upsert({
      where: { id: data.id },
      update: {
        nombre: data.nombre,
        categoria: data.categoria,
        precio_base: data.precio_base,
        descripcion: data.descripcion,
        activo: data.activo ?? true,
        orden: data.orden ?? 0,
      },
      create: {
        id: data.id,
        nombre: data.nombre,
        categoria: data.categoria,
        precio_base: data.precio_base,
        descripcion: data.descripcion,
        activo: data.activo ?? true,
        orden: data.orden ?? 0,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.cotizadorModulo.delete({ where: { id } });
  }
}
