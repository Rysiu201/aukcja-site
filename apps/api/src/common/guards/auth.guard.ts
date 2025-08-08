import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest() as any;
    const userId = parseInt(req.cookies?.userId) || 1;
    const role = req.cookies?.role || 'USER';
    req.user = { id: userId, role };
    return true;
  }
}
