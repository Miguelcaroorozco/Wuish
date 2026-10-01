import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || (user.rol !== 'admin' && user.rol !== 'administrador')) {
      throw new ForbiddenException('Acceso denegado: se requiere rol de administrador');
    }

    return true;
  }
}
