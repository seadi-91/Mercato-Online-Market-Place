import { NextResponse } from "next/server";
import { recordPaymentInDatabase } from "@/lib/api/payment-db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const txRef = searchParams.get("tx_ref");

    if (!txRef) {
      return NextResponse.json(
        { success: false, error: "Missing tx_ref parameter" },
        { status: 400 }
      );
    }

    const chapaSecretKey =
      process.env.CHAPA_SECRET_KEY ||
      "CHASECK_TEST-kWkkoI6YlIJm6m5zR6Z2ERwmuqKWanPQ";
    const chapaBaseUrl =
      process.env.CHAPA_BASE_URL || "https://api.chapa.co/v1";

    const res = await fetch(
      `${chapaBaseUrl}/transaction/verify/${encodeURIComponent(txRef)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${chapaSecretKey}`,
        },
      }
    );

    const data = await res.json();

    let rewardResult: any = null;

    if (data.status === "success" && data.data?.status === "success") {
      const verifiedAmount = Number(data.data?.amount || 0);

      try {
        await recordPaymentInDatabase({
          transactionReference: txRef,
          amount: verifiedAmount,
          provider: "CHAPA",
          status: "COMPLETED",
          providerReference: data.data?.reference || txRef,
          escrowStatus: "HELD",
          metadata: {
            chapaVerifyData: data.data,
            verifiedAt: new Date().toISOString(),
          },
        });
      } catch (dbErr) {
        console.warn("[Chapa Verify API] Failed to update mercatox_payment_db:", dbErr);
      }

      // Automatically credit 2% order cashback reward to customer's MercatoX Card
      try {
        const { creditChapaOrderRewardToCard } = await import("@/lib/api/card-db");
        rewardResult = await creditChapaOrderRewardToCard({
          txRef,
          amount: verifiedAmount,
          email: data.data?.email,
          cardholderName: `${data.data?.first_name || ""} ${data.data?.last_name || ""}`.trim(),
          paymentMethod: "CHAPA",
        });
      } catch (rewardErr) {
        console.error("[Chapa Verify API] Error crediting 2% card reward:", rewardErr);
      }
    }

    return NextResponse.json({
      ...data,
      reward: rewardResult,
    });
  } catch (err: any) {
    console.error("[Chapa Verify API] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to verify transaction with Chapa",
      },
      { status: 500 }
    );
  }
}
