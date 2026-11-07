import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { TiposServicioService } from './tipos-servicio.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

class TipoServicioDto {
  @IsString() @Length(1, 100) nombre: string;
  @IsOptional() @IsString() @Length(1, 10000) descripcion?: string;
}
class UpdateTipoServicioDto extends PartialType(TipoServicioDto) {}

@ApiTags('Tipos de Servicio')
@Controller('tipos-servicio')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class TiposServicioController {
  constructor(private tiposServicioService: TiposServicioService) {}

  @Get()
  getAll() {
    return this.tiposServicioService.getAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  create(@Body() dto: TipoServicioDto) {
    return this.tiposServicioService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdateTipoServicioDto) {
    return this.tiposServicioService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  delete(@Param('id') id: string) {
    return this.tiposServicioService.delete(id);
  }
}
