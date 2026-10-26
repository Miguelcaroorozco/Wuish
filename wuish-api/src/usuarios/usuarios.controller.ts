import { Controller, Get, Put, Body, UseGuards, Request, Param } from '@nestjs/common';
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
    },
  ) {
    return this.usuariosService.update(req.user.sub, data);
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
}
