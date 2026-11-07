import { Controller, Post, Body, Get, UseGuards, Request, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsDateString, Length, MinLength } from 'class-validator';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

class LoginDto {
  @IsEmail()
  correo: string;

  @IsString()
  @MinLength(8)
  password: string;
}

class RegisterDto {
  @IsString()
  @Length(1, 100)
  nombres: string;

  @IsString()
  @Length(1, 100)
  apellidos: string;

  @IsString()
  @Length(3, 30)
  numero_cedula: string;

  @IsString()
  @Length(2, 20)
  tipo_documento: string;

  @IsDateString()
  fecha_nacimiento: string;

  @IsOptional()
  @IsString()
  @Length(7, 20)
  telefono?: string;

  @IsEmail()
  correo: string;

  @IsString()
  @MinLength(8)
  password: string;
}

@ApiTags('Auth')
@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Iniciar sesión con correo y contraseña' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.correo, dto.password);
  }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub);
  }
}
