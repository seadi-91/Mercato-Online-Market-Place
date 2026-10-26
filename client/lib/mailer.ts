import nodemailer from "nodemailer";

export interface SendCardPasswordEmailParams {
  toEmail: string;
  cardholderName: string;
  cardNumber: string;
  cardPassword: string;
  balance: number;
  currency?: string;
  themeId?: string;
  expiryDate?: string;
}

let transporter: any = null;

function getTransporter(): any {
  if (transporter) return transporter;

  const host = process.env.MAIL_HOST || "smtp.gmail.com";
  const port = Number(process.env.MAIL_PORT) || 465;
  const user = process.env.MAIL_USER || "";
  const rawPass = process.env.MAIL_PASSWORD || "";
  const pass = rawPass.replace(/\s+/g, "");

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return transporter;
}

/**
 * Sends the 8-digit Card Password / PIN to the user's email after purchasing a MercatoX Card.
 */
export async function sendCardPasswordEmail(
  params: SendCardPasswordEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const {
      toEmail,
      cardholderName,
      cardNumber,
      cardPassword,
      balance,
      currency = "ETB",
      expiryDate = "10/29",
    } = params;

    if (!toEmail || !toEmail.includes("@")) {
      return { success: false, error: "Invalid recipient email address" };
    }

    const cleanPassword = String(cardPassword || "").replace(/\D/g, "");
    const validPassword = cleanPassword.length >= 8
      ? cleanPassword.slice(0, 8)
      : cleanPassword.padEnd(8, "0");

    const mailUser = process.env.MAIL_USER || "support@mercatox.et";
    const fromAddress = `"MercatoX Marketplace" <${mailUser}>`;

    const formattedCardNumber = cardNumber.trim();
    const last4 = formattedCardNumber.replace(/\D/g, "").slice(-4) || "8942";
    const maskedCardNumber = `4892 •••• •••• ${last4}`;

    const subject = `🔐 Your MercatoX Card 8-Digit Password [${validPassword}] | Security Notice`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070b19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #070b19; padding: 30px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" style="max-width: 580px; background: linear-gradient(180deg, #0f172a 0%, #090d16 100%); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
          <!-- Top Accent Ribbon -->
          <tr>
            <td style="height: 5px; background: linear-gradient(90deg, #6366f1 0%, #06b6d4 50%, #10b981 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 16px 32px; text-align: center;">
              <div style="display: inline-block; padding: 6px 16px; background-color: rgba(6, 182, 212, 0.12); border: 1px solid rgba(6, 182, 212, 0.35); border-radius: 9999px; font-size: 11px; font-weight: 800; color: #38bdf8; letter-spacing: 1.5px; text-transform: uppercase;">
                Official Digital ATM Card
              </div>
              <h1 style="margin: 16px 0 6px 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                Mercato<span style="color: #22d3ee;">X</span> Card Password
              </h1>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                Hello <strong style="color: #ffffff;">${cardholderName || "Valued Customer"}</strong>, your official digital card is active!
              </p>
            </td>
          </tr>

          <!-- Digital Card Preview Badge -->
          <tr>
            <td style="padding: 12px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #070b19 0%, #0f1738 50%, #042137 100%); border: 1px solid rgba(34, 211, 238, 0.4); border-radius: 16px; padding: 20px 24px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; color: #38bdf8; letter-spacing: 1px; text-transform: uppercase;">
                      MERCATOX CARD
                    </div>
                    <div style="font-size: 16px; font-weight: 800; color: #ffffff; letter-spacing: 3px; font-family: monospace; margin: 10px 0 6px 0;">
                      ${formattedCardNumber}
                    </div>
                  </td>
                  <td align="right" valign="top">
                    <div style="font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase;">
                      Available Balance
                    </div>
                    <div style="font-size: 15px; font-weight: 900; color: #34d399; font-family: monospace;">
                      ${currency} ${Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 10px;">
                    <span style="font-size: 11px; color: #cbd5e1; text-transform: uppercase; font-weight: 600;">
                      ${cardholderName}
                    </span>
                  </td>
                  <td align="right" style="padding-top: 10px;">
                    <span style="font-size: 11px; color: #94a3b8; font-family: monospace;">
                      EXP: ${expiryDate}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 8-DIGIT PASSWORD HERO BOX -->
          <tr>
            <td style="padding: 16px 32px; text-align: center;">
              <div style="background: linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(8, 12, 22, 0.95)); border: 2px dashed rgba(6, 182, 212, 0.5); border-radius: 16px; padding: 24px 20px; box-shadow: 0 8px 30px rgba(6, 182, 212, 0.15);">
                <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 700;">
                  YOUR 8-DIGIT CARD PASSWORD
                </p>
                <p style="margin: 0 0 12px 0; font-size: 12px; color: #38bdf8; font-weight: 700;">
                  Card Security Verification Code
                </p>

                <!-- 8-DIGIT DISPLAY -->
                <div style="background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 12px; display: inline-block; padding: 14px 28px; margin: 6px 0;">
                  <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #22d3ee; font-family: 'Courier New', Courier, monospace; text-shadow: 0 0 12px rgba(34, 211, 238, 0.5);">
                    ${validPassword}
                  </span>
                </div>

                <div style="margin-top: 14px;">
                  <span style="display: inline-block; background-color: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; padding: 4px 14px; font-size: 11px; font-weight: 700; color: #f87171;">
                    🔒 Keep strictly confidential
                  </span>
                </div>
              </div>
            </td>
          </tr>

          <!-- INSTRUCTIONS (ENGLISH ONLY) -->
          <tr>
            <td style="padding: 12px 32px 28px 32px;">
              <!-- English Instruction Box -->
              <div style="background: rgba(30, 41, 59, 0.6); border-left: 4px solid #38bdf8; border-radius: 0 10px 10px 0; padding: 16px 18px; margin-bottom: 18px;">
                <p style="margin: 0 0 8px 0; font-size: 13.5px; font-weight: 700; color: #38bdf8;">
                  How to Use Your Card Password:
                </p>
                <p style="margin: 0; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
                  Whenever you purchase goods on MercatoX and choose <strong>MercatoX Digital Card</strong> at checkout, enter this 8-digit password to authorize deduction from your card balance with zero transaction fees (0% fee) and instant confirmation.
                </p>
              </div>

              <!-- Security Reminder Notice -->
              <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 12px 16px;">
                <p style="margin: 0; font-size: 11.5px; color: #94a3b8; line-height: 1.5;">
                  ⚠️ <strong>Security Notice:</strong> Never share your 8-digit password with anyone. MercatoX support staff will NEVER ask you for your card password or PIN.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 24px;">
                <a href="http://localhost:3000/marketplace" style="display: inline-block; background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%); color: #ffffff; padding: 13px 32px; border-radius: 12px; font-weight: 800; font-size: 13px; text-decoration: none; box-shadow: 0 4px 18px rgba(6, 182, 212, 0.35);">
                  Start Shopping on Marketplace &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #050811; padding: 18px 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                MercatoX National Marketplace &bull; Addis Ababa, Ethiopia &bull; Support: <a href="mailto:support@mercatox.et" style="color: #38bdf8; text-decoration: none;">support@mercatox.et</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const plainText = `
MercatoX Digital Card Issuance
Hello ${cardholderName},

Your official MercatoX Card has been successfully issued and activated!

Card Number: ${formattedCardNumber}
Available Balance: ${currency} ${Number(balance).toLocaleString()}

YOUR 8-DIGIT CARD PASSWORD:
[ ${cardPassword} ]

How to use:
Whenever you checkout on MercatoX and choose MercatoX Card, enter this 8-digit password to authorize your order.

Security Notice: Never share this password with anyone.

MercatoX Marketplace
`;

    const transport = getTransporter();
    const info = await transport.sendMail({
      from: fromAddress,
      to: toEmail,
      subject,
      text: plainText,
      html: htmlContent,
    });

    console.log(
      `[Mailer] 8-digit card password email dispatched to ${toEmail} for card ${formattedCardNumber} (MessageId: ${info.messageId})`
    );

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error("[Mailer] Failed to send card password email:", err);
    return {
      success: false,
      error: err.message || "Failed to send email",
    };
  }
}

export interface DirectOrderEmailParams {
  orderNumber: string;
  orderId?: string;
  orderDate?: string | Date;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: {
    recipientName?: string;
    phone?: string;
    city?: string;
    subCity?: string;
    specificLocation?: string;
    notes?: string;
  };
  items: Array<{
    productTitle?: string;
    name?: string;
    title?: string;
    quantity: number;
    unitPrice?: number;
    price?: number;
    totalPrice?: number;
    unitOfMeasure?: string;
    sellerId?: string;
    sellerName?: string;
    sellerEmail?: string;
    image?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
}

export async function sendOrderEmailsDirectly(
  params: DirectOrderEmailParams
): Promise<{ customerSent: boolean; adminSent: boolean; sellerSentCount: number }> {
  const transport = getTransporter();
  const mailUser = process.env.MAIL_USER || "support@mercatox.et";
  const fromAddress = `"MercatoX Marketplace" <${mailUser}>`;
  const adminEmail = process.env.ADMIN_EMAIL || "support@mercatox.et";

  const {
    orderNumber,
    customerEmail,
    customerName = "Valued Customer",
    customerPhone = "Not provided",
    deliveryAddress = {},
    items = [],
    subtotal = 0,
    deliveryFee = 0,
    totalAmount = 0,
    paymentMethod = "Chapa Escrow (Telebirr / CBE / Card)",
    paymentStatus = "PAID",
  } = params;

  const formattedTotal = Number(totalAmount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " ETB";

  const formattedSubtotal = Number(subtotal || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " ETB";

  const formattedDelivery = Number(deliveryFee || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " ETB";

  const itemRowsHtml = items
    .map((it) => {
      const title = it.productTitle || it.name || it.title || "Mercato Wholesale Product";
      const qty = it.quantity || 1;
      const price = Number(it.unitPrice || it.price || 0).toLocaleString() + " ETB";
      const total = Number(it.totalPrice || (it.unitPrice || it.price || 0) * qty).toLocaleString() + " ETB";
      return `
        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
          <td style="padding: 12px 10px; font-size: 13px; color: #ffffff; font-weight: 600;">
            ${title}
          </td>
          <td style="padding: 12px 10px; font-size: 13px; color: #cbd5e1; text-align: center; font-weight: 700;">
            ${qty}
          </td>
          <td style="padding: 12px 10px; font-size: 13px; color: #cbd5e1; text-align: right;">
            ${price}
          </td>
          <td style="padding: 12px 10px; font-size: 13px; color: #34d399; text-align: right; font-weight: 700;">
            ${total}
          </td>
        </tr>`;
    })
    .join("");

  let customerSent = false;
  let adminSent = false;
  let sellerSentCount = 0;

  // 1. Send Customer Order Confirmation Email
  if (customerEmail && customerEmail.includes("@")) {
    try {
      const customerSubject = `🛍️ Order #${orderNumber} Confirmed (${formattedTotal}) | MercatoX`;
      const customerHtml = `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #070b19; font-family: sans-serif; color: #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #070b19; padding: 30px 12px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #0f172a; border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 16px; overflow: hidden;">
          <tr><td style="height: 5px; background: linear-gradient(90deg, #10b981, #06b6d4, #6366f1);"></td></tr>
          <tr>
            <td style="padding: 28px 28px 12px 28px; text-align: center;">
              <div style="display: inline-block; padding: 6px 14px; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 9999px; color: #34d399; font-size: 12px; font-weight: bold;">
                ✅ Order Confirmed &amp; Protected
              </div>
              <h1 style="color: #ffffff; font-size: 22px; margin: 14px 0 6px 0;">Thank You for Your Order!</h1>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">Order Number: <strong style="color: #ffffff;">${orderNumber}</strong></p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 28px;">
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <p style="margin: 4px 0; font-size: 13px;"><strong>Customer:</strong> ${customerName}</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Phone:</strong> ${customerPhone}</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Delivery Location:</strong> ${deliveryAddress.specificLocation || ""} ${deliveryAddress.subCity || ""}, ${deliveryAddress.city || "Addis Ababa"}</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Payment Method:</strong> ${paymentMethod}</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Status:</strong> <span style="color: #34d399; font-weight: bold;">${paymentStatus}</span></p>
              </div>

              <h3 style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0;">Order Summary</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 15px;">
                <thead>
                  <tr style="background: rgba(255, 255, 255, 0.04); border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <th style="padding: 8px 10px; text-align: left; font-size: 11px; color: #94a3b8;">ITEM</th>
                    <th style="padding: 8px 10px; text-align: center; font-size: 11px; color: #94a3b8;">QTY</th>
                    <th style="padding: 8px 10px; text-align: right; font-size: 11px; color: #94a3b8;">PRICE</th>
                    <th style="padding: 8px 10px; text-align: right; font-size: 11px; color: #94a3b8;">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRowsHtml}
                </tbody>
              </table>

              <div style="background: rgba(0, 0, 0, 0.2); border-radius: 10px; padding: 14px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                  <span style="color: #94a3b8;">Subtotal:</span>
                  <span style="color: #e2e8f0;">${formattedSubtotal}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                  <span style="color: #94a3b8;">Delivery Fee:</span>
                  <span style="color: #e2e8f0;">${formattedDelivery}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 8px;">
                  <span style="color: #ffffff;">Total Amount:</span>
                  <span style="color: #34d399;">${formattedTotal}</span>
                </div>
              </div>

              <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 10px; padding: 12px; font-size: 12px; color: #cbd5e1;">
                🛡️ <strong>MercatoX Escrow Protection:</strong> Your funds remain safely guarded until you receive and verify your delivery.
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 28px; background: #070b19; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center; font-size: 11px; color: #64748b;">
              MercatoX National Marketplace &bull; Addis Ababa, Ethiopia &bull; Support: support@mercatox.et
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const cInfo = await transport.sendMail({
        from: fromAddress,
        to: customerEmail,
        subject: customerSubject,
        html: customerHtml,
      });
      console.log(`[Mailer] Customer order confirmation sent to ${customerEmail} (MessageId: ${cInfo.messageId})`);
      customerSent = true;
    } catch (err: any) {
      console.error(`[Mailer] Error sending customer order email to ${customerEmail}:`, err.message || err);
    }
  }

  // 2. Send Admin New Order Alert Email
  try {
    const adminSubject = `🔔 New Order Received #${orderNumber} (${formattedTotal}) | Admin Alert`;
    const adminHtml = `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #070b19; font-family: sans-serif; color: #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #070b19; padding: 30px 12px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #0f172a; border: 1px solid rgba(99, 102, 241, 0.35); border-radius: 16px; overflow: hidden;">
          <tr><td style="height: 5px; background: linear-gradient(90deg, #6366f1, #06b6d4, #10b981);"></td></tr>
          <tr>
            <td style="padding: 24px 28px 10px 28px; text-align: center;">
              <h2 style="color: #6366f1; margin: 0 0 6px 0;">🔔 New Order Received!</h2>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">Order: <strong style="color: #ffffff;">${orderNumber}</strong> &bull; Total: <strong style="color: #34d399;">${formattedTotal}</strong></p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 28px;">
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
                <p style="margin: 3px 0; font-size: 13px;"><strong>Customer:</strong> ${customerName} (${customerEmail || "No email"})</p>
                <p style="margin: 3px 0; font-size: 13px;"><strong>Phone:</strong> ${customerPhone}</p>
                <p style="margin: 3px 0; font-size: 13px;"><strong>Address:</strong> ${deliveryAddress.specificLocation || ""} ${deliveryAddress.subCity || ""}, ${deliveryAddress.city || "Addis Ababa"}</p>
                <p style="margin: 3px 0; font-size: 13px;"><strong>Payment:</strong> ${paymentMethod} (<span style="color: #34d399;">${paymentStatus}</span>)</p>
              </div>

              <h4 style="color: #ffffff; margin: 0 0 8px 0;">Ordered Items (${items.length}):</h4>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 15px;">
                ${itemRowsHtml}
              </table>

              <div style="text-align: center; margin-top: 20px;">
                <a href="http://localhost:3000/dashboard/admin" style="display: inline-block; background: #6366f1; color: #ffffff; padding: 10px 24px; border-radius: 8px; font-weight: bold; font-size: 12px; text-decoration: none;">
                  View in Admin Dashboard &rarr;
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 28px; background: #070b19; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center; font-size: 11px; color: #64748b;">
              MercatoX Administration Console &bull; Automated Dispatch Alert
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const aInfo = await transport.sendMail({
      from: fromAddress,
      to: adminEmail,
      subject: adminSubject,
      html: adminHtml,
    });
    console.log(`[Mailer] Admin order alert email sent to ${adminEmail} (MessageId: ${aInfo.messageId})`);
    adminSent = true;
  } catch (err: any) {
    console.error(`[Mailer] Error sending admin order email to ${adminEmail}:`, err.message || err);
  }

  // 3. Send Seller / Product Owner Order Received Email
  // Group items by seller
  const sellerMap = new Map<string, typeof items>();
  for (const it of items) {
    const sKey = it.sellerEmail || it.sellerId || "default_seller";
    if (!sellerMap.has(sKey)) {
      sellerMap.set(sKey, []);
    }
    sellerMap.get(sKey)!.push(it);
  }

  for (const [sKey, sItems] of sellerMap.entries()) {
    const recipientSeller = sKey.includes("@") ? sKey : (sItems[0]?.sellerEmail || "support@mercatox.et");
    const sellerShopName = sItems[0]?.sellerName || "Mercato Merchant Store";
    const sellerSubtotal = sItems.reduce((acc, it) => acc + (it.totalPrice || (it.unitPrice || it.price || 0) * (it.quantity || 1)), 0);

    try {
      const sellerSubject = `📦 New Order for Your Store #${orderNumber} | MercatoX`;
      const sellerHtml = `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #070b19; font-family: sans-serif; color: #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #070b19; padding: 30px 12px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #0f172a; border: 1px solid rgba(6, 182, 212, 0.35); border-radius: 16px; overflow: hidden;">
          <tr><td style="height: 5px; background: linear-gradient(90deg, #06b6d4, #3b82f6, #10b981);"></td></tr>
          <tr>
            <td style="padding: 24px 28px 10px 28px; text-align: center;">
              <div style="display: inline-block; padding: 5px 12px; background: rgba(6, 182, 212, 0.15); border: 1px solid #06b6d4; border-radius: 9999px; color: #38bdf8; font-size: 11px; font-weight: bold;">
                📦 Store Dispatch Notification
              </div>
              <h2 style="color: #ffffff; margin: 12px 0 6px 0;">New Order Placed for ${sellerShopName}!</h2>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">Order Number: <strong style="color: #ffffff;">${orderNumber}</strong></p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 28px;">
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
                <p style="margin: 3px 0; font-size: 13px;"><strong>Buyer:</strong> ${customerName}</p>
                <p style="margin: 3px 0; font-size: 13px;"><strong>Buyer Phone:</strong> ${customerPhone}</p>
                <p style="margin: 3px 0; font-size: 13px;"><strong>Delivery Destination:</strong> ${deliveryAddress.specificLocation || ""} ${deliveryAddress.subCity || ""}, ${deliveryAddress.city || "Addis Ababa"}</p>
                <p style="margin: 3px 0; font-size: 13px;"><strong>Your Store Payout:</strong> <span style="color: #34d399; font-weight: bold;">${sellerSubtotal.toLocaleString()} ETB</span></p>
              </div>

              <h4 style="color: #ffffff; margin: 0 0 8px 0;">Items to Prepare and Pack:</h4>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 15px;">
                ${sItems.map((it) => `
                  <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                    <td style="padding: 10px 8px; font-size: 13px; color: #ffffff; font-weight: 600;">${it.productTitle || it.name}</td>
                    <td style="padding: 10px 8px; font-size: 13px; color: #38bdf8; text-align: center; font-weight: bold;">x${it.quantity}</td>
                    <td style="padding: 10px 8px; font-size: 13px; color: #34d399; text-align: right; font-weight: bold;">${(it.totalPrice || (it.unitPrice || it.price || 0) * it.quantity).toLocaleString()} ETB</td>
                  </tr>
                `).join("")}
              </table>

              <div style="text-align: center; margin-top: 20px;">
                <a href="http://localhost:3000/dashboard/seller" style="display: inline-block; background: #06b6d4; color: #ffffff; padding: 10px 24px; border-radius: 8px; font-weight: bold; font-size: 12px; text-decoration: none;">
                  Open Seller Portal &rarr;
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 28px; background: #070b19; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center; font-size: 11px; color: #64748b;">
              MercatoX Merchant Operations &bull; Addis Ababa, Ethiopia
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const sInfo = await transport.sendMail({
        from: fromAddress,
        to: recipientSeller,
        subject: sellerSubject,
        html: sellerHtml,
      });
      console.log(`[Mailer] Seller order alert email sent to ${recipientSeller} (MessageId: ${sInfo.messageId})`);
      sellerSentCount++;
    } catch (err: any) {
      console.error(`[Mailer] Error sending seller order email to ${recipientSeller}:`, err.message || err);
    }
  }

  return { customerSent, adminSent, sellerSentCount };
}
