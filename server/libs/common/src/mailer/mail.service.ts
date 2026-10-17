import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { UserRole } from '../enums/role.enum';

export interface RegistrationEmailParams {
  toEmail: string;
  fullName: string;
  role: UserRole | string;
  isSupplier?: boolean;
  shopName?: string;
}

export interface AdminNewMerchantEmailParams {
  adminEmail?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole | string;
  isSupplier?: boolean;
  shopName?: string;
  businessType?: string;
  marketZone?: string;
  city?: string;
  specificLocation?: string;
  tradeLicenseNumber?: string;
  tinNumber?: string;
}

export interface MerchantVerificationEmailParams {
  toEmail: string;
  fullName: string;
  shopName?: string;
  isSupplier?: boolean;
  isApproved: boolean;
  rejectionReason?: string;
}

export interface AccountStatusChangedEmailParams {
  toEmail: string;
  fullName: string;
  role?: string;
  isActive: boolean;
  reason?: string;
}

export interface AccountDeletedEmailParams {
  toEmail: string;
  fullName: string;
  role?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = this.configService.get<string>('MAIL_HOST') || 'smtp.gmail.com';
    const port = Number(this.configService.get<string>('MAIL_PORT')) || 465;
    const user = this.configService.get<string>('MAIL_USER') || 'muradsada8@gmail.com';
    const rawPass = this.configService.get<string>('MAIL_PASSWORD') || 'jxpm imvm ttfd csns';
    const pass = rawPass.replace(/\s+/g, '');
    const secure = port === 465;

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });
      this.logger.log(`MailService initialized with SMTP host: ${host}:${port} (${user})`);
    } catch (err) {
      this.logger.error('Failed to initialize nodemailer transport', err);
    }
  }

  private getFromAddress(): string {
    const mailUser = this.configService.get<string>('MAIL_USER') || 'muradsada8@gmail.com';
    return `"MercatoX Marketplace" <${mailUser}>`;
  }

  private getAdminRecipient(): string {
    return (
      this.configService.get<string>('ADMIN_EMAIL') ||
      this.configService.get<string>('MAIL_USER') ||
      'muradsada8@gmail.com'
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 1. Password Reset OTP Email
  // ─────────────────────────────────────────────────────────────
  async sendPasswordResetOtpEmail(
    toEmail: string,
    otp: string,
    userName?: string,
  ): Promise<boolean> {
    if (!this.transporter) this.initTransporter();
    if (!this.transporter) throw new Error('Email transport service is not available');

    const fromAddress = this.getFromAddress();
    const greeting = userName ? `Hello ${userName},` : 'Hello,';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Password Reset Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 520px; background-color: #111827; border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);">
          <tr><td style="height: 4px; background: linear-gradient(90deg, #6366f1, #3b82f6, #06b6d4);"></td></tr>
          <tr>
            <td style="padding: 32px 32px 16px 32px; text-align: center;">
              <div style="display: inline-block; padding: 6px 14px; background-color: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 9999px; font-size: 12px; font-weight: 700; color: #818cf8; letter-spacing: 1px; text-transform: uppercase;">
                MercatoX Security
              </div>
              <h1 style="margin: 18px 0 8px 0; font-size: 22px; font-weight: 800; color: #ffffff;">Password Reset Verification</h1>
              <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.5;">${greeting} We received a request to reset your password.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px; text-align: center;">
              <div style="background: linear-gradient(180deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9)); border: 1px dashed rgba(99, 102, 241, 0.4); border-radius: 12px; padding: 22px 16px; margin: 8px 0;">
                <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; font-weight: 600;">Your 6-Digit Passcode</p>
                <div style="font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #38bdf8; font-family: monospace;">${otp}</div>
                <div style="margin-top: 10px; display: inline-block; background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 6px; padding: 4px 12px; font-size: 12px; font-weight: 600; color: #fbbf24;">
                  Expires in 30 minutes
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 32px 32px 32px;">
              <p style="margin: 0 0 14px 0; font-size: 13px; color: #cbd5e1; line-height: 1.5;">Enter this code on the reset password screen to create your new password.</p>
              <div style="background-color: rgba(15, 23, 42, 0.6); border-left: 3px solid #6366f1; border-radius: 0 8px 8px 0; padding: 10px 14px;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0a0e17; padding: 18px 32px; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">MercatoX Marketplace &bull; Addis Ababa, Ethiopia</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `MercatoX Security: Your 6-Digit Password Reset Code [${otp}]`,
        text: `${greeting}\n\nYour 6-Digit Passcode: ${otp}\n(Valid for 30 minutes)\n\nEnter this code on the password reset page to create your new password.\n\nMercatoX Security Team`,
        html: htmlContent,
      });
      this.logger.log(`Password reset OTP email dispatched to ${toEmail} (MessageId: ${info.messageId})`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send OTP email to ${toEmail}:`, err);
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. User Registration Success Email (Customer, Seller, Supplier)
  // ─────────────────────────────────────────────────────────────
  async sendRegistrationSuccessEmail(params: RegistrationEmailParams): Promise<boolean> {
    if (!this.transporter) this.initTransporter();
    if (!this.transporter) return false;

    const fromAddress = this.getFromAddress();
    const isMerchant =
      params.role === UserRole.SELLER ||
      params.role === UserRole.SUPPLIER ||
      params.isSupplier;

    const accountTypeLabel = params.isSupplier
      ? 'Wholesale Supplier'
      : params.role === UserRole.SELLER
      ? 'Merchant Seller'
      : params.role === UserRole.DELIVERY
      ? 'Delivery Fleet Associate'
      : 'Customer';

    const subject = isMerchant
      ? `MercatoX: ${accountTypeLabel} Registration Successful (Under Review) ⏳`
      : `Welcome to MercatoX Marketplace, ${params.fullName}! 🎉`;

    const statusBadge = isMerchant
      ? `<div style="display: inline-block; padding: 6px 14px; background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 9999px; font-size: 12px; font-weight: 700; color: #fbbf24;">
          ⏳ Account Status: Under Review (በግምገማ ላይ)
        </div>`
      : `<div style="display: inline-block; padding: 6px 14px; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 9999px; font-size: 12px; font-weight: 700; color: #34d399;">
          ✅ Account Status: Active & Ready
        </div>`;

    const bodyContent = isMerchant
      ? `<p style="margin: 0 0 14px 0; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
          Thank you for registering your business, <strong style="color: #ffffff;">${params.shopName || params.fullName}</strong>, on MercatoX!
        </p>
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 18px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #38bdf8; font-weight: 700;">What happens next?</h3>
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
            Your merchant registration has been successfully received and submitted to the <strong style="color: #e2e8f0;">MercatoX Administration Compliance Team</strong> for review.
          </p>
          <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #cbd5e1; line-height: 1.6;">
            <li>Our administrative team will review your business credentials and license.</li>
            <li>You will receive an <strong>Approval / Rejection email notification</strong> once reviewed.</li>
            <li>Upon approval, your storefront will be activated to list wholesale products and receive orders.</li>
          </ul>
        </div>
        <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
          If you have urgent inquiries, please contact our merchant onboarding team at <a href="mailto:muradsada8@gmail.com" style="color: #6366f1; text-decoration: none;">muradsada8@gmail.com</a>.
        </p>`
      : `<p style="margin: 0 0 14px 0; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
          Welcome aboard! Your MercatoX account has been registered successfully.
        </p>
        <p style="margin: 0 0 14px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
          You can now explore thousands of wholesale and retail products directly from verified suppliers across Merkato and regional logistics hubs, with seamless Telebirr and CBE escrow checkout.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="http://localhost:3000/login" style="display: inline-block; background: linear-gradient(90deg, #6366f1, #3b82f6); color: #ffffff; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 13px; text-decoration: none; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);">
            Sign In & Explore Catalog &rarr;
          </a>
        </div>`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 540px; background-color: #111827; border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);">
          <tr><td style="height: 4px; background: linear-gradient(90deg, #6366f1, #3b82f6, #06b6d4);"></td></tr>
          <tr>
            <td style="padding: 32px 32px 16px 32px; text-align: center;">
              <div style="margin-bottom: 12px;">${statusBadge}</div>
              <h1 style="margin: 12px 0 6px 0; font-size: 22px; font-weight: 800; color: #ffffff;">
                ${isMerchant ? 'Application Received' : 'Welcome to MercatoX'}
              </h1>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">Hello, ${params.fullName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 32px 32px;">
              ${bodyContent}
            </td>
          </tr>
          <tr>
            <td style="background-color: #0a0e17; padding: 18px 32px; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">MercatoX Marketplace &bull; Addis Ababa, Ethiopia</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: params.toEmail,
        subject,
        text: `Hello ${params.fullName},\n\nYour MercatoX account registration was successful.\nAccount Type: ${accountTypeLabel}\n${isMerchant ? 'Status: Under Admin Review. We will notify you once verified.' : 'Status: Active.'}\n\nMercatoX Team`,
        html: htmlContent,
      });
      this.logger.log(`Registration email dispatched to ${params.toEmail} (MessageId: ${info.messageId})`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send registration email to ${params.toEmail}:`, err);
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. Admin Notification Email: New Seller / Supplier Registration
  // ─────────────────────────────────────────────────────────────
  async sendAdminNewMerchantNotificationEmail(params: AdminNewMerchantEmailParams): Promise<boolean> {
    if (!this.transporter) this.initTransporter();
    if (!this.transporter) return false;

    const fromAddress = this.getFromAddress();
    const adminEmail = params.adminEmail || this.getAdminRecipient();
    const merchantType = params.isSupplier ? 'Wholesale Supplier' : 'Merchant Seller';

    const subject = `🔔 [MercatoX Admin Alert] New ${merchantType} Registered: ${params.shopName || params.fullName}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 560px; background-color: #111827; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);">
          <tr><td style="height: 4px; background: linear-gradient(90deg, #f59e0b, #ef4444, #6366f1);"></td></tr>
          <tr>
            <td style="padding: 28px 32px 14px 32px;">
              <div style="display: inline-block; padding: 5px 12px; background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 9999px; font-size: 11px; font-weight: 700; color: #fbbf24; text-transform: uppercase;">
                Admin Verification Alert
              </div>
              <h1 style="margin: 14px 0 6px 0; font-size: 21px; font-weight: 800; color: #ffffff;">New ${merchantType} Registered</h1>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">A new business has applied on MercatoX and is awaiting your review & verification.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 32px 24px 32px;">
              <table width="100%" cellpadding="8" cellspacing="0" style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; font-size: 12px;">
                <tr>
                  <td width="35%" style="color: #94a3b8; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">Shop / Company:</td>
                  <td style="color: #ffffff; font-weight: 700; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">${params.shopName || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">Contact Person:</td>
                  <td style="color: #cbd5e1; font-weight: 600; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">${params.fullName}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">Role & Category:</td>
                  <td style="color: #38bdf8; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">${merchantType} ${params.businessType ? `(${params.businessType})` : ''}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">Email Address:</td>
                  <td style="color: #cbd5e1; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">${params.email}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">Phone Number:</td>
                  <td style="color: #cbd5e1; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">${params.phoneNumber}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">Location / Zone:</td>
                  <td style="color: #cbd5e1; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">${params.city || 'Addis Ababa'}, ${params.marketZone || ''} ${params.specificLocation || ''}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8;">Trade License / TIN:</td>
                  <td style="color: #cbd5e1;">License: ${params.tradeLicenseNumber || 'Attached'} &bull; TIN: ${params.tinNumber || 'N/A'}</td>
                </tr>
              </table>

              <div style="text-align: center; margin-top: 24px;">
                <a href="http://localhost:3000/dashboard/admin" style="display: inline-block; background: linear-gradient(90deg, #f59e0b, #d97706); color: #ffffff; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 13px; text-decoration: none; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);">
                  Open Admin Console to Review &rarr;
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0a0e17; padding: 16px 32px; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">MercatoX Administration Automated System</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: adminEmail,
        subject,
        text: `New ${merchantType} registered: ${params.shopName || params.fullName}\nEmail: ${params.email}\nPhone: ${params.phoneNumber}\nPlease open admin console to verify.`,
        html: htmlContent,
      });
      this.logger.log(`Admin notification email dispatched to ${adminEmail} (MessageId: ${info.messageId})`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send admin notification email to ${adminEmail}:`, err);
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. Merchant Verification Result Email (Approve or Reject)
  // ─────────────────────────────────────────────────────────────
  async sendMerchantVerificationResultEmail(params: MerchantVerificationEmailParams): Promise<boolean> {
    if (!this.transporter) this.initTransporter();
    if (!this.transporter) return false;

    const fromAddress = this.getFromAddress();
    const merchantType = params.isSupplier ? 'Supplier (አቅራቢ)' : 'Seller (ነጋዴ)';

    const subject = params.isApproved
      ? `🎉 Congratulations! Your MercatoX ${params.isSupplier ? 'Supplier' : 'Seller'} Account is Approved! | እንኳን ደስ አለዎት!`
      : `⚠️ Important: Your MercatoX ${params.isSupplier ? 'Supplier' : 'Seller'} Application Status | የማመልከቻ ውሳኔ ማሳወቂያ`;

    const statusBadge = params.isApproved
      ? `<div style="display: inline-block; padding: 6px 14px; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 9999px; font-size: 12px; font-weight: 700; color: #34d399;">
          ✅ Account Approved &amp; Verified | አካውንትዎ ፀድቋል
        </div>`
      : `<div style="display: inline-block; padding: 6px 14px; background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 9999px; font-size: 12px; font-weight: 700; color: #f87171;">
          ❌ Application Rejected | ማመልከቻዎ ውድቅ ተደርጓል
        </div>`;

    const contentBody = params.isApproved
      ? `<div style="background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10b981; border-radius: 0 12px 12px 0; padding: 16px 18px; margin: 16px 0;">
          <p style="margin: 0 0 10px 0; font-size: 15px; color: #ffffff; line-height: 1.6; font-weight: 700;">
            እንኳን ደስ አለዎት! የ MercatoX ${merchantType} አካውንትዎ ፀድቋል (Approved)።
          </p>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
            ከዚህ በኋላ ምርቶችን ፖስት ማድረግ (Post &amp; Manage Products)፣ የጅምላ እና የችርቻሮ ትዕዛዞችን ማስተዳደር እና ሁሉንም የ MercatoX ፕላትፎርም አገልግሎቶች መጠቀም ይችላሉ።
          </p>
          <p style="margin: 0; font-size: 13px; color: #34d399; font-weight: 700;">
            እርስዎ ከዚህ በኋላ ይፋዊ የ MercatoX ${merchantType} አባል (Official Member) ነዎት!
          </p>
        </div>
        <p style="margin: 14px 0; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
          Great news! The MercatoX Compliance Team has reviewed and <strong style="color: #34d399;">APPROVED</strong> your merchant application for <strong style="color: #ffffff;">${params.shopName || params.fullName}</strong>. You are now officially a verified member of MercatoX!
        </p>
        <ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 12px; color: #cbd5e1; line-height: 1.6;">
          <li>Publish products and manage store inventory in real time.</li>
          <li>Receive quotation requests (RFQs), purchase orders, and direct client contracts.</li>
          <li>Instant escrow payouts through CBE Birr, Telebirr &amp; Awash Bank transfers.</li>
        </ul>
        <div style="text-align: center; margin: 24px 0;">
          <a href="http://localhost:3000/dashboard/${params.isSupplier ? 'supplier' : 'seller'}" style="display: inline-block; background: linear-gradient(90deg, #10b981, #059669); color: #ffffff; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 13px; text-decoration: none; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">
            ወደ ${params.isSupplier ? 'Supplier' : 'Seller'} ዳሽቦርድ ይግቡ &rarr;
          </a>
        </div>`
      : `<div style="background: rgba(239, 68, 68, 0.08); border-left: 4px solid #ef4444; border-radius: 0 12px 12px 0; padding: 16px 18px; margin: 16px 0;">
          <p style="margin: 0 0 10px 0; font-size: 15px; color: #ffffff; line-height: 1.6; font-weight: 700;">
            ውድ ${params.fullName}፣ ያቀረቡት የ MercatoX ${merchantType} አካውንት ማመልከቻ ለጊዜው ውድቅ ተደርጓል (Application Rejected)።
          </p>
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #f87171; margin-bottom: 6px;">
            የውድቅ የተደረገበት ምክንያት (Rejection Reason):
          </div>
          <div style="font-size: 14px; font-weight: 600; color: #fca5a5; background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 8px; padding: 10px 14px; line-height: 1.5;">
            ${params.rejectionReason || 'Submitted business documentation was incomplete or could not be verified by compliance.'}
          </div>
        </div>
        <p style="margin: 14px 0 10px 0; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
          ማብራሪያ፦ የተጠቀሰውን ምክንያት በማስተካከል ሰነዶችዎን እንደገና ማመልከት ወይም የ MercatoX የድጋፍ ቡድንን በ <a href="mailto:muradsada8@gmail.com" style="color: #818cf8; text-decoration: none;">muradsada8@gmail.com</a> ማነጋገር ይችላሉ።
        </p>
        <p style="margin: 0 0 16px 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
          Thank you for applying to MercatoX. After compliance review, your merchant application for <strong>${params.shopName || params.fullName}</strong> could not be approved at this time for the reason stated above.
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="http://localhost:3000/login" style="display: inline-block; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: #ffffff; padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: 12px; text-decoration: none;">
            ይግቡና ሰነዶችን እንደገና ያስገቡ (Sign In to Re-apply) &rarr;
          </a>
        </div>`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 540px; background-color: #111827; border: 1px solid ${params.isApproved ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);">
          <tr><td style="height: 4px; background: ${params.isApproved ? 'linear-gradient(90deg, #10b981, #06b6d4, #6366f1)' : 'linear-gradient(90deg, #ef4444, #f59e0b)'};"></td></tr>
          <tr>
            <td style="padding: 32px 32px 14px 32px; text-align: center;">
              <div style="margin-bottom: 12px;">${statusBadge}</div>
              <h1 style="margin: 12px 0 6px 0; font-size: 21px; font-weight: 800; color: #ffffff;">
                ${params.isApproved ? 'የአካውንት ማረጋገጫ ተጠናቋል!' : 'የማመልከቻ ውሳኔ ማሳወቂያ'}
              </h1>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">Hello, ${params.fullName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 32px 32px 32px;">
              ${contentBody}
            </td>
          </tr>
          <tr>
            <td style="background-color: #0a0e17; padding: 18px 32px; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">MercatoX Marketplace &bull; Addis Ababa, Ethiopia</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: params.toEmail,
        subject,
        text: `Hello ${params.fullName},\n\nYour MercatoX ${merchantType} application status: ${params.isApproved ? 'APPROVED' : 'REJECTED'}.\n${!params.isApproved && params.rejectionReason ? `Reason: ${params.rejectionReason}\n` : ''}\nMercatoX Team`,
        html: htmlContent,
      });
      this.logger.log(`Verification result email dispatched to ${params.toEmail} (MessageId: ${info.messageId})`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send verification result email to ${params.toEmail}:`, err);
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 5. Account Status Changed Email (Suspension or Reactivation)
  // ─────────────────────────────────────────────────────────────
  async sendAccountStatusChangedEmail(params: AccountStatusChangedEmailParams): Promise<boolean> {
    if (!this.transporter) this.initTransporter();
    if (!this.transporter) return false;

    const fromAddress = this.getFromAddress();
    const userRoleText = params.role ? `(${params.role})` : '';

    const subject = params.isActive
      ? `✅ Notice: Your MercatoX Account has been Reactivated | አካውንትዎ እንደገና ነፃ ሆኗል`
      : `⚠️ Urgent Security Notice: Your MercatoX Account has been Suspended | የአካውንት መታገድ ማሳወቂያ`;

    const statusBadge = params.isActive
      ? `<div style="display: inline-block; padding: 6px 14px; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 9999px; font-size: 12px; font-weight: 700; color: #34d399;">
          ✅ Account Status: Active | ንቁ አካውንት
        </div>`
      : `<div style="display: inline-block; padding: 6px 14px; background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 9999px; font-size: 12px; font-weight: 700; color: #f87171;">
          ⚠️ Account Status: Suspended | አካውንትዎ ታግዷል
        </div>`;

    const contentBody = params.isActive
      ? `<div style="background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10b981; border-radius: 0 12px 12px 0; padding: 16px 18px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0; font-size: 15px; color: #ffffff; line-height: 1.6; font-weight: 700;">
            ውድ ${params.fullName}፣ የእርስዎ የ MercatoX ${userRoleText} አካውንት እንደገና ነፃ ሆኗል / ተከፍቷል (Reactivated)።
          </p>
          <p style="margin: 0; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
            አሁን እንደተለመደው ወደ ፕላትፎርሙ በመግባት ግብይቶችን እና አገልግሎቶችን ማከናወን ይችላሉ።
          </p>
        </div>
        <p style="margin: 14px 0; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
          Your MercatoX user account has been successfully reactivated by platform administration. You now have full access to your account and services.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="http://localhost:3000/login" style="display: inline-block; background: linear-gradient(90deg, #10b981, #059669); color: #ffffff; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 13px; text-decoration: none; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">
            ወደ MercatoX ይግቡ (Sign In) &rarr;
          </a>
        </div>`
      : `<div style="background: rgba(239, 68, 68, 0.08); border-left: 4px solid #ef4444; border-radius: 0 12px 12px 0; padding: 16px 18px; margin: 16px 0;">
          <p style="margin: 0 0 10px 0; font-size: 15px; color: #ffffff; line-height: 1.6; font-weight: 700;">
            ውድ ${params.fullName}፣ የእርስዎ የ MercatoX ${userRoleText} አካውንት በአስተዳዳሪው ለጊዜው ታግዷል / ተሰናክሏል (Account Suspended / Deactivated)።
          </p>
          ${
            params.reason
              ? `<div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #f87171; margin-bottom: 6px;">
                  የታገደበት ምክንያት (Suspension Reason):
                </div>
                <div style="font-size: 14px; font-weight: 600; color: #fca5a5; background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 8px; padding: 10px 14px; line-height: 1.5; margin-bottom: 10px;">
                  ${params.reason}
                </div>`
              : ''
          }
          <p style="margin: 0; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
            ለጊዜው ወደ ሲስተሙ መግባት ወይም ግብይቶችን ማከናወን አይችሉም። ጥያቄ ካለዎት ወይም አካውንትዎን መልሰው ማስከፈት ከፈለጉ የ MercatoX አስተዳዳሪዎችን በ <a href="mailto:muradsada8@gmail.com" style="color: #818cf8; text-decoration: none;">muradsada8@gmail.com</a> ያነጋግሩ።
          </p>
        </div>
        <p style="margin: 14px 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
          Your MercatoX user account has been temporarily suspended by system governance. While suspended, access to your portal and API operations is blocked. If you believe this action was taken in error or wish to appeal, please contact support.
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="mailto:muradsada8@gmail.com?subject=Appeal%20Account%20Suspension" style="display: inline-block; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); color: #fca5a5; padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: 12px; text-decoration: none;">
            የድጋፍ ቡድንን ያነጋግሩ (Contact Support) &rarr;
          </a>
        </div>`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 540px; background-color: #111827; border: 1px solid ${params.isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);">
          <tr><td style="height: 4px; background: ${params.isActive ? 'linear-gradient(90deg, #10b981, #06b6d4)' : 'linear-gradient(90deg, #ef4444, #f59e0b)'};"></td></tr>
          <tr>
            <td style="padding: 32px 32px 14px 32px; text-align: center;">
              <div style="margin-bottom: 12px;">${statusBadge}</div>
              <h1 style="margin: 12px 0 6px 0; font-size: 21px; font-weight: 800; color: #ffffff;">
                ${params.isActive ? 'አካውንትዎ ነፃ ሆኗል' : 'የአካውንት መታገድ ማሳወቂያ'}
              </h1>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">Hello, ${params.fullName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 32px 32px 32px;">
              ${contentBody}
            </td>
          </tr>
          <tr>
            <td style="background-color: #0a0e17; padding: 18px 32px; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">MercatoX Marketplace &bull; Addis Ababa, Ethiopia</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: params.toEmail,
        subject,
        text: `Hello ${params.fullName},\n\nYour MercatoX account status changed: ${params.isActive ? 'ACTIVE' : 'SUSPENDED'}.\n${params.reason ? `Reason: ${params.reason}\n` : ''}\nContact: muradsada8@gmail.com\nMercatoX Team`,
        html: htmlContent,
      });
      this.logger.log(`Account status email dispatched to ${params.toEmail} (MessageId: ${info.messageId})`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send account status email to ${params.toEmail}:`, err);
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 6. Account Deleted Email (Permanent Deletion)
  // ─────────────────────────────────────────────────────────────
  async sendAccountDeletedEmail(params: AccountDeletedEmailParams): Promise<boolean> {
    if (!this.transporter) this.initTransporter();
    if (!this.transporter) return false;

    const fromAddress = this.getFromAddress();
    const userRoleText = params.role ? `(${params.role})` : '';
    const subject = `🗑️ Notice: Your MercatoX Account has been Deleted | የአካውንት መሰረዝ ማሳወቂያ`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 540px; background-color: #111827; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);">
          <tr><td style="height: 4px; background: linear-gradient(90deg, #ef4444, #71717a);"></td></tr>
          <tr>
            <td style="padding: 32px 32px 14px 32px; text-align: center;">
              <div style="display: inline-block; padding: 6px 14px; background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 9999px; font-size: 12px; font-weight: 700; color: #f87171; margin-bottom: 12px;">
                🗑️ Account Status: Permanently Deleted | አካውንትዎ ተሰርዟል
              </div>
              <h1 style="margin: 12px 0 6px 0; font-size: 21px; font-weight: 800; color: #ffffff;">
                የአካውንት መሰረዝ ማሳወቂያ
              </h1>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">Hello, ${params.fullName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 32px 32px 32px;">
              <div style="background: rgba(239, 68, 68, 0.08); border-left: 4px solid #ef4444; border-radius: 0 12px 12px 0; padding: 16px 18px; margin: 16px 0;">
                <p style="margin: 0 0 10px 0; font-size: 15px; color: #ffffff; line-height: 1.6; font-weight: 700;">
                  ውድ ${params.fullName}፣ የእርስዎ የ MercatoX ${userRoleText} አካውንት ከሲስተማችን በቋሚነት ተሰርዟል (Account Permanently Deleted)።
                </p>
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
                  ከዚህ በኋላ ከዚህ አካውንት ጋር የተያያዙ አገልግሎቶች፣ መረጃዎች እና መብቶች በሙሉ ተቋርጠዋል።
                </p>
                <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                  ይህ እርምጃ የተሳሳተ ነው ብለው ካመኑ ወይም ተጨማሪ መረጃ ከፈለጉ የ MercatoX አስተዳዳሪዎችን በ <a href="mailto:muradsada8@gmail.com" style="color: #818cf8; text-decoration: none;">muradsada8@gmail.com</a> ማነጋገር ይችላሉ።
                </p>
              </div>
              <p style="margin: 14px 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
                This notification confirms that your MercatoX user account and profile data have been permanently removed from our platform. If you did not authorize this action, please reach out to us immediately.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0a0e17; padding: 18px 32px; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">MercatoX Marketplace &bull; Addis Ababa, Ethiopia</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: params.toEmail,
        subject,
        text: `Hello ${params.fullName},\n\nYour MercatoX account (${params.role || 'User'}) has been permanently deleted from our platform.\nIf you have any questions, contact: muradsada8@gmail.com\n\nMercatoX Team`,
        html: htmlContent,
      });
      this.logger.log(`Account deleted email dispatched to ${params.toEmail} (MessageId: ${info.messageId})`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send account deleted email to ${params.toEmail}:`, err);
      return false;
    }
  }
}
