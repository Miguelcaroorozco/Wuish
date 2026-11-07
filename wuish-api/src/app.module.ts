import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PlanesModule } from './planes/planes.module';
import { SolicitudesModule } from './solicitudes/solicitudes.module';
import { MensajesModule } from './mensajes/mensajes.module';
import { InfoGeneralModule } from './info-general/info-general.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { TiposServicioModule } from './tipos-servicio/tipos-servicio.module';
import { CotizadorModulosModule } from './cotizador-modulos/cotizador-modulos.module';
import { ProyectosPortafolioModule } from './proyectos-portafolio/proyectos-portafolio.module';
import { MetricasLandingModule } from './metricas-landing/metricas-landing.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    PlanesModule,
    SolicitudesModule,
    MensajesModule,
    InfoGeneralModule,
    ComentariosModule,
    TiposServicioModule,
    CotizadorModulosModule,
    ProyectosPortafolioModule,
    MetricasLandingModule,
    NotificacionesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
