import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  RATE_LIMIT_KEY,
  RateLimitOptions,
} from '../decorators/rate-limit.decorator';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private static readonly records = new Map<string, RateLimitRecord>();
  private static cleanupTimer: NodeJS.Timeout | null = null;

  constructor(private readonly reflector: Reflector) {
    if (!RateLimitGuard.cleanupTimer) {
      RateLimitGuard.cleanupTimer = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of RateLimitGuard.records.entries()) {
          if (record.resetTime <= now) {
            RateLimitGuard.records.delete(key);
          }
        }
      }, 60000);
      if (RateLimitGuard.cleanupTimer.unref) {
        RateLimitGuard.cleanupTimer.unref();
      }
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const rateLimitOptions = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rateLimitOptions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    if (!request) {
      return true;
    }

    const forwardedFor = request.headers?.['x-forwarded-for'];
    const ip =
      (typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0].trim()
        : Array.isArray(forwardedFor)
          ? forwardedFor[0].trim()
          : null) ||
      request.socket?.remoteAddress ||
      request.ip ||
      'unknown-ip';

    const route = request.route?.path || request.url || 'default';
    const key = `${ip}:${route}`;
    const now = Date.now();

    const record = RateLimitGuard.records.get(key);

    if (!record || record.resetTime <= now) {
      RateLimitGuard.records.set(key, {
        count: 1,
        resetTime: now + rateLimitOptions.ttlMs,
      });
      return true;
    }

    if (record.count >= rateLimitOptions.limit) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((record.resetTime - now) / 1000),
      );
      const response = context.switchToHttp().getResponse();
      if (response && typeof response.setHeader === 'function') {
        response.setHeader('Retry-After', retryAfterSeconds.toString());
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests, please try again later.',
          retryAfter: retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count += 1;
    return true;
  }
}
