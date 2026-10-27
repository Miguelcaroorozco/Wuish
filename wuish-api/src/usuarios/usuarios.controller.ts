import { Controller, Get, Post, Put, Delete, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { UsuariosService } from './usuarios.service';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos los usuarios (admin)' })
  findAll() {
    return this.usuariosService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nuevo usuario (admin)' })
  create(
    @Body()
    data: {
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
      fecha_nacimiento?: string;
    },
  ) {
    return this.usuariosService.create(data);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener datos del usuario actual' })
  getMe(@Request() req) {
    return this.usuariosService.findOne(req.user.sub);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar perfil del usuario actual' })
  updateMe(
    @Request() req,
    @Body()
    data: {
      nombres?: string;
      apellidos?: string;
      telefono?: string;
      empresa?: string;
      cargo?: string;
      preferencias?: any;
      permisos?: string[];
    },
  ) {
    const isAdmin = req.user.rol === 'admin' || req.user.rol === 'administrador';
    const { permisos, ...profileData } = data;
    return this.usuariosService.update(req.user.sub, {
      ...profileData,
      ...(isAdmin && permisos !== undefined ? { permisos } : {}),
    });
  }

  @Put('me/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar contraseña del usuario actual' })
  changePassword(
    @Request() req,
    @Body() data: { currentPassword: string; newPassword: string },
  ) {
    return this.usuariosService.changePassword(
      req.user.sub,
      data.currentPassword,
      data.newPassword,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario por ID (admin)' })
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar usuario por ID (admin)' })
  updateAdmin(
    @Param('id') id: string,
    @Body()
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
      fecha_nacimiento?: string;
    },
  ) {
    return this.usuariosService.updateAdmin(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar usuario por ID (admin)' })
  delete(@Param('id') id: string, @Request() req) {
    return this.usuariosService.delete(id, req.user.sub);
  }
}
