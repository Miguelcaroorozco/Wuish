import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { MetricasLandingService } from './metricas-landing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

class MetricaDto {
  @IsNumber() valor: number;
  @IsOptional() @IsString() @Length(1, 20) sufijo?: string;
  @IsString() @Length(1, 150) etiqueta: string;
  @IsOptional() @IsInt() orden?: number;
}
class UpdateMetricaDto extends PartialType(MetricaDto) {}

@ApiTags('Métricas Landing')
@Controller('metricas-landing')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class MetricasLandingController {
  constructor(private service: MetricasLandingService) {}

  @Get()
  getAll(@Query('all') all?: string) {
    return this.service.getAll(all === 'true');
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  create(@Body() dto: MetricaDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdateMetricaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
