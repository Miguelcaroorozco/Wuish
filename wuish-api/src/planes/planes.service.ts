import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlanesService {
  constructor(private prisma: PrismaService) {}

  // ========== TIPOS DE SERVICIO ==========
  async findAllTiposServicio() {
    return this.prisma.tipoServicio.findMany({
      include: { planes: { where: { activo: true } } },
    });
  }

  async createTipoServicio(data: { nombre: string; descripcion?: string }) {
    return this.prisma.tipoServicio.create({ data });
  }

  async updateTipoServicio(id: string, data: { nombre?: string; descripcion?: string }) {
    return this.prisma.tipoServicio.update({ where: { id }, data });
  }

  async deleteTipoServicio(id: string) {
    return this.prisma.tipoServicio.delete({ where: { id } });
  }

  // ========== PLANES ==========
  async findAllPlanes(activeOnly = false) {
    return this.prisma.plan.findMany({
      where: activeOnly ? { activo: true } : undefined,
      include: { tipo_servicio: true },
      orderBy: { precio: 'asc' },
    });
  }

  async findOnePlan(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
      include: { tipo_servicio: true },
    });
    if (!plan) throw new NotFoundException('Plan no encontrado');
    return plan;
  }

  async createPlan(data: {
    tipo_servicio_id: string;
    nombre: string;
    descripcion?: string;
    precio?: number;
    caracteristicas?: any;
  }) {
    return this.prisma.plan.create({
      data: {
        tipo_servicio_id: data.tipo_servicio_id,
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        caracteristicas: data.caracteristicas,
        activo: true,
      },
      include: { tipo_servicio: true },
    });
  }

  async updatePlan(id: string, data: {
    nombre?: string;
    descripcion?: string;
    precio?: number;
    caracteristicas?: any;
    activo?: boolean;
    tipo_servicio_id?: string;
  }) {
    return this.prisma.plan.update({
      where: { id },
      data,
      include: { tipo_servicio: true },
    });
  }

  async deletePlan(id: string) {
    // Soft delete by setting activo = false
    return this.prisma.plan.update({
      where: { id },
      data: { activo: false },
    });
  }
}
