import { Controller, Get } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Public platform settings controller.
 * This endpoint is intentionally NOT protected by auth guards so that
 * all users (guests, customers, sellers) can fetch platform branding
 * (logo, name, tagline, contact info, etc.) without authentication.
 *
 * Admin writes still go through the protected PATCH /admin/settings endpoint.
 */
@Controller('platform')
export class PlatformSettingsController {
  private readonly DEFAULT_PLATFORM_SETTINGS = {
    platformName: 'MercatoX',
    platformTagline: 'Unified Commerce & Escrow Control Center',
    platformDescription:
      "Ethiopia's premier multi-vendor commerce platform with escrow-backed protection, connecting verified local merchants with modern online shoppers.",
    heroSectionDescription:
      "Ethiopia's premier multi-vendor commerce platform with escrow-backed protection, connecting verified local merchants with modern online shoppers.",
    logoUrl: '',
    currency: 'ETB',
    timezone: 'Africa/Addis_Ababa',
    footerEmail: 'support@mercatox.et',
    contactPhone: '+251 911 234 567',
    secondaryPhone: '+251 115 500 000',
    headquartersAddress: 'Bole Medhanialem Commercial Plaza, Addis Ababa, Ethiopia',
    copyrightText: `© ${new Date().getFullYear()} MercatoX Inc. All rights reserved. Ethiopian Escrow Protected Commerce.`,
    telegramChannel: 'https://t.me/mercatox_et',
    twitterHandle: 'https://x.com/mercatox_et',
    linkedinHandle: 'https://linkedin.com/company/mercatox-et',
    facebookPage: 'https://facebook.com/mercatox.ethiopia',
    commissionRate: '3.50',
    escrowHoldHours: '48',
    maxLoginAttempts: '5',
    telebirrWebhook: true,
    telebirrShortCode: '892100',
    cbeBirrWebhook: true,
    chapaLiveMode: true,
    requireTin: true,
    requireTradeLicense: true,
    instantVerifyRiders: false,
    maintenanceMode: false,
    require2FA: true,
    sessionTimeoutMinutes: '60',
  };

  private getSettingsFilePath(): string {
    return path.resolve(process.cwd(), 'platform-settings.json');
  }

  /**
   * GET /platform/settings — Public, no auth required.
   * Returns current platform branding and configuration.
   */
  @Get('settings')
  getPlatformSettings(): Record<string, any> {
    try {
      const filePath = this.getSettingsFilePath();
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return { ...this.DEFAULT_PLATFORM_SETTINGS, ...JSON.parse(raw) };
      }
    } catch {
      // fall through to defaults on read error
    }
    return this.DEFAULT_PLATFORM_SETTINGS;
  }
}
