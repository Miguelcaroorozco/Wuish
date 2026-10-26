import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

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

  async update(
    id: string,
    data: {
      nombres?: string;
      apellidos?: string;
      telefono?: string;
      correo?: string;
      empresa?: string;
      cargo?: string;
      preferencias?: any;
    },
  ) {
    const user = await this.prisma.usuario.update({
      where: { id },
      data: { ...(data as any), updated_at: new Date() },
    });
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (!user.password_hash) {
      throw new BadRequestException('El usuario no tiene una clave configurada');
    }

    const isValid = await bcrypt.compare(currentPass, user.password_hash);
    if (!isValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPass, salt);

    await this.prisma.usuario.update({
      where: { id: userId },
      data: { password_hash, updated_at: new Date() },
    });

    return { success: true, message: 'Contraseña actualizada exitosamente' };
  }

  async count() {
    return this.prisma.usuario.count();
  }
}
