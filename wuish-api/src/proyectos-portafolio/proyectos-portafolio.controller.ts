import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Allow, IsInt, IsOptional, IsString, Length } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ProyectosPortafolioService } from './proyectos-portafolio.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

class ProyectoDto {
  @IsString() @Length(1, 150) titulo: string;
  @IsOptional() @IsString() @Length(1, 150) cliente?: string;
  @IsString() @Length(1, 50) categoria: string;
  @IsOptional() @IsString() @Length(1, 10) anio?: string;
  @IsOptional() @IsString() @Length(1, 10000) descripcion?: string;
  @IsOptional() @IsString() @Length(1, 2000) imagen_url?: string;
  @IsOptional() @Allow() tags?: unknown;
  @IsOptional() @IsInt() orden?: number;
}
class UpdateProyectoDto extends PartialType(ProyectoDto) {}

@ApiTags('Proyectos Portafolio')
@Controller('proyectos-portafolio')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class ProyectosPortafolioController {
  constructor(private service: ProyectosPortafolioService) {}

  @Get()
  getAll(@Query('all') all?: string) {
    return this.service.getAll(all === 'true');
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  create(@Body() dto: ProyectoDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdateProyectoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
