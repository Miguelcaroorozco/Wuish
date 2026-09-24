import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.usuario.findMany({
      orderBy: { created_at: 'desc' },
    });
    return users.map(({ password_hash, ...u }) => u);
  }

  async findOne(id: string) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }

  async update(id: string, data: { nombres?: string; apellidos?: string; telefono?: string; correo?: string }) {
    const user = await this.prisma.usuario.update({
      where: { id },
      data: { ...data, updated_at: new Date() },
    });
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }

  async count() {
    return this.prisma.usuario.count();
  }
}
