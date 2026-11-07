import { Controller, Get, Put, Delete, Param, Body, Query, UseGuards, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CotizadorModulosService } from './cotizador-modulos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

class ModuloDto {
  @IsString() @Length(1, 60) id: string;
  @IsString() @Length(1, 150) nombre: string;
  @IsString() @Length(1, 50) categoria: string;
  @IsNumber() precio_base: number;
  @IsString() @Length(1, 10000) descripcion: string;
  @IsOptional() @IsBoolean() activo?: boolean;
  @IsOptional() @IsInt() orden?: number;
}

@ApiTags('Cotizador Módulos')
@Controller('cotizador-modulos')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class CotizadorModulosController {
  constructor(private cotizadorModulosService: CotizadorModulosService) {}

  @Get()
  getAll(@Query('all') all?: string) {
    return this.cotizadorModulosService.getAll(all === 'true');
  }

  @Put()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  upsert(@Body() dto: ModuloDto) {
    return this.cotizadorModulosService.upsert(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  delete(@Param('id') id: string) {
    return this.cotizadorModulosService.delete(id);
  }
}
