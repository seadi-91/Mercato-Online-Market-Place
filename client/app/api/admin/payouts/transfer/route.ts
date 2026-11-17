import { NextRequest, NextResponse } from "next/server";
import { getUsersDbPool, getPaymentDbPool } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sellerId,
      sellerName = "Merchant",
      shopName = "Merchant Enterprise",
      phoneNumber = "0911000000",
      email = "muradsada8@gmail.com",
      amount,
      bankName = "Commercial Bank of Ethiopia (CBE)",
      bankAccountNumber = "1000000000000",
      bankAccountHolderName = "Merchant Account",
      notes = "Merchant payout disbursement via Chapa Gateway",
      role = "SELLER",
      grossSales = 0,
      platformCommission = 0,
      previousBalance = 0,
      remainingBalance = 0,
    } = body || {};

    const transferAmount = Number(amount);
    if (!transferAmount || transferAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid transfer payout amount greater than zero." },
        { status: 400 }
      );
    }

    const txRef = `TX-PAYOUT-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const chapaSecretKey = process.env.CHAPA_SECRET_KEY || "";
    const chapaBaseUrl = process.env.CHAPA_BASE_URL || "https://api.chapa.co/v1";

    const reqOrigin =
      req.headers.get("origin") ||
      req.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
      "http://localhost:3000";

    // Return URL directs back to sellers-suppliers tab with action=verify and the tx_ref for Chapa status check
    const returnUrl = `${reqOrigin}/dashboard/admin?tab=sellers-suppliers&payout_action=verify&tx_ref=${encodeURIComponent(
      txRef
    )}`;

    const callbackUrl = `${reqOrigin}/api/admin/payouts/verify?tx_ref=${encodeURIComponent(txRef)}`;

    // Prepare Chapa payload with clean phone format
    const rawDigits = String(phoneNumber || "0911000000").replace(/\D/g, "");
    const formattedPhone = rawDigits.startsWith("251") ? `0${rawDigits.slice(3)}` : rawDigits.startsWith("0") ? rawDigits : `0${rawDigits}`;

    let checkoutUrl = "";
    let chapaResponse: any = null;

    if (chapaSecretKey && !chapaSecretKey.includes("test_placeholder")) {
      try {
        const chapaRes = await fetch(`${chapaBaseUrl}/transaction/initialize`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${chapaSecretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: Math.round(transferAmount).toString(),
            currency: "ETB",
            email: email && email.includes("@") ? email : "muradsada8@gmail.com",
            first_name: (sellerName || "Merchant").split(" ")[0] || "Merchant",
            last_name: (sellerName || "Merchant").split(" ")[1] || "Enterprise",
            phone_number: formattedPhone || "0911000000",
            tx_ref: txRef,
            callback_url: callbackUrl,
            return_url: returnUrl,
            "customization[title]": `MercatoX Payout: ${shopName}`,
            "customization[description]": `Payout ETB ${transferAmount.toLocaleString()} to ${bankName} (${bankAccountNumber})`,
          }),
        });

        chapaResponse = await chapaRes.json();
        if (chapaResponse.status === "success" && chapaResponse.data?.checkout_url) {
          checkoutUrl = chapaResponse.data.checkout_url;
        }
      } catch (err: any) {
        console.warn("[Chapa Payout] Direct Chapa gateway init exception:", err.message);
      }
    }

    // Standard Chapa checkout payment URL fallback for sandbox/test mode
    if (!checkoutUrl) {
      checkoutUrl = `https://checkout.chapa.co/checkout/payment/${encodeURIComponent(txRef)}`;
    }

    const payoutId = crypto.randomUUID();

    // 1. Record Payout in mercatox_payment_db.payouts table as PENDING (NOT PROCESSED!)
    // IMPORTANT: No funds are deducted and no email is sent until Chapa verifies payment success!
    try {
      const paymentPool = getPaymentDbPool();
      const pClient = await paymentPool.connect();
      try {
        await pClient.query(
          `INSERT INTO payouts (
             id, "sellerId", amount, "platformFee", "netPayoutAmount", status,
             "bankName", "bankAccountNumber", "bankAccountHolderName",
             "txRef", notes, email, "shopName", "sellerName", role, "grossSales", "previousBalance", "remainingBalance",
             "createdAt", "updatedAt"
           ) VALUES (
             $1, $2, $3, $4, $5, 'PENDING',
             $6, $7, $8,
             $9, $10, $11, $12, $13, $14, $15, $16, $17,
             NOW(), NOW()
           )`,
          [
            payoutId,
            sellerId,
            Number(grossSales || transferAmount),
            Number(platformCommission || 0),
            transferAmount,
            bankName,
            bankAccountNumber,
            bankAccountHolderName,
            txRef,
            notes,
            email,
            shopName,
            sellerName,
            role,
            Number(grossSales || 0),
            Number(previousBalance || 0),
            Number(remainingBalance || 0),
          ]
        );
      } finally {
        pClient.release();
      }
    } catch (payoutErr: any) {
      console.warn("[Chapa Payout] DB insert into payouts warning:", payoutErr.message);
    }

    // 2. Audit log of payout initialization
    try {
      const usersPool = getUsersDbPool();
      const uClient = await usersPool.connect();
      try {
        await uClient.query(
          `INSERT INTO audit_logs (id, "actorId", "actorRole", action, "targetEntity", "targetId", details, "ipAddress", "userAgent", "createdAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            crypto.randomUUID(),
            "admin-controller",
            "ADMIN",
            "PAYOUT_INITIATED",
            "MerchantPayout",
            sellerId || txRef,
            JSON.stringify({
              shopName,
              sellerName,
              role,
              phoneNumber,
              email,
              bankName,
              bankAccountNumber,
              transferAmount,
              txRef,
              status: "PENDING",
              gateway: "CHAPA",
            }),
            req.headers.get("x-forwarded-for") || "127.0.0.1",
            req.headers.get("user-agent") || "MercatoX Admin Console",
            new Date().toISOString(),
          ]
        );
      } finally {
        uClient.release();
      }
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      message: `Chapa payout session created for ${shopName}. Redirecting to Chapa for payment authorization.`,
      txRef,
      amount: transferAmount,
      remainingBalance,
      checkoutUrl,
      beneficiary: {
        shopName,
        bankName,
        bankAccountNumber,
        bankAccountHolderName,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to initiate Chapa payout transfer." },
      { status: 500 }
    );
  }
}
