import { Controller, Get, Post, Put, Delete, Body, UseGuards, Request, Param, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsArray, IsEmail, IsISO8601, IsObject, IsOptional, IsString, Length, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { UsuariosService } from './usuarios.service';

class CreateUserDto {
  @IsString() @Length(1, 100) nombres: string;
  @IsString() @Length(1, 100) apellidos: string;
  @IsString() @Length(3, 30) numero_cedula: string;
  @IsOptional() @IsString() @Length(2, 20) tipo_documento?: string;
  @IsEmail() correo: string;
  @IsString() @MinLength(8) password: string;
  @IsOptional() @IsString() @Length(7, 20) telefono?: string;
  @IsOptional() @IsString() @Length(1, 150) empresa?: string;
  @IsOptional() @IsString() @Length(1, 100) cargo?: string;
  @IsOptional() @IsString() @Length(1, 20) rol?: string;
  @IsOptional() @IsArray() permisos?: string[];
  @IsOptional() @IsISO8601() fecha_nacimiento?: string;
}

class UpdateMeDto {
  @IsOptional() @IsString() @Length(1, 100) nombres?: string;
  @IsOptional() @IsString() @Length(1, 100) apellidos?: string;
  @IsOptional() @IsString() @Length(7, 20) telefono?: string;
  @IsOptional() @IsEmail() correo?: string;
  @IsOptional() @IsString() @Length(1, 150) empresa?: string;
  @IsOptional() @IsString() @Length(1, 100) cargo?: string;
  @IsOptional() @IsObject() preferencias?: Record<string, unknown>;
  @IsOptional() @IsArray() permisos?: string[];
}

class ChangePasswordDto {
  @IsString() @MinLength(8) currentPassword: string;
  @IsString() @MinLength(8) newPassword: string;
}

class UpdateAdminDto {
  @IsOptional() @IsString() @Length(1, 100) nombres?: string;
  @IsOptional() @IsString() @Length(1, 100) apellidos?: string;
  @IsOptional() @IsString() @Length(3, 30) numero_cedula?: string;
  @IsOptional() @IsString() @Length(2, 20) tipo_documento?: string;
  @IsOptional() @IsEmail() correo?: string;
  @IsOptional() @IsString() @Length(7, 20) telefono?: string;
  @IsOptional() @IsString() @Length(1, 150) empresa?: string;
  @IsOptional() @IsString() @Length(1, 100) cargo?: string;
  @IsOptional() @IsString() @Length(1, 20) rol?: string;
  @IsOptional() @IsArray() permisos?: string[];
  @IsOptional() @IsString() @MinLength(8) password?: string;
  @IsOptional() @IsISO8601() fecha_nacimiento?: string;
}

@ApiTags('Usuarios')
@Controller('usuarios')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
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
    @Body() data: CreateUserDto,
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
    @Body() data: UpdateMeDto,
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
    @Body() data: ChangePasswordDto,
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
    @Body() data: UpdateAdminDto,
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
