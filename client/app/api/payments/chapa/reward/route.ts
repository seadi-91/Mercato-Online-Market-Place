import { NextResponse } from "next/server";
import { creditChapaOrderRewardToCard } from "@/lib/api/card-db";
import { getPaymentDbPool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderId,
      orderNumber,
      txRef,
      amount,
      customerId,
      email,
      phoneNumber,
      cardholderName,
      paymentMethod = "CHAPA",
    } = body || {};

    if (!txRef) {
      return NextResponse.json(
        { success: false, error: "Transaction reference (txRef) is required" },
        { status: 400 }
      );
    }

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid order amount is required" },
        { status: 400 }
      );
    }

    // Security check: Only allow cashback reward if payment is confirmed COMPLETED in DB
    const payPool = getPaymentDbPool();
    const payCheck = await payPool.query(
      `SELECT id, status FROM payments WHERE "transactionReference" = $1 LIMIT 1`,
      [txRef]
    );
    if (payCheck.rows.length === 0 || payCheck.rows[0].status !== "COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          rewardApplied: false,
          error: "Payment has not been verified as completed via Chapa.",
        },
        { status: 400 }
      );
    }

    const result = await creditChapaOrderRewardToCard({
      orderId,
      orderNumber,
      txRef,
      amount: Number(amount),
      customerId,
      email,
      phoneNumber,
      cardholderName,
      paymentMethod,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[Chapa Reward API Route] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process card cashback reward",
      },
      { status: 500 }
    );
  }
}
