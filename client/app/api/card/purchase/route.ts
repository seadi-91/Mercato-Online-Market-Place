import { NextResponse } from "next/server";
import { getCardsByUser } from "@/lib/api/card-db";
import { recordPaymentInDatabase } from "@/lib/api/payment-db";
import crypto from "crypto";

import fs from "fs";
import path from "path";

// Helper to retrieve official admin-enforced card price
function getAdminCardPrice(clientFee?: number): number {
  try {
    const settingsPath = path.resolve(process.cwd(), "..", "server", "platform-settings.json");
    if (fs.existsSync(settingsPath)) {
      const data = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
      if (data.cardIssuanceFee) {
        const parsed = Number(data.cardIssuanceFee);
        if (!isNaN(parsed) && parsed >= 0) return parsed;
      }
    }
  } catch { }
  if (clientFee && clientFee > 0) return clientFee;
  return 150;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      cardholderName,
      email,
      phoneNumber,
      loadedAmount = 0,
      themeId = "mercatox-signature",
      customerId,
      cardFee: requestedFee,
      returnUrl: customReturnUrl,
    } = body || {};

    if (!cardholderName || !cardholderName.trim()) {
      return NextResponse.json(
        { success: false, error: "Cardholder full name is required" },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const cardFee = getAdminCardPrice(Number(requestedFee));
    const cleanAmount = Math.max(0, Number(loadedAmount) || 0);
    const totalAmount = cardFee + cleanAmount;

    // Generate authentic 16-digit card number (4 blocks of 4 digits)
    const b1 = 4892;
    const b2 = Math.floor(1000 + Math.random() * 9000);
    const b3 = Math.floor(1000 + Math.random() * 9000);
    const b4 = Math.floor(1000 + Math.random() * 9000);
    const cardNumber = `${b1} ${b2} ${b3} ${b4}`;
    const cvv = Math.floor(100 + Math.random() * 900).toString();
    const expiryDate = "10/29";

    // Split name
    const trimmedName = cardholderName.trim();
    const nameParts = trimmedName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "Buyer";

    // Validate phone number strictly from user info
    if (!phoneNumber || !phoneNumber.trim()) {
      return NextResponse.json(
        { success: false, error: "A valid phone number is required to issue your card" },
        { status: 400 }
      );
    }

    let digits = (phoneNumber || "").replace(/\D/g, "");
    if (digits.startsWith("251")) digits = digits.slice(3);
    if (digits.startsWith("0")) digits = digits.slice(1);
    if (digits.length < 9) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 9 or 10-digit Ethiopian mobile number (e.g. 09... or 07...)" },
        { status: 400 }
      );
    }
    const cleanPhone = "0" + digits.slice(-9);

    // Validate real user email
    const validEmail = email.trim().toLowerCase();
    if (!validEmail || !validEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required to issue your card" },
        { status: 400 }
      );
    }

    // Verify 1 card limit per user: strictly 1 ACTIVE card only for 1 user
    try {
      const existingCards = await getCardsByUser({
        email: validEmail,
        phoneNumber: cleanPhone,
        customerId: customerId || undefined,
      });

      const activeExistingCard = existingCards.find((c) => c.status === "ACTIVE");
      if (activeExistingCard) {
        return NextResponse.json(
          {
            success: false,
            error: "You already own an active MercatoX Card. Strictly 1 card is permitted per user account.",
            card: activeExistingCard,
          },
          { status: 400 }
        );
      }
    } catch (checkErr) {
      console.warn("[Card Purchase Limit Check] Warning:", checkErr);
    }

    // Generate unique transaction reference
    const txRef = `MX-CARD-CHAPA-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Resolve app origin for return_url
    const reqOrigin =
      req.headers.get("origin") ||
      req.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
      "http://localhost:3000";

    const returnUrl = customReturnUrl || `${reqOrigin}/card?tx_ref=${encodeURIComponent(txRef)}`;
    const callbackUrl = `${reqOrigin}/payments/webhook/chapa`;

    // Chapa credentials
    const chapaSecretKey = process.env.CHAPA_SECRET_KEY || "";
    const chapaBaseUrl =
      process.env.CHAPA_BASE_URL || "https://api.chapa.co/v1";

    if (!chapaSecretKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Chapa payment gateway is not configured on the server. Card cannot be issued without payment.",
        },
        { status: 500 }
      );
    }

    const chapaPayload = {
      amount: Math.round(totalAmount).toString(),
      currency: "ETB",
      email: validEmail,
      first_name: firstName,
      last_name: lastName,
      phone_number: cleanPhone,
      tx_ref: txRef,
      callback_url: callbackUrl,
      return_url: returnUrl,
      "customization[title]": "MercatoX Digital Card Issuance",
      "customization[description]": `Card issuance fee (ETB ${cardFee}) + initial balance deposit (ETB ${cleanAmount})`,
    };

    let checkoutUrl = "";
    let chapaErrorMsg = "";

    try {
      const chapaRes = await fetch(`${chapaBaseUrl}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${chapaSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chapaPayload),
      });

      const chapaData = await chapaRes.json().catch(() => ({}));
      if (chapaRes.ok && chapaData.status === "success" && chapaData.data?.checkout_url) {
        checkoutUrl = chapaData.data.checkout_url;
      } else {
        chapaErrorMsg =
          typeof chapaData?.message === "string"
            ? chapaData.message
            : "Failed to initialize Chapa checkout session";
        console.warn("[Card Chapa Init] Non-success response:", chapaData);
      }
    } catch (chapaErr: any) {
      chapaErrorMsg = chapaErr?.message || "Failed to connect to Chapa Payment Gateway";
      console.error("[Card Chapa Init] Failed to communicate with Chapa API:", chapaErr);
    }

    if (!checkoutUrl) {
      return NextResponse.json(
        {
          success: false,
          error: chapaErrorMsg || "Could not initialize Chapa payment. Your MercatoX Card was not registered.",
        },
        { status: 502 }
      );
    }

    const cardPassword = Math.floor(10000000 + Math.random() * 90000000).toString();

    // Store ONLY a PENDING payment intent in payments DB.
    // The MercatoX Card will ONLY be created/registered in mercatox_cards after Chapa confirms payment success.
    await recordPaymentInDatabase({
      transactionReference: txRef,
      orderId: crypto.randomUUID(),
      customerId: customerId || null,
      sellerId: null,
      amount: totalAmount,
      currency: "ETB",
      provider: "CHAPA",
      status: "PENDING",
      escrowStatus: "HELD",
      metadata: {
        type: "MERCATOX_CARD_PURCHASE",
        pendingCard: {
          cardNumber,
          cardholderName: trimmedName,
          email: validEmail,
          phoneNumber: cleanPhone,
          themeId,
          balance: cleanAmount,
          initialAmount: cleanAmount,
          cardFee,
          totalPaid: totalAmount,
          currency: "ETB",
          expiryDate,
          cvv,
          customerId: customerId || null,
          cardPassword,
          chapaCheckoutUrl: checkoutUrl,
        },
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl,
      txRef,
      amount: totalAmount,
      balance: cleanAmount,
    });
  } catch (err: any) {
    console.error("[Card Purchase API Error]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process card purchase" },
      { status: 500 }
    );
  }
}
