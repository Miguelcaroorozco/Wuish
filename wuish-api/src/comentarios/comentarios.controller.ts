import { BadRequestException, Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { ComentariosService } from './comentarios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

class CreateComentarioDto {
  @IsString() @Length(1, 2000) contenido: string;
  @IsOptional() @IsInt() @Min(1) @Max(5) calificacion?: number;
  @IsOptional() @IsString() @Length(1, 150) nombre_autor?: string;
  @IsOptional() @IsString() @Length(1, 150) empresa_autor?: string;
  @IsOptional() @IsString() @Length(0, 100) website?: string;
}

class ToggleComentarioDto {
  @IsBoolean() mostrar: boolean;
  @IsOptional() @IsInt() @Min(0) orden?: number;
}

@ApiTags('Comentarios')
@Controller('comentarios')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class ComentariosController {
  constructor(private comentariosService: ComentariosService) {}

  @Get('publicos')
  @ApiOperation({ summary: 'Obtener comentarios visibles en la página (público)' })
  findPublicos() {
    return this.comentariosService.findPublicos();
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos los comentarios (admin)' })
  findAll() {
    return this.comentariosService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crear comentario (público o autenticado)' })
  create(@Body() data: CreateComentarioDto) {
    if (data.website) {
      throw new BadRequestException('Solicitud inválida');
    }

    return this.comentariosService.create({
      contenido: data.contenido,
      calificacion: data.calificacion,
      nombre_autor: data.nombre_autor,
      empresa_autor: data.empresa_autor,
    });
  }

  @Put(':id/mostrar')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activar/desactivar comentario en página (admin)' })
  toggleMostrar(@Param('id') id: string, @Body() data: ToggleComentarioDto) {
    return this.comentariosService.toggleMostrar(id, data.mostrar, data.orden);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar comentario (admin)' })
  remove(@Param('id') id: string) {
    return this.comentariosService.delete(id);
  }
}
