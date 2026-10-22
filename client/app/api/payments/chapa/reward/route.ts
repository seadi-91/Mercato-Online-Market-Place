import { NextResponse } from "next/server";
import { creditChapaOrderRewardToCard } from "@/lib/api/card-db";

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
