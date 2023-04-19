import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AUTH_SERVICE } from './constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, tap } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(AUTH_SERVICE) private authClient: ClientProxy) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const authentication = this.getAuthentication(context);
    return this.authClient
      .send('validate_user', {
        Authentication: authentication,
      })
      .pipe(
        tap((res) => {
          this.addUserToContext(context, res);
        }),
      );
  }

  private getAuthentication(context: ExecutionContext) {
    let authentication: string;
    if (context.getType() === 'rpc') {
      authentication = context.switchToRpc().getData().Authentication;
    }
    if (context.getType() === 'http') {
      authentication = context.switchToHttp().getRequest()
        .cookies?.Authentication;
    }
    if (!authentication) {
      throw new UnauthorizedException('Authentication token is missing');
    }
    return authentication;
  }

  private addUserToContext(context: ExecutionContext, user: unknown) {
    if (context.getType() === 'rpc') {
      context.switchToRpc().getData().user = user;
    }
    if (context.getType() === 'http') {
      context.switchToHttp().getRequest().user = user;
    }
  }
}
