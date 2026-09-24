import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: {
    nombres: string;
    apellidos: string;
    numero_cedula: string;
    tipo_documento: string;
    fecha_nacimiento: string;
    telefono?: string;
    correo: string;
    password: string;
  }) {
    // Check if user already exists
    const existingUser = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { correo: data.correo.toLowerCase() },
          { numero_cedula: data.numero_cedula },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con ese correo o número de cédula');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);

    let birthDate = new Date(data.fecha_nacimiento);
    if (isNaN(birthDate.getTime())) {
      birthDate = new Date('2000-01-01');
    }

    // Create user
    const user = await this.prisma.usuario.create({
      data: {
        nombres: data.nombres,
        apellidos: data.apellidos,
        numero_cedula: data.numero_cedula,
        tipo_documento: data.tipo_documento,
        fecha_nacimiento: birthDate,
        telefono: data.telefono || null,
        correo: data.correo.toLowerCase(),
        password_hash,
        rol: 'usuario',
      },
    });

    // Generate JWT
    const token = this.generateToken(user.id, user.correo, user.rol);

    return {
      success: true,
      message: `¡Registro exitoso! Cuenta activada para ${user.nombres} ${user.apellidos}.`,
      token,
      user: this.sanitizeUser(user),
    };
  }

  async login(correo: string, password: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { correo: correo.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.password_hash) {
      throw new UnauthorizedException('Esta cuenta no tiene contraseña configurada. Contacta al administrador.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.generateToken(user.id, user.correo, user.rol);

    return {
      success: true,
      message: `Sesión iniciada correctamente para ${user.correo}.`,
      token,
      user: this.sanitizeUser(user),
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return this.sanitizeUser(user);
  }

  private generateToken(userId: string, correo: string, rol: string): string {
    return this.jwtService.sign({
      sub: userId,
      correo,
      rol,
    });
  }

  private sanitizeUser(user: any) {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }
}
