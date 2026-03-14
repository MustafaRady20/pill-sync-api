import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; 

    if (!user?.isEmailVerified) {
      throw new ForbiddenException(
        'Please verify your email address before continuing.',
      );
    }

    return true;
  }
}