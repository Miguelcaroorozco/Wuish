import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InfoGeneralService {
  constructor(private prisma: PrismaService) {}

  // ========== INFO GENERAL (CMS) ==========
  async findAllInfo() {
    return this.prisma.infoGeneral.findMany({
      orderBy: { seccion: 'asc' },
    });
  }

  async findInfoBySeccion(seccion: string) {
    return this.prisma.infoGeneral.findFirst({
      where: { seccion },
    });
  }

  async upsertInfo(seccion: string, contenido: string, updatedBy?: string) {
    const existing = await this.prisma.infoGeneral.findFirst({ where: { seccion } });
    if (existing) {
      return this.prisma.infoGeneral.update({
        where: { id: existing.id },
        data: { contenido, updated_by: updatedBy, updated_at: new Date() },
      });
    }
    return this.prisma.infoGeneral.create({
      data: { seccion, contenido, updated_by: updatedBy },
    });
  }

  // ========== MÓDULOS DEL COTIZADOR ==========
  async findAllCotizadorModulos(activeOnly = false) {
    return this.prisma.cotizadorModulo.findMany({
      where: activeOnly ? { activo: true } : undefined,
      orderBy: { orden: 'asc' },
    });
  }

  async upsertCotizadorModulo(data: {
    id: string;
    nombre: string;
    categoria: string;
    precio_base: number;
    descripcion: string;
    activo?: boolean;
    orden?: number;
  }) {
    const existing = await this.prisma.cotizadorModulo.findUnique({ where: { id: data.id } });
    if (existing) {
      return this.prisma.cotizadorModulo.update({
        where: { id: data.id },
        data: {
          nombre: data.nombre,
          categoria: data.categoria,
          precio_base: data.precio_base,
          descripcion: data.descripcion,
          activo: data.activo !== undefined ? data.activo : existing.activo,
          orden: data.orden !== undefined ? data.orden : existing.orden,
        },
      });
    }
    return this.prisma.cotizadorModulo.create({
      data: {
        id: data.id,
        nombre: data.nombre,
        categoria: data.categoria,
        precio_base: data.precio_base,
        descripcion: data.descripcion,
        activo: data.activo !== undefined ? data.activo : true,
        orden: data.orden || 0,
      },
    });
  }

  async deleteCotizadorModulo(id: string) {
    return this.prisma.cotizadorModulo.delete({ where: { id } });
  }

  // ========== PROYECTOS / PORTAFOLIO ==========
  async findAllProyectos(activeOnly = false) {
    return this.prisma.proyectoPortafolio.findMany({
      where: activeOnly ? { activo: true } : undefined,
      orderBy: { orden: 'asc' },
    });
  }

  async createProyecto(data: {
    titulo: string;
    cliente?: string;
    categoria: string;
    anio?: string;
    descripcion?: string;
    imagen_url?: string;
    tags?: any;
    orden?: number;
  }) {
    return this.prisma.proyectoPortafolio.create({ data });
  }

  async updateProyecto(id: string, data: any) {
    return this.prisma.proyectoPortafolio.update({ where: { id }, data });
  }

  async deleteProyecto(id: string) {
    return this.prisma.proyectoPortafolio.delete({ where: { id } });
  }

  // ========== MÉTRICAS DE LA LANDING ==========
  async findAllMetricas(activeOnly = false) {
    return this.prisma.metricaLanding.findMany({
      where: activeOnly ? { activo: true } : undefined,
      orderBy: { orden: 'asc' },
    });
  }

  async createMetrica(data: { valor: number; sufijo?: string; etiqueta: string; orden?: number }) {
    return this.prisma.metricaLanding.create({ data });
  }

  async updateMetrica(id: string, data: any) {
    return this.prisma.metricaLanding.update({ where: { id }, data });
  }

  async deleteMetrica(id: string) {
    return this.prisma.metricaLanding.delete({ where: { id } });
  }
}
