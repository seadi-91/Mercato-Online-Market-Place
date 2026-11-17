import nodemailer from "nodemailer";

export interface PayoutEmailParams {
  toEmail: string;
  adminEmail?: string;
  sellerName: string;
  shopName: string;
  phoneNumber?: string;
  role: "SELLER" | "SUPPLIER";
  txRef: string;
  transferAmount: number;
  transferredAt: Date | string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolderName: string;
  grossSales: number;
  platformCommission: number;
  previousBalance: number;
  remainingBalance: number;
}

function getMailTransporter() {
  const host = process.env.MAIL_HOST || "smtp.gmail.com";
  const port = Number(process.env.MAIL_PORT) || 465;
  const user = process.env.MAIL_USER || "muradsada8@gmail.com";
  const rawPass = process.env.MAIL_PASSWORD || "jxpm imvm ttfd csns";
  const pass = rawPass.replace(/\s+/g, "");

  return {
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    }),
    user,
    fromAddress: process.env.MAIL_FROM || `"MercatoX Financial Services" <${user}>`,
  };
}

/**
 * Sends payout notifications strictly in ENGLISH to BOTH:
 * 1. The Merchant (Seller/Supplier who received the transfer)
 * 2. The Admin (Platform Financial Operations Audit)
 */
export async function sendPayoutNotificationEmail(params: PayoutEmailParams): Promise<{
  success: boolean;
  merchantMailSent: boolean;
  adminMailSent: boolean;
  error?: string;
}> {
  const { transporter, user, fromAddress } = getMailTransporter();

  const formattedDate =
    new Date(params.transferredAt).toLocaleString("en-US", {
      timeZone: "Africa/Addis_Ababa",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) + " (EAT - East Africa Time)";

  let merchantMailSent = false;
  let adminMailSent = false;

  // ── 1. MERCHANT EMAIL TEMPLATE (100% ENGLISH) ──
  const merchantHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MercatoX Merchant Payout Statement</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b101b; color: #e2e8f0; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 25px auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 26px 20px; text-align: center; color: #fff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.95; }
    .body { padding: 24px 20px; }
    .amount-box { background: #064e3b; border: 1px solid #059669; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px; }
    .amount-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; color: #a7f3d0; font-weight: 700; }
    .amount-val { font-size: 32px; font-weight: 800; color: #ffffff; font-family: monospace; margin: 6px 0; }
    .amount-badge { font-size: 12px; color: #6ee7b7; font-weight: 600; }
    .card { background: #1f2937; border-radius: 12px; padding: 18px; margin-bottom: 16px; border: 1px solid #374151; font-size: 13px; }
    .card-title { font-weight: 700; color: #f9fafb; margin-bottom: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    td { padding: 7px 0; }
    .td-label { color: #9ca3af; }
    .td-val { text-align: right; font-weight: 600; color: #f3f4f6; }
    .border-b { border-bottom: 1px solid #2d3748; }
    .highlight-row { background: rgba(59, 130, 246, 0.12); border-radius: 8px; }
    .footer { background: #0f172a; padding: 18px; text-align: center; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Merchant Payout Statement</h1>
      <p>Official Disbursement Receipt · MercatoX Commerce Platform</p>
    </div>
    <div class="body">
      <p style="margin-top: 0; font-size: 14px; color: #f1f5f9;">Dear <strong>${params.sellerName}</strong> (<strong>${params.shopName}</strong>),</p>
      <p style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">
        We are pleased to notify you that your merchant sales payout has been successfully processed and transferred via <strong>Chapa Payment Gateway</strong> directly to your designated bank account.
      </p>

      <div class="amount-box">
        <div class="amount-lbl">Transferred Payout Amount</div>
        <div class="amount-val">ETB ${params.transferAmount.toLocaleString()}</div>
        <div class="amount-badge">✓ Verified & Cleared via Chapa Payment Gateway</div>
      </div>

      <div class="card">
        <div class="card-title">Destination Bank Details</div>
        <table>
          <tr class="border-b">
            <td class="td-label">Recipient Bank:</td>
            <td class="td-val">${params.bankName}</td>
          </tr>
          <tr class="border-b">
            <td class="td-label">Account Number:</td>
            <td class="td-val" style="font-family: monospace;">${params.bankAccountNumber}</td>
          </tr>
          <tr class="border-b">
            <td class="td-label">Account Holder Name:</td>
            <td class="td-val">${params.bankAccountHolderName}</td>
          </tr>
          <tr class="border-b">
            <td class="td-label">Disbursement Timestamp:</td>
            <td class="td-val">${formattedDate}</td>
          </tr>
          <tr>
            <td class="td-label">Payment ID / TxRef:</td>
            <td class="td-val" style="font-family: monospace; color: #34d399;">${params.txRef}</td>
          </tr>
        </table>
      </div>

      <div class="card">
        <div class="card-title">Account Financial Statement</div>
        <table>
          <tr class="border-b">
            <td class="td-label">Total Gross Product Sales:</td>
            <td class="td-val" style="font-family: monospace; color: #38bdf8;">ETB ${params.grossSales.toLocaleString()}</td>
          </tr>
          <tr class="border-b">
            <td class="td-label">Platform Commission Retained (3.5%):</td>
            <td class="td-val" style="font-family: monospace; color: #f472b6;">-ETB ${params.platformCommission.toLocaleString()}</td>
          </tr>
          <tr class="border-b">
            <td class="td-label">Available Balance Prior to Transfer:</td>
            <td class="td-val" style="font-family: monospace;">ETB ${params.previousBalance.toLocaleString()}</td>
          </tr>
          <tr class="border-b">
            <td class="td-label">Amount Transferred in this Payout:</td>
            <td class="td-val" style="font-family: monospace; font-weight: 700; color: #34d399;">-ETB ${params.transferAmount.toLocaleString()}</td>
          </tr>
          <tr class="highlight-row">
            <td style="padding: 8px 6px; font-weight: 700; color: #93c5fd;">New Remaining Available Balance:</td>
            <td style="padding: 8px 6px; font-weight: 800; text-align: right; font-family: monospace; color: #60a5fa; font-size: 14px;">ETB ${params.remainingBalance.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 0;">
        If you have any questions or require further financial clarification, please contact our Merchant Operations Support Team via the platform portal.
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0 0 4px;">© 2026 MercatoX Marketplace Platform · Automated Financial Notification · All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  // ── 2. ADMIN EMAIL TEMPLATE (100% ENGLISH) ──
  const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Admin Merchant Payout Audit Notice</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #060913; color: #e2e8f0; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 25px auto; background: #0d1322; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #312e81 100%); padding: 24px 20px; text-align: center; color: #fff; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; background: #065f46; color: #6ee7b7; letter-spacing: 0.5px; }
    .header h2 { margin: 8px 0 0; font-size: 20px; }
    .header p { margin: 4px 0 0; font-size: 12px; opacity: 0.8; }
    .body { padding: 24px 20px; font-size: 13px; }
    .card { background: #131b2e; border-radius: 12px; padding: 18px; margin-bottom: 16px; border: 1px solid #1e293b; border-left: 4px solid #10b981; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 7px 0; }
    .td-label { color: #94a3b8; }
    .td-val { text-align: right; font-weight: 600; color: #fff; }
    .border-b { border-bottom: 1px solid #1e293b; }
    .footer { background: #080c16; padding: 16px; text-align: center; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">FINANCIAL AUDIT NOTICE</span>
      <h2>Merchant Payout Executed via Chapa</h2>
      <p>MercatoX Financial Operations & Settlement Control</p>
    </div>
    <div class="body">
      <p style="margin-top: 0; color: #f1f5f9;">
        An administrator merchant payout transfer has been authorized and verified on Chapa Payment Gateway:
      </p>

      <div class="card">
        <table>
          <tr class="border-b">
            <td class="td-label">Beneficiary Vendor:</td>
            <td class="td-val">${params.shopName} (${params.sellerName})</td>
          </tr>
          <tr class="border-b">
            <td class="td-label">Vendor Role & Phone:</td>
            <td class="td-val" style="color: #cbd5e1;">${params.role} · ${params.phoneNumber || 'N/A'}</td>
          </tr>
          <tr class="border-b">
            <td class="td-label">Destination Bank:</td>
            <td class="td-val">${params.bankName}</td>
          </tr>
          <tr class="border-b">
            <td class="td-label">Bank Account Number:</td>
            <td class="td-val" style="font-family: monospace;">${params.bankAccountNumber}</td>
          </tr>
          <tr class="border-b">
            <td class="td-label">Account Holder Name:</td>
            <td class="td-val">${params.bankAccountHolderName}</td>
          </tr>
          <tr class="border-b">
            <td class="td-label">Gross Sales Recorded:</td>
            <td class="td-val" style="font-family: monospace; color: #38bdf8;">ETB ${params.grossSales.toLocaleString()}</td>
          </tr>
          <tr class="border-b">
            <td class="td-label">3.5% Platform Take:</td>
            <td class="td-val" style="font-family: monospace; color: #f472b6;">ETB ${params.platformCommission.toLocaleString()}</td>
          </tr>
          <tr class="border-b">
            <td class="td-label">Disbursed Payout:</td>
            <td class="td-val" style="font-family: monospace; font-weight: 800; font-size: 15px; color: #34d399;">ETB ${params.transferAmount.toLocaleString()}</td>
          </tr>
          <tr class="border-b">
            <td class="td-label">Remaining Balance in DB:</td>
            <td class="td-val" style="font-family: monospace; font-weight: 700; color: #60a5fa;">ETB ${params.remainingBalance.toLocaleString()}</td>
          </tr>
          <tr>
            <td class="td-label">Payment ID / TxRef:</td>
            <td class="td-val" style="font-family: monospace; color: #a78bfa;">${params.txRef}</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 11px; color: #64748b; margin: 0;">
        Timestamp: ${formattedDate}. Security audit entry recorded in database.
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0;">MercatoX Enterprise Financial Operations Console</p>
    </div>
  </div>
</body>
</html>
  `;

  // 1. Deliver to Merchant
  const merchantTarget = params.toEmail && params.toEmail.includes("@") ? params.toEmail : user;
  try {
    await transporter.sendMail({
      from: fromAddress,
      to: merchantTarget,
      subject: `[MercatoX Payout Statement] ETB ${params.transferAmount.toLocaleString()} Disbursed to ${params.shopName}`,
      html: merchantHtml,
    });
    merchantMailSent = true;
    console.log(`[PayoutMailer] Delivered statement to merchant: ${merchantTarget}`);
  } catch (err: any) {
    console.error(`[PayoutMailer] Error delivering to merchant ${merchantTarget}:`, err.message);
  }

  // 2. Deliver to Admin
  const adminTarget = params.adminEmail || user || "muradsada8@gmail.com";
  try {
    await transporter.sendMail({
      from: fromAddress,
      to: adminTarget,
      subject: `[Admin Financial Audit] Payout Disbursed: ETB ${params.transferAmount.toLocaleString()} to ${params.shopName}`,
      html: adminHtml,
    });
    adminMailSent = true;
    console.log(`[PayoutMailer] Delivered audit notice to admin: ${adminTarget}`);
  } catch (err: any) {
    console.error(`[PayoutMailer] Error delivering to admin ${adminTarget}:`, err.message);
  }

  return {
    success: merchantMailSent || adminMailSent,
    merchantMailSent,
    adminMailSent,
  };
}
