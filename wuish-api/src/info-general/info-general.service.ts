import { Injectable, NotFoundException } from '@nestjs/common';
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

  // ========== EQUIPO ==========
  async findAllEquipo() {
    return this.prisma.equipo.findMany({
      orderBy: { orden: 'asc' },
    });
  }

  async createEquipo(data: { nombre: string; cargo?: string; foto_url?: string; descripcion?: string; orden?: number }) {
    return this.prisma.equipo.create({ data });
  }

  async updateEquipo(id: string, data: { nombre?: string; cargo?: string; foto_url?: string; descripcion?: string; orden?: number }) {
    return this.prisma.equipo.update({ where: { id }, data });
  }

  async deleteEquipo(id: string) {
    return this.prisma.equipo.delete({ where: { id } });
  }

  // ========== RESULTADOS ==========
  async findAllResultados(activeOnly = true) {
    return this.prisma.resultado.findMany({
      where: activeOnly ? { activo: true } : undefined,
      orderBy: { orden: 'asc' },
    });
  }

  async createResultado(data: { titulo: string; descripcion?: string; imagen_url?: string; orden?: number }) {
    return this.prisma.resultado.create({ data: { ...data, activo: true } });
  }

  async updateResultado(id: string, data: { titulo?: string; descripcion?: string; imagen_url?: string; activo?: boolean; orden?: number }) {
    return this.prisma.resultado.update({ where: { id }, data });
  }

  async deleteResultado(id: string) {
    return this.prisma.resultado.delete({ where: { id } });
  }

  // ========== PASOS DEL PROCESO ==========
  async findAllPasos() {
    return this.prisma.pasoProceso.findMany({
      orderBy: { numero_paso: 'asc' },
    });
  }

  async upsertPaso(data: { numero_paso: number; titulo: string; descripcion?: string; icono?: string }) {
    const existing = await this.prisma.pasoProceso.findFirst({ where: { numero_paso: data.numero_paso } });
    if (existing) {
      return this.prisma.pasoProceso.update({
        where: { id: existing.id },
        data,
      });
    }
    return this.prisma.pasoProceso.create({ data });
  }

  async deletePaso(id: string) {
    return this.prisma.pasoProceso.delete({ where: { id } });
  }
}
