import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Clickjacking protection: frame-ancestors 'none' and X-Frame-Options DENY
    res.setHeader('X-Frame-Options', 'DENY');

    // MIME-sniffing protection
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Cross-site scripting filter
    res.setHeader('X-XSS-Protection', '0');

    // Content Security Policy for API gateway
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'none'; frame-ancestors 'none'; base-uri 'none';",
    );

    // HSTS (HTTP Strict Transport Security)
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );

    // Permissions Policy
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=()',
    );

    next();
  }
}
