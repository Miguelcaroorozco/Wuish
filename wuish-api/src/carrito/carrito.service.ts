import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CarritoService {
  constructor(private prisma: PrismaService) {}

  async findByUsuario(usuarioId: string) {
    return this.prisma.carritoItem.findMany({
      where: { usuario_id: usuarioId },
      include: {
        plan: {
          include: { tipo_servicio: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async addItem(usuarioId: string, planId: string, cantidad = 1) {
    // Check if plan already in cart
    const existing = await this.prisma.carritoItem.findFirst({
      where: { usuario_id: usuarioId, plan_id: planId },
    });

    if (existing) {
      return this.prisma.carritoItem.update({
        where: { id: existing.id },
        data: { cantidad: existing.cantidad + cantidad },
        include: { plan: { include: { tipo_servicio: true } } },
      });
    }

    return this.prisma.carritoItem.create({
      data: {
        usuario_id: usuarioId,
        plan_id: planId,
        cantidad,
      },
      include: { plan: { include: { tipo_servicio: true } } },
    });
  }

  async updateCantidad(id: string, cantidad: number) {
    return this.prisma.carritoItem.update({
      where: { id },
      data: { cantidad },
      include: { plan: { include: { tipo_servicio: true } } },
    });
  }

  async removeItem(id: string) {
    return this.prisma.carritoItem.delete({ where: { id } });
  }

  async clearCart(usuarioId: string) {
    return this.prisma.carritoItem.deleteMany({
      where: { usuario_id: usuarioId },
    });
  }
}
