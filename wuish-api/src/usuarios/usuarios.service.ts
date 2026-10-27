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

  async create(data: {
    nombres: string;
    apellidos: string;
    numero_cedula: string;
    tipo_documento?: string;
    correo: string;
    password?: string;
    telefono?: string;
    empresa?: string;
    cargo?: string;
    rol?: string;
    permisos?: any;
    fecha_nacimiento?: string | Date;
  }) {
    const existing = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { correo: data.correo.toLowerCase().trim() },
          { numero_cedula: data.numero_cedula.trim() },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException('Ya existe un usuario con este correo electrónico o cédula');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password || 'wuish2026', salt);

    const user = await this.prisma.usuario.create({
      data: {
        nombres: data.nombres.trim(),
        apellidos: data.apellidos.trim(),
        numero_cedula: data.numero_cedula.trim(),
        tipo_documento: data.tipo_documento || 'CC',
        correo: data.correo.toLowerCase().trim(),
        password_hash,
        telefono: data.telefono?.trim() || null,
        empresa: data.empresa?.trim() || null,
        cargo: data.cargo?.trim() || null,
        rol: data.rol || 'usuario',
        permisos: data.permisos || null,
        fecha_nacimiento: data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : new Date('2000-01-01'),
      },
    });

    const { password_hash: _, ...sanitized } = user;
    return sanitized;
  }

  async updateAdmin(
    id: string,
    data: {
      nombres?: string;
      apellidos?: string;
      numero_cedula?: string;
      tipo_documento?: string;
      correo?: string;
      telefono?: string;
      empresa?: string;
      cargo?: string;
      rol?: string;
      permisos?: any;
      password?: string;
      fecha_nacimiento?: string | Date;
    },
  ) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const updateData: any = { ...data, updated_at: new Date() };

    if (data.correo) {
      updateData.correo = data.correo.toLowerCase().trim();
    }
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(data.password, salt);
      delete updateData.password;
    }
    if (data.fecha_nacimiento) {
      updateData.fecha_nacimiento = new Date(data.fecha_nacimiento);
    }

    const updated = await this.prisma.usuario.update({
      where: { id },
      data: updateData,
    });

    const { password_hash: _, ...sanitized } = updated;
    return sanitized;
  }

  async delete(id: string, currentAdminId: string) {
    if (id === currentAdminId) {
      throw new BadRequestException('No puedes eliminar tu propia cuenta');
    }
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    await this.prisma.$transaction(async (tx) => {
      await tx.notificacion.deleteMany({ where: { usuario_id: id } });
      await tx.infoGeneral.updateMany({ where: { updated_by: id }, data: { updated_by: null } });
      await tx.comentario.updateMany({ where: { usuario_id: id }, data: { usuario_id: null } });
      await tx.solicitud.updateMany({ where: { admin_asignado_id: id }, data: { admin_asignado_id: null } });
      await tx.mensaje.deleteMany({ where: { usuario_id: id } });

      const userSolicitudes = await tx.solicitud.findMany({ where: { usuario_id: id }, select: { id: true } });
      for (const sol of userSolicitudes) {
        await tx.solicitudHistorialEstado.deleteMany({ where: { solicitud_id: sol.id } });
        await tx.mensaje.deleteMany({ where: { solicitud_id: sol.id } });
        await tx.solicitud.delete({ where: { id: sol.id } });
      }

      await tx.usuario.delete({ where: { id } });
    });

    return { success: true, message: 'Usuario eliminado exitosamente' };
  }

  async count() {
    return this.prisma.usuario.count();
  }
}
