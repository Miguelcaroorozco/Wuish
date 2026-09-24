import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CarritoService } from './carrito.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Carrito')
@Controller('carrito')
export class CarritoController {
  constructor(private carritoService: CarritoService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ver carrito del usuario' })
  findMine(@Request() req) {
    return this.carritoService.findByUsuario(req.user.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agregar plan al carrito' })
  addItem(@Request() req, @Body() data: { plan_id: string; cantidad?: number }) {
    return this.carritoService.addItem(req.user.sub, data.plan_id, data.cantidad);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar cantidad en carrito' })
  updateCantidad(@Param('id') id: string, @Body() data: { cantidad: number }) {
    return this.carritoService.updateCantidad(id, data.cantidad);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar item del carrito' })
  removeItem(@Param('id') id: string) {
    return this.carritoService.removeItem(id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vaciar carrito' })
  clearCart(@Request() req) {
    return this.carritoService.clearCart(req.user.sub);
  }
}
