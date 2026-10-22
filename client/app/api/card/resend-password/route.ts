import { NextResponse } from "next/server";
import { getCardsByUser, MercatoXCardRecord } from "@/lib/api/card-db";
import { getPaymentDbPool } from "@/lib/db";
import { sendCardPasswordEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, phoneNumber, customerId, cardNumber } = body || {};

    if (!email && !phoneNumber && !customerId && !cardNumber) {
      return NextResponse.json(
        { success: false, error: "Identification information is required to resend password" },
        { status: 400 }
      );
    }

    const pool = getPaymentDbPool();
    let targetCard: MercatoXCardRecord | undefined;

    // 1. Prioritize direct search by cardNumber if provided
    if (cardNumber && String(cardNumber).trim()) {
      const cleanNum = String(cardNumber).replace(/\D/g, "");
      const rawNum = String(cardNumber).trim();
      const res = await pool.query(
        `SELECT * FROM mercatox_cards WHERE REPLACE("cardNumber", ' ', '') = $1 OR "cardNumber" = $2 LIMIT 1`,
        [cleanNum, rawNum]
      );
      if (res.rows.length > 0) {
        targetCard = res.rows[0];
      }
    }

    // 2. If not found by cardNumber, search by user cards
    if (!targetCard) {
      const cards = await getCardsByUser({
        email: email ? String(email).trim().toLowerCase() : undefined,
        phoneNumber: phoneNumber ? String(phoneNumber).trim() : undefined,
        customerId: customerId ? String(customerId).trim() : undefined,
      });

      targetCard = cards.find((c) => c.status === "ACTIVE") || cards[0];
    }

    // 3. Fallback: Search by email directly in mercatox_cards table
    if (!targetCard && email && String(email).trim()) {
      const cleanEmail = String(email).trim().toLowerCase();
      const res = await pool.query(
        `SELECT * FROM mercatox_cards WHERE LOWER(TRIM(email)) = $1 ORDER BY "createdAt" DESC LIMIT 1`,
        [cleanEmail]
      );
      if (res.rows.length > 0) {
        targetCard = res.rows[0];
      }
    }

    // 4. Fallback: Search by phoneNumber directly
    if (!targetCard && phoneNumber && String(phoneNumber).trim()) {
      const rawPhone = String(phoneNumber).trim();
      const digits = rawPhone.replace(/\D/g, "");
      const res = await pool.query(
        `SELECT * FROM mercatox_cards WHERE "phoneNumber" LIKE $1 OR "phoneNumber" LIKE $2 ORDER BY "createdAt" DESC LIMIT 1`,
        [`%${digits.slice(-8)}%`, `%${rawPhone}%`]
      );
      if (res.rows.length > 0) {
        targetCard = res.rows[0];
      }
    }

    if (!targetCard) {
      return NextResponse.json(
        { success: false, error: "No active MercatoX Card found matching this card number or account" },
        { status: 404 }
      );
    }

    const cardPassword = (targetCard.cardPassword || "").trim();
    if (!cardPassword) {
      return NextResponse.json(
        { success: false, error: "Card password not found on file for this card" },
        { status: 400 }
      );
    }

    // Determine target recipient email: prefer valid non-example email
    let recipientEmail = (email || targetCard.email || "").trim().toLowerCase();
    if (!recipientEmail || recipientEmail.includes("example.com") || recipientEmail.includes(".mercatox@gmail.com")) {
      if (customerId) {
        try {
          const { getUsersDbPool } = await import("@/lib/db");
          const uPool = getUsersDbPool();
          const pRes = await uPool.query(
            `SELECT email FROM profiles WHERE "userId" = $1 OR id = $1 LIMIT 1`,
            [customerId]
          );
          if (pRes.rows.length > 0 && pRes.rows[0].email) {
            recipientEmail = pRes.rows[0].email.trim().toLowerCase();
          }
        } catch { }
      }
    }

    if (!recipientEmail || !recipientEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required to receive your 8-digit card password" },
        { status: 400 }
      );
    }

    // Ensure the card's email and customerId in DB are up to date
    try {
      const updates: string[] = ['email = $1', '"updatedAt" = NOW()'];
      const params: any[] = [recipientEmail];
      if (customerId && !targetCard.customerId) {
        params.push(customerId);
        updates.push(`"customerId" = $${params.length}`);
      }
      params.push(targetCard.id);
      await pool.query(
        `UPDATE mercatox_cards SET ${updates.join(', ')} WHERE id = $${params.length}`,
        params
      );
    } catch { }

    const result = await sendCardPasswordEmail({
      toEmail: recipientEmail,
      cardholderName: targetCard.cardholderName || "Valued Cardholder",
      cardNumber: targetCard.cardNumber,
      cardPassword: cardPassword,
      balance: Number(targetCard.balance || 0),
      currency: targetCard.currency || "ETB",
      expiryDate: targetCard.expiryDate || "10/29",
    });

    if (!result.success) {
      console.error("[Resend Password] Mailer returned failure:", result.error);
      return NextResponse.json(
        { success: false, error: result.error || "Failed to send email notification" },
        { status: 500 }
      );
    }

    console.log(`[Resend Password] Successfully sent 8-digit password for card ${targetCard.cardNumber} to ${recipientEmail}`);

    return NextResponse.json({
      success: true,
      message: `8-digit card password sent successfully to ${recipientEmail}`,
      email: recipientEmail,
      cardNumber: targetCard.cardNumber,
    });
  } catch (err: any) {
    console.error("[Resend Password API Error]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to resend password" },
      { status: 500 }
    );
  }
}
