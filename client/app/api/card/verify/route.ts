import { NextResponse } from "next/server";
import {
  createCardRecord,
  getCardByTxRef,
  getCardsByUser,
  updateCardByTxRef,
} from "@/lib/api/card-db";
import { getPaymentDbPool } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const txRef = (searchParams.get("tx_ref") || searchParams.get("trx_ref"))?.trim();

    if (!txRef) {
      return NextResponse.json(
        { success: false, verified: false, error: "Transaction reference (tx_ref) is required" },
        { status: 400 }
      );
    }

    const chapaSecretKey = process.env.CHAPA_SECRET_KEY || "";
    const chapaBaseUrl =
      process.env.CHAPA_BASE_URL || "https://api.chapa.co/v1";

    if (!chapaSecretKey) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Chapa secret key is not configured for card payment verification.",
        },
        { status: 500 }
      );
    }

    // 1. Strictly verify payment status directly with Chapa API
    let chapaRes: Response;
    let data: any = {};
    try {
      chapaRes = await fetch(
        `${chapaBaseUrl}/transaction/verify/${encodeURIComponent(txRef)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${chapaSecretKey}`,
          },
          cache: "no-store",
        }
      );
      data = await chapaRes.json().catch(() => ({}));
    } catch (chapaErr: any) {
      console.error("[Card Chapa Verify] Failed to query Chapa verify API:", chapaErr);
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Could not verify payment status with Chapa. Your card has not been registered.",
        },
        { status: 502 }
      );
    }

    const isChapaPaid =
      chapaRes.ok &&
      data?.status === "success" &&
      data?.data?.status === "success";

    if (!isChapaPaid) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          status: data?.data?.status || data?.status || "unpaid",
          error:
            typeof data?.message === "string" && !data.message.toLowerCase().includes("fetched")
              ? data.message
              : "Chapa payment has not been completed yet. Please enter your payment details on Chapa and complete payment first.",
        },
        { status: 400 }
      );
    }

    const verifiedAmount = Number(data?.data?.amount || 0);

    // 2. Check if card was already registered for this txRef (idempotent retry)
    let card = await getCardByTxRef(txRef);

    // Fetch pending payment metadata stored during /api/card/purchase
    let paymentRow: any = null;
    try {
      const payPool = getPaymentDbPool();
      const payRes = await payPool.query(
        `SELECT * FROM payments WHERE "transactionReference" = $1 OR "providerReference" = $1 LIMIT 1`,
        [txRef]
      );
      if (payRes.rows.length > 0) {
        paymentRow = payRes.rows[0];
      }
    } catch (dbErr) {
      console.warn("[Card Verify] Could not query payments DB:", dbErr);
    }

    if (!card) {
      const pendingCard = paymentRow?.metadata?.pendingCard;
      if (!pendingCard) {
        return NextResponse.json(
          {
            success: false,
            verified: false,
            error: "No pending MercatoX Card purchase record found for this transaction reference.",
          },
          { status: 404 }
        );
      }

      // Guard against duplicate active cards on the same account
      const existingActive = await getCardsByUser({
        email: pendingCard.email,
        phoneNumber: pendingCard.phoneNumber,
        customerId: pendingCard.customerId || undefined,
      });

      if (existingActive.length > 0) {
        card = existingActive[0];
      } else {
        const expectedTotal = Number(pendingCard.totalPaid || 0);
        if (expectedTotal > 0 && verifiedAmount > 0 && verifiedAmount + 1 < expectedTotal) {
          return NextResponse.json(
            {
              success: false,
              verified: false,
              error: `Paid amount (ETB ${verifiedAmount}) does not match required card total (ETB ${expectedTotal}).`,
            },
            { status: 400 }
          );
        }

        // Only now that Chapa confirmed success: create and register ACTIVE card in DB
        card = await createCardRecord({
          cardNumber: pendingCard.cardNumber,
          cardholderName: pendingCard.cardholderName,
          email: pendingCard.email,
          phoneNumber: pendingCard.phoneNumber,
          themeId: pendingCard.themeId || "mercatox-signature",
          balance: Number(pendingCard.balance || 0),
          initialAmount: Number(pendingCard.initialAmount || 0),
          cardFee: Number(pendingCard.cardFee || 150),
          totalPaid: Number(pendingCard.totalPaid || verifiedAmount || 0),
          currency: pendingCard.currency || "ETB",
          expiryDate: pendingCard.expiryDate || "10/29",
          cvv: pendingCard.cvv,
          status: "ACTIVE",
          paymentMethod: "CHAPA",
          transactionReference: txRef,
          chapaCheckoutUrl: pendingCard.chapaCheckoutUrl || undefined,
          customerId: pendingCard.customerId || undefined,
          cardPassword: pendingCard.cardPassword,
        });
      }
    } else if (card.status !== "ACTIVE") {
      card = await updateCardByTxRef(txRef, { status: "ACTIVE" });
    }

    if (card) {
      // Ensure the card has an authentic 8-digit card password
      let cardPassword = (card.cardPassword || "").trim();
      if (!cardPassword || !/^\d{8}$/.test(cardPassword)) {
        cardPassword = Math.floor(10000000 + Math.random() * 90000000).toString();
        await updateCardByTxRef(txRef, { cardPassword });
        card.cardPassword = cardPassword;
      }

      let mailErrorMsg: string | undefined;

      // Send 8-digit Card Password via Email ONLY upon verified Chapa payment completion
      if (!card.passwordEmailSent) {
        try {
          const { isDeliverableEmail, sendCardPasswordEmail } = await import("@/lib/mailer");
          const { markCardPasswordEmailSent } = await import("@/lib/api/card-db");

          let targetEmail = (card.email || "").trim().toLowerCase();
          if (!isDeliverableEmail(targetEmail)) {
            if (isDeliverableEmail(data?.data?.email)) {
              targetEmail = String(data.data.email).trim().toLowerCase();
            } else if (card.customerId) {
              try {
                const { getUsersDbPool } = await import("@/lib/db");
                const uPool = getUsersDbPool();
                const pRes = await uPool.query(
                  `SELECT email FROM profiles WHERE "userId" = $1 OR id = $1 LIMIT 1`,
                  [card.customerId]
                );
                if (pRes.rows.length > 0 && isDeliverableEmail(pRes.rows[0].email)) {
                  targetEmail = pRes.rows[0].email.trim().toLowerCase();
                }
              } catch {}
            }
            if (isDeliverableEmail(targetEmail)) {
              card.email = targetEmail;
              await updateCardByTxRef(txRef, { email: targetEmail } as any).catch(() => null);
            }
          }

          const mailRes = await sendCardPasswordEmail({
            toEmail: targetEmail,
            cardholderName: card.cardholderName,
            cardNumber: card.cardNumber,
            cardPassword: cardPassword,
            balance: Number(card.balance || 0),
            currency: card.currency || "ETB",
            expiryDate: card.expiryDate,
          });

          if (mailRes.success) {
            await markCardPasswordEmailSent(card.id);
            card.passwordEmailSent = true;
            console.log(`[Card Verify] Successfully sent 8-digit card password email to ${targetEmail}`);
          } else {
            mailErrorMsg = mailRes.error;
            console.warn(`[Card Verify] Mailer returned failure:`, mailRes.error);
          }
        } catch (mailErr: any) {
          mailErrorMsg = mailErr?.message || "Failed to dispatch card password email";
          console.error("[Card Verify] Failed to dispatch card password email:", mailErr);
        }
      }

      try {
        const { recordPaymentInDatabase } = await import("@/lib/api/payment-db");
        await recordPaymentInDatabase({
          transactionReference: txRef,
          orderId: paymentRow?.orderId,
          amount: verifiedAmount || Number(card.totalPaid || 0),
          currency: card.currency || "ETB",
          provider: "CHAPA",
          status: "COMPLETED",
          escrowStatus: "RELEASED",
          providerReference: data.data?.reference || txRef,
          customerId: card.customerId || paymentRow?.customerId || null,
          metadata: {
            type: "MERCATOX_CARD_PURCHASE_VERIFIED",
            cardId: card.id,
            cardNumber: card.cardNumber,
            cardholderName: card.cardholderName,
            balance: card.balance,
            chapaStatus: data.data?.status,
          },
        });
      } catch (payErr) {
        console.warn("[Card Verify] Note on updating payment record:", payErr);
      }
      return NextResponse.json({
        success: true,
        verified: true,
        card,
        passwordEmailSent: card?.passwordEmailSent ?? false,
        mailError: mailErrorMsg,
      });
    }

    return NextResponse.json({
      success: true,
      verified: true,
      card,
      passwordEmailSent: false,
    });
  } catch (err: any) {
    console.error("[Card Verify API Error]", err);
    return NextResponse.json(
      { success: false, verified: false, error: err.message || "Failed to verify transaction" },
      { status: 500 }
    );
  }
}
