import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest() as any;
    if (req.user?.role === 'ADMIN') {
      return true;
    }
    throw new ForbiddenException('Admin only');
  }
}
