import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization token');
    }

    const token = authHeader.split(' ')[1];
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new UnauthorizedException('Authentication secret is not configured');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });
      request.user = {
        id: payload.sub,
        phoneNumber: payload.phoneNumber,
        role: payload.role,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
