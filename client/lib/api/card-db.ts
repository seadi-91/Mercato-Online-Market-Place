import { getPaymentDbPool } from "@/lib/db";
import crypto from "crypto";

export interface MercatoXCardRecord {
  id: string;
  cardNumber: string;
  cardholderName: string;
  email: string;
  phoneNumber: string;
  themeId: string;
  balance: number;
  initialAmount: number;
  cardFee: number;
  totalPaid: number;
  currency: string;
  expiryDate: string;
  cvv: string;
  status: "ACTIVE" | "PENDING" | "FROZEN";
  paymentMethod: string;
  transactionReference?: string | null;
  chapaCheckoutUrl?: string | null;
  customerId?: string | null;
  createdAt: string;
  updatedAt: string;
}

let tableEnsured = false;

/**
 * Ensures the `mercatox_cards` table and indexes exist in `mercatox_payment_db`.
 */
export async function ensureCardsTable(): Promise<void> {
  if (tableEnsured) return;
  const pool = getPaymentDbPool();
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS mercatox_cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "cardNumber" VARCHAR(50) UNIQUE NOT NULL,
        "cardholderName" VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        "phoneNumber" VARCHAR(50) NOT NULL,
        "themeId" VARCHAR(50) NOT NULL,
        balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        "initialAmount" NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        "cardFee" NUMERIC(12, 2) NOT NULL DEFAULT 150.00,
        "totalPaid" NUMERIC(12, 2) NOT NULL DEFAULT 150.00,
        currency VARCHAR(10) NOT NULL DEFAULT 'ETB',
        "expiryDate" VARCHAR(10) NOT NULL DEFAULT '10/29',
        cvv VARCHAR(10) NOT NULL DEFAULT '821',
        status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
        "paymentMethod" VARCHAR(50) NOT NULL DEFAULT 'CHAPA',
        "transactionReference" VARCHAR(255),
        "chapaCheckoutUrl" VARCHAR(500),
        "customerId" UUID,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_mercatox_cards_card_number ON mercatox_cards ("cardNumber");
      CREATE INDEX IF NOT EXISTS idx_mercatox_cards_email ON mercatox_cards (email);
      CREATE INDEX IF NOT EXISTS idx_mercatox_cards_customer_id ON mercatox_cards ("customerId");
      ALTER TABLE mercatox_cards ALTER COLUMN "customerId" TYPE VARCHAR(100) USING "customerId"::text;
    `);
    tableEnsured = true;
  } catch (err) {
    console.error("[Card DB] Error ensuring mercatox_cards table:", err);
  } finally {
    client.release();
  }
}

/**
 * Saves a new card record into the database.
 */
export async function createCardRecord(params: {
  cardNumber: string;
  cardholderName: string;
  email: string;
  phoneNumber: string;
  themeId: string;
  balance: number;
  initialAmount: number;
  cardFee: number;
  totalPaid: number;
  currency?: string;
  expiryDate?: string;
  cvv?: string;
  status?: "ACTIVE" | "PENDING";
  paymentMethod?: string;
  transactionReference?: string;
  chapaCheckoutUrl?: string;
  customerId?: string;
}): Promise<MercatoXCardRecord> {
  await ensureCardsTable();
  const pool = getPaymentDbPool();
  const client = await pool.connect();

  try {
    const id = crypto.randomUUID();
    const currency = params.currency || "ETB";
    const expiryDate = params.expiryDate || "10/29";
    const cvv = params.cvv || Math.floor(100 + Math.random() * 900).toString();
    const status = params.status || "ACTIVE";
    const paymentMethod = params.paymentMethod || "CHAPA";

    const res = await client.query(
      `
      INSERT INTO mercatox_cards (
        id,
        "cardNumber",
        "cardholderName",
        email,
        "phoneNumber",
        "themeId",
        balance,
        "initialAmount",
        "cardFee",
        "totalPaid",
        currency,
        "expiryDate",
        cvv,
        status,
        "paymentMethod",
        "transactionReference",
        "chapaCheckoutUrl",
        "customerId",
        "createdAt",
        "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())
      RETURNING *
      `,
      [
        id,
        params.cardNumber,
        params.cardholderName,
        params.email.toLowerCase().trim(),
        params.phoneNumber.trim(),
        params.themeId,
        params.balance,
        params.initialAmount,
        params.cardFee,
        params.totalPaid,
        currency,
        expiryDate,
        cvv,
        status,
        paymentMethod,
        params.transactionReference || null,
        params.chapaCheckoutUrl || null,
        params.customerId || null,
      ]
    );

    return res.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Retrieves all cards belonging to a user by email, phone, or customerId.
 */
export async function getCardsByUser(userFilter: {
  email?: string;
  phoneNumber?: string;
  customerId?: string;
}): Promise<MercatoXCardRecord[]> {
  await ensureCardsTable();
  const pool = getPaymentDbPool();
  const client = await pool.connect();

  try {
    const { email, phoneNumber, customerId } = userFilter;
    const conditions: string[] = [];
    const values: any[] = [];

    if (email && email.trim()) {
      values.push(email.toLowerCase().trim());
      conditions.push(`LOWER(email) = $${values.length}`);
    }
    if (phoneNumber && phoneNumber.trim()) {
      const cleanPhone = phoneNumber.trim();
      let digits = cleanPhone.replace(/\D/g, "");
      if (digits.startsWith("251")) digits = digits.slice(3);
      if (digits.startsWith("0")) digits = digits.slice(1);
      const standardPhone = digits.length >= 9 ? "0" + digits.slice(-9) : cleanPhone;
      
      values.push(cleanPhone);
      const idx1 = values.length;
      values.push(standardPhone);
      const idx2 = values.length;
      conditions.push(`("phoneNumber" = $${idx1} OR "phoneNumber" = $${idx2})`);
    }
    if (customerId && customerId.trim()) {
      values.push(customerId.trim());
      conditions.push(`"customerId"::text = $${values.length}`);
    }

    if (conditions.length === 0) {
      // Never return another user's cards if no identity filter is provided
      return [];
    }

    const res = await client.query(
      `SELECT * FROM mercatox_cards WHERE ${conditions.join(" OR ")} ORDER BY "createdAt" DESC`,
      values
    );
    return res.rows;
  } finally {
    client.release();
  }
}

/**
 * Updates a card's status and balance by its transaction reference or card number.
 */
export async function updateCardByTxRef(
  txRef: string,
  updates: { status?: "ACTIVE" | "PENDING" | "FROZEN"; balance?: number }
): Promise<MercatoXCardRecord | null> {
  await ensureCardsTable();
  const pool = getPaymentDbPool();
  const client = await pool.connect();

  try {
    const setClauses: string[] = ['"updatedAt" = NOW()'];
    const values: any[] = [txRef];

    if (updates.status) {
      values.push(updates.status);
      setClauses.push(`status = $${values.length}`);
    }
    if (updates.balance !== undefined) {
      values.push(updates.balance);
      setClauses.push(`balance = $${values.length}`);
    }

    const res = await client.query(
      `
      UPDATE mercatox_cards
      SET ${setClauses.join(", ")}
      WHERE "transactionReference" = $1
      RETURNING *
      `,
      values
    );

    return res.rows[0] || null;
  } finally {
    client.release();
  }
}
