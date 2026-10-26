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
import { TiposServicioModule } from './tipos-servicio/tipos-servicio.module';
import { CotizadorModulosModule } from './cotizador-modulos/cotizador-modulos.module';
import { ProyectosPortafolioModule } from './proyectos-portafolio/proyectos-portafolio.module';
import { MetricasLandingModule } from './metricas-landing/metricas-landing.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';

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
    TiposServicioModule,
    CotizadorModulosModule,
    ProyectosPortafolioModule,
    MetricasLandingModule,
    NotificacionesModule,
  ],
})
export class AppModule {}
