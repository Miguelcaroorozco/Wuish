import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PlanesModule } from './planes/planes.module';
import { SolicitudesModule } from './solicitudes/solicitudes.module';
import { MensajesModule } from './mensajes/mensajes.module';
import { InfoGeneralModule } from './info-general/info-general.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { CarritoModule } from './carrito/carrito.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    PlanesModule,
    SolicitudesModule,
    MensajesModule,
    InfoGeneralModule,
    ComentariosModule,
    CarritoModule,
  ],
})
export class AppModule {}
