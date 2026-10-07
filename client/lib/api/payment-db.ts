import { getPaymentDbPool } from "@/lib/db";
import crypto from "crypto";

const DEFAULT_CUSTOMER_ID = "609563b9-3c51-4b25-80c2-a3b238ee929f";
const DEFAULT_SELLER_ID = "59972f9f-49ec-4592-9113-ba70a0aa3a52";

function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id
  );
}

export type PaymentProviderType = "CHAPA" | "TELEBIRR" | "BANK_TRANSFER";
export type PaymentTransactionStatusType =
  | "INITIATED"
  | "PENDING"
  | "COMPLETED"
  | "RELEASED"
  | "FAILED"
  | "REFUNDED";
export type EscrowStatusType = "HELD" | "RELEASED" | "REFUNDED";

export interface RecordPaymentParams {
  transactionReference: string;
  orderId?: string | null;
  customerId?: string | null;
  sellerId?: string | null;
  amount: number;
  currency?: string;
  provider?: string;
  status?: PaymentTransactionStatusType;
  providerReference?: string | null;
  paymentReceiptUrl?: string | null;
  escrowStatus?: EscrowStatusType | null;
  metadata?: Record<string, any> | null;
}

/**
 * Saves or updates a payment record in the `mercatox_payment_db` database (`payments` table).
 */
export async function recordPaymentInDatabase(params: RecordPaymentParams) {
  const pool = getPaymentDbPool();
  const client = await pool.connect();

  try {
    const {
      transactionReference,
      orderId,
      customerId,
      sellerId,
      amount,
      currency = "ETB",
      provider = "CHAPA",
      status = "COMPLETED",
      providerReference,
      paymentReceiptUrl,
      escrowStatus = "HELD",
      metadata = {},
    } = params;

    if (!transactionReference) {
      throw new Error("transactionReference is required to record payment");
    }

    const resolvedOrderId = isValidUuid(orderId) ? orderId! : crypto.randomUUID();
    const resolvedCustomerId = isValidUuid(customerId)
      ? customerId!
      : DEFAULT_CUSTOMER_ID;
    const resolvedSellerId = isValidUuid(sellerId)
      ? sellerId!
      : DEFAULT_SELLER_ID;

    // Normalize provider to allowed enum: 'CHAPA', 'TELEBIRR', 'BANK_TRANSFER'
    let normProvider: PaymentProviderType = "CHAPA";
    const pUpper = (provider || "").toUpperCase();
    if (pUpper.includes("TELEBIRR")) normProvider = "TELEBIRR";
    else if (pUpper.includes("BANK") || pUpper.includes("CBE")) normProvider = "BANK_TRANSFER";
    else normProvider = "CHAPA";

    // Normalize status
    const normStatus: PaymentTransactionStatusType = status || "COMPLETED";
    const normEscrowStatus: EscrowStatusType = escrowStatus || "HELD";

    // Check if record exists
    const existing = await client.query(
      'SELECT id, "transactionReference", "orderId", status FROM payments WHERE "transactionReference" = $1 LIMIT 1',
      [transactionReference]
    );

    let paymentId: string;

    if (existing.rows.length > 0) {
      paymentId = existing.rows[0].id;
      // Update existing record
      await client.query(
        `
        UPDATE payments
        SET 
          "orderId" = COALESCE($1, "orderId"),
          "customerId" = COALESCE($2, "customerId"),
          "sellerId" = COALESCE($3, "sellerId"),
          amount = $4,
          currency = $5,
          provider = $6,
          status = $7,
          "providerReference" = COALESCE($8, "providerReference"),
          "paymentReceiptUrl" = COALESCE($9, "paymentReceiptUrl"),
          "escrowStatus" = $10,
          metadata = COALESCE(metadata, '{}'::jsonb) || $11::jsonb,
          "updatedAt" = NOW()
        WHERE "transactionReference" = $12
        `,
        [
          orderId && isValidUuid(orderId) ? orderId : null,
          customerId && isValidUuid(customerId) ? customerId : null,
          sellerId && isValidUuid(sellerId) ? sellerId : null,
          Number(amount),
          currency,
          normProvider,
          normStatus,
          providerReference || null,
          paymentReceiptUrl || null,
          normEscrowStatus,
          JSON.stringify(metadata || {}),
          transactionReference,
        ]
      );

      console.log(
        `[PaymentDB] Updated existing payment in mercatox_payment_db: ${transactionReference} (ID: ${paymentId})`
      );
    } else {
      // Insert new payment row
      paymentId = crypto.randomUUID();

      await client.query(
        `
        INSERT INTO payments (
          id,
          "transactionReference",
          "orderId",
          "customerId",
          "sellerId",
          amount,
          currency,
          provider,
          status,
          "providerReference",
          "paymentReceiptUrl",
          "escrowStatus",
          metadata,
          "createdAt",
          "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
        )
        `,
        [
          paymentId,
          transactionReference,
          resolvedOrderId,
          resolvedCustomerId,
          resolvedSellerId,
          Number(amount),
          currency,
          normProvider,
          normStatus,
          providerReference || transactionReference,
          paymentReceiptUrl || null,
          normEscrowStatus,
          JSON.stringify(metadata || {}),
        ]
      );

      console.log(
        `[PaymentDB] Inserted new payment in mercatox_payment_db: ${transactionReference} (ID: ${paymentId}, Amount: ${amount} ETB)`
      );
    }

    return {
      success: true,
      paymentId,
      transactionReference,
      orderId: resolvedOrderId,
      amount,
      status: normStatus,
      escrowStatus: normEscrowStatus,
      provider: normProvider,
    };
  } catch (err: any) {
    console.error("[PaymentDB] Error recording payment in mercatox_payment_db:", err);
    throw err;
  } finally {
    client.release();
  }
}
