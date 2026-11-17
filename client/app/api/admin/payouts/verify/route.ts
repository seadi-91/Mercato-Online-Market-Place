import { NextRequest, NextResponse } from "next/server";
import { getUsersDbPool, getPaymentDbPool } from "@/lib/db";
import { sendPayoutNotificationEmail } from "@/lib/payout-mailer";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  return handleVerification(req);
}

export async function POST(req: NextRequest) {
  return handleVerification(req);
}

async function handleVerification(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let rawTxRef =
      searchParams.get("tx_ref") ||
      searchParams.get("trx_ref") ||
      searchParams.get("reference") ||
      searchParams.get("txRef");

    if (!rawTxRef && req.method === "POST") {
      try {
        const body = await req.json();
        rawTxRef = body.tx_ref || body.txRef || body.trx_ref || body.reference;
      } catch {
        // ignore
      }
    }

    // Clean any query string or fragment characters (e.g. "?trx_ref=..." or "&...")
    const txRef = rawTxRef ? rawTxRef.split(/[?&#]/)[0].trim() : "";

    if (!txRef) {
      return NextResponse.json(
        { success: false, error: "Missing transaction reference (tx_ref)" },
        { status: 400 }
      );
    }

    const chapaSecretKey = process.env.CHAPA_SECRET_KEY || "";
    const chapaBaseUrl = process.env.CHAPA_BASE_URL || "https://api.chapa.co/v1";

    // 1. Verify transaction status with Chapa Gateway
    let chapaVerified = false;
    let chapaData: any = null;

    if (chapaSecretKey && !chapaSecretKey.includes("test_placeholder")) {
      try {
        const chapaRes = await fetch(`${chapaBaseUrl}/transaction/verify/${encodeURIComponent(txRef)}`, {
          headers: {
            Authorization: `Bearer ${chapaSecretKey}`,
          },
        });
        const json = await chapaRes.json();
        chapaData = json;

        if (
          json.status === "success" &&
          (json.data?.status === "success" ||
            json.data?.status === "paid" ||
            json.data?.status === "completed")
        ) {
          chapaVerified = true;
        } else {
          console.log(`[Chapa Verify] Transaction ${txRef} status on Chapa:`, json);
        }
      } catch (err: any) {
        console.warn(`[Chapa Verify Exception] Error checking Chapa for ${txRef}:`, err.message);
      }
    }

    const paymentPool = getPaymentDbPool();
    const pClient = await paymentPool.connect();

    try {
      // 2. Look up the payout record from database
      const pRes = await pClient.query(
        `SELECT * FROM payouts WHERE "txRef" = $1 OR $1 LIKE "txRef" || '%' LIMIT 1`,
        [txRef]
      );
      const payout = pRes.rows[0];

      if (!payout) {
        return NextResponse.json(
          { success: false, verified: false, cancelled: true, error: "Payout transaction record not found in database." },
          { status: 404 }
        );
      }

      // If already processed in DB, return verified state
      if (payout.status === "PROCESSED") {
        return NextResponse.json({
          success: true,
          verified: true,
          alreadyProcessed: true,
          txRef,
          amount: Number(payout.netPayoutAmount || 0),
          remainingBalance: Number(payout.remainingBalance || 0),
          merchant: payout.shopName || "Merchant",
          email: payout.email,
        });
      }

      // 3. IF CHAPA SAYS PAYMENT WAS NOT SUCCESSFUL (OR CANCELLED/ABANDONED):
      if (!chapaVerified) {
        const chapaStatus = chapaData?.data?.status || chapaData?.status;
        const isStillPending = chapaStatus === "pending" || (!chapaData && !chapaSecretKey);

        if (isStillPending) {
          return NextResponse.json({
            success: false,
            verified: false,
            pending: true,
            message: "Payment is still processing on Chapa. Please wait...",
            txRef,
            merchant: payout.shopName,
          });
        }

        // Mark payout as FAILED / CANCELLED so no funds are deducted!
        await pClient.query(
          `UPDATE payouts SET status = 'FAILED', "updatedAt" = NOW() WHERE id = $1 AND status = 'PENDING'`,
          [payout.id]
        );

        return NextResponse.json({
          success: false,
          verified: false,
          cancelled: true,
          message: "Payment was not completed or was cancelled on Chapa. No funds were deducted from merchant balance.",
          txRef,
          merchant: payout.shopName,
        });
      }

      // 4. IF CHAPA VERIFIED SUCCESS:
      // Update payout to PROCESSED so it is now officially deducted in DB
      await pClient.query(
        `UPDATE payouts SET status = 'PROCESSED', "processedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1`,
        [payout.id]
      );

      const transferAmount = Number(payout.netPayoutAmount || 0);
      const grossSales = Number(payout.grossSales || 0);
      const platformCommission = Number(payout.platformFee || 0);
      const previousBalance = Number(payout.previousBalance || 0);
      const remainingBalance = Number(payout.remainingBalance || 0);

      // 5. Send Email Statement Notification to Merchant & Admin
      const emailTarget = payout.email && payout.email.includes("@") ? payout.email : "muradsada8@gmail.com";
      try {
        await sendPayoutNotificationEmail({
          toEmail: emailTarget,
          sellerName: payout.sellerName || "Merchant",
          shopName: payout.shopName || "Merchant Enterprise",
          phoneNumber: payout.phoneNumber,
          role: (payout.role || "SELLER") as "SELLER" | "SUPPLIER",
          txRef,
          transferAmount,
          transferredAt: new Date(),
          bankName: payout.bankName,
          bankAccountNumber: payout.bankAccountNumber,
          bankAccountHolderName: payout.bankAccountHolderName,
          grossSales,
          platformCommission,
          previousBalance,
          remainingBalance,
        });
      } catch (mailErr: any) {
        console.warn("[Payout Verification Mail] Email send exception:", mailErr.message);
      }

      // 6. Record in-platform audit log
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
              "PAYOUT_RELEASED",
              "MerchantPayout",
              payout.sellerId || txRef,
              JSON.stringify({
                shopName: payout.shopName,
                sellerName: payout.sellerName,
                bankName: payout.bankName,
                bankAccountNumber: payout.bankAccountNumber,
                transferAmount,
                remainingBalance,
                txRef,
                gateway: "CHAPA",
                verified: true,
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
        verified: true,
        txRef,
        amount: transferAmount,
        previousBalance,
        remainingBalance,
        merchant: payout.shopName,
        sellerName: payout.sellerName,
        bankName: payout.bankName,
        bankAccountNumber: payout.bankAccountNumber,
        email: emailTarget,
      });
    } finally {
      pClient.release();
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to verify payout transaction." },
      { status: 500 }
    );
  }
}
