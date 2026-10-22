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
  cardPassword?: string;
  passwordEmailSent?: boolean;
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
        "cardPassword" VARCHAR(50),
        "passwordEmailSent" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_mercatox_cards_card_number ON mercatox_cards ("cardNumber");
      CREATE INDEX IF NOT EXISTS idx_mercatox_cards_email ON mercatox_cards (email);
      CREATE INDEX IF NOT EXISTS idx_mercatox_cards_customer_id ON mercatox_cards ("customerId");
      ALTER TABLE mercatox_cards ALTER COLUMN "customerId" TYPE VARCHAR(100) USING "customerId"::text;
      ALTER TABLE mercatox_cards ADD COLUMN IF NOT EXISTS "cardPassword" VARCHAR(50);
      ALTER TABLE mercatox_cards ADD COLUMN IF NOT EXISTS "passwordEmailSent" BOOLEAN DEFAULT FALSE;
    `);
    tableEnsured = true;
  } catch (err) {
    console.error("[Card DB] Error ensuring mercatox_cards table:", err);
  } finally {
    client.release();
  }
}

/**
 * Saves a new card record into the database with a secure 8-digit card password.
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
  cardPassword?: string;
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

    // Generate secure authentic 8-digit password (PIN) if not already provided
    const cardPassword =
      params.cardPassword && /^\d{8}$/.test(params.cardPassword)
        ? params.cardPassword
        : Math.floor(10000000 + Math.random() * 90000000).toString();

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
        "cardPassword",
        "passwordEmailSent",
        "createdAt",
        "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW())
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
        cardPassword,
        false,
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
 * Updates a card's status, balance, or email sent state by its transaction reference.
 */
export async function updateCardByTxRef(
  txRef: string,
  updates: {
    status?: "ACTIVE" | "PENDING" | "FROZEN";
    balance?: number;
    passwordEmailSent?: boolean;
    cardPassword?: string;
  }
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
    if (updates.passwordEmailSent !== undefined) {
      values.push(updates.passwordEmailSent);
      setClauses.push(`"passwordEmailSent" = $${values.length}`);
    }
    if (updates.cardPassword !== undefined) {
      values.push(updates.cardPassword);
      setClauses.push(`"cardPassword" = $${values.length}`);
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

/**
 * Marks that the 8-digit card password email has been sent for a card.
 */
export async function markCardPasswordEmailSent(cardId: string): Promise<void> {
  await ensureCardsTable();
  const pool = getPaymentDbPool();
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE mercatox_cards SET "passwordEmailSent" = TRUE, "updatedAt" = NOW() WHERE id = $1`,
      [cardId]
    );
  } finally {
    client.release();
  }
}

/**
 * Finds a card by its 16-digit card number (with or without spaces).
 */
export async function getCardByNumber(
  cardNumber: string
): Promise<MercatoXCardRecord | null> {
  await ensureCardsTable();
  const pool = getPaymentDbPool();
  const client = await pool.connect();
  try {
    const rawDigits = cardNumber.replace(/\D/g, "");
    const res = await client.query(
      `SELECT * FROM mercatox_cards WHERE REPLACE("cardNumber", ' ', '') = $1 LIMIT 1`,
      [rawDigits]
    );
    return res.rows[0] || null;
  } finally {
    client.release();
  }
}

/**
 * Validates a card, checks sufficient balance, strictly validates 8-digit card password,
 * and atomically deducts the purchase amount from the card balance.
 */
export async function verifyAndDeductCardBalance(params: {
  cardNumber: string;
  amount: number;
  cardPassword?: string;
  email?: string;
  phoneNumber?: string;
  customerId?: string;
}): Promise<{
  success: boolean;
  error?: string;
  card?: MercatoXCardRecord;
  deductedAmount?: number;
  newBalance?: number;
}> {
  await ensureCardsTable();
  const pool = getPaymentDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Locate the card
    let card: MercatoXCardRecord | null = null;
    const rawCardDigits = (params.cardNumber || "").replace(/\D/g, "");

    if (rawCardDigits.length >= 12) {
      const res = await client.query(
        `SELECT * FROM mercatox_cards WHERE REPLACE("cardNumber", ' ', '') = $1 FOR UPDATE`,
        [rawCardDigits]
      );
      if (res.rows.length > 0) card = res.rows[0];
    }

    if (!card && (params.email || params.phoneNumber || params.customerId)) {
      const conds: string[] = [];
      const vals: any[] = [];
      if (params.email) {
        vals.push(params.email.toLowerCase().trim());
        conds.push(`LOWER(email) = $${vals.length}`);
      }
      if (params.phoneNumber) {
        vals.push(params.phoneNumber.trim());
        conds.push(`"phoneNumber" = $${vals.length}`);
      }
      if (params.customerId) {
        vals.push(params.customerId.trim());
        conds.push(`"customerId"::text = $${vals.length}`);
      }
      if (conds.length > 0) {
        const res = await client.query(
          `SELECT * FROM mercatox_cards WHERE (${conds.join(" OR ")}) AND status = 'ACTIVE' ORDER BY "createdAt" DESC LIMIT 1 FOR UPDATE`,
          vals
        );
        if (res.rows.length > 0) card = res.rows[0];
      }
    }

    if (!card) {
      await client.query("ROLLBACK");
      return {
        success: false,
        error: "No active MercatoX Card found for this account. Please purchase a card first.",
      };
    }

    if (card.status !== "ACTIVE") {
      await client.query("ROLLBACK");
      return {
        success: false,
        error: "This MercatoX Card is currently inactive or pending payment.",
      };
    }

    // 2. Check sufficient balance
    const currentBalance = Number(card.balance || 0);
    const requiredAmount = Number(params.amount || 0);

    if (currentBalance < requiredAmount) {
      await client.query("ROLLBACK");
      const shortage = requiredAmount - currentBalance;
      return {
        success: false,
        error: `Insufficient card balance! Available: ${currentBalance.toLocaleString()} ETB | Required: ${requiredAmount.toLocaleString()} ETB (Shortage: ${shortage.toLocaleString()} ETB). Please top up your card.`,
      };
    }

    // 3. Verify 8-digit Card Password
    const enteredPassword = (params.cardPassword || "").trim();
    if (!enteredPassword) {
      await client.query("ROLLBACK");
      return {
        success: false,
        error: "Please enter your 8-digit card password.",
      };
    }

    if (!/^\d{8}$/.test(enteredPassword)) {
      await client.query("ROLLBACK");
      return {
        success: false,
        error: "Card password must be exactly 8 digits.",
      };
    }

    // Strict Password Verification: Check against saved password in database
    const expectedPassword = (card.cardPassword || "").trim();
    if (!expectedPassword || enteredPassword !== expectedPassword) {
      await client.query("ROLLBACK");
      return {
        success: false,
        error: "This password is not correct! Please enter the 8-digit password sent to your email.",
      };
    }

    // 4. Atomically Deduct Balance
    const updateRes = await client.query(
      `
      UPDATE mercatox_cards
      SET balance = balance - $1, "updatedAt" = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [requiredAmount, card.id]
    );

    await client.query("COMMIT");

    const updatedCard: MercatoXCardRecord = updateRes.rows[0];
    return {
      success: true,
      card: updatedCard,
      deductedAmount: requiredAmount,
      newBalance: Number(updatedCard.balance),
    };
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("[Card DB] Error verifying and deducting balance:", err);
    return {
      success: false,
      error: err.message || "Failed to process card payment deduction.",
    };
  } finally {
    client.release();
  }
}

/**
 * Automatically calculates a 2% order cashback reward for orders paid with Chapa
 * and atomically credits it directly to the customer's MercatoX Card balance.
 * If the customer doesn't have a card, an active digital MercatoX Card is automatically
 * generated with the 2% bonus loaded.
 * Ensures strict idempotency so the 2% reward is credited exactly once per transaction.
 */
export async function creditChapaOrderRewardToCard(params: {
  orderId?: string;
  orderNumber?: string;
  txRef: string;
  amount: number;
  customerId?: string;
  email?: string;
  phoneNumber?: string;
  cardholderName?: string;
  paymentMethod?: string;
}): Promise<{
  success: boolean;
  rewardApplied: boolean;
  rewardPercent: number;
  rewardAmount: number;
  card?: MercatoXCardRecord;
  newBalance?: number;
  isNewCard?: boolean;
  message?: string;
  error?: string;
}> {
  await ensureCardsTable();

  // ONLY applies when paid via Chapa
  const methodUpper = String(params.paymentMethod || "CHAPA").toUpperCase();
  if (methodUpper.includes("MERCATOX_CARD") || methodUpper.includes("CARD_BALANCE")) {
    return {
      success: true,
      rewardApplied: false,
      rewardPercent: 2,
      rewardAmount: 0,
      message: "Cashback bonus is only applicable for orders paid with Chapa.",
    };
  }

  const orderAmount = Number(params.amount || 0);
  if (orderAmount <= 0) {
    return {
      success: false,
      rewardApplied: false,
      rewardPercent: 2,
      rewardAmount: 0,
      error: "Invalid order amount for reward calculation.",
    };
  }

  // Calculate 2% reward (rounded to 2 decimal places)
  const rewardAmount = Math.round(orderAmount * 0.02 * 100) / 100;
  if (rewardAmount <= 0) {
    return {
      success: true,
      rewardApplied: false,
      rewardPercent: 2,
      rewardAmount: 0,
      message: "Calculated reward is zero.",
    };
  }

  const pool = getPaymentDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Idempotency Check in `payments` table
    const paymentCheck = await client.query(
      `SELECT id, metadata FROM payments WHERE "transactionReference" = $1 LIMIT 1 FOR UPDATE`,
      [params.txRef]
    );

    if (paymentCheck.rows.length > 0) {
      const metadata = paymentCheck.rows[0].metadata || {};
      if (metadata.chapaReward?.credited) {
        await client.query("ROLLBACK");
        // Already credited: load existing card to report current balance
        const existingCardRes = await client.query(
          `SELECT * FROM mercatox_cards WHERE id = $1 LIMIT 1`,
          [metadata.chapaReward.cardId]
        );
        const cardRecord = existingCardRes.rows[0] || null;
        return {
          success: true,
          rewardApplied: true,
          rewardPercent: 2,
          rewardAmount: Number(metadata.chapaReward.rewardAmount || rewardAmount),
          card: cardRecord,
          newBalance: cardRecord ? Number(cardRecord.balance) : undefined,
          isNewCard: false,
          message: "Reward already credited for this transaction (Idempotent).",
        };
      }
    }

    // 2. Locate customer's active MercatoX Card
    const conds: string[] = [];
    const vals: any[] = [];

    if (params.customerId && params.customerId.trim()) {
      vals.push(params.customerId.trim());
      conds.push(`"customerId"::text = $${vals.length}`);
    }
    if (params.email && params.email.trim()) {
      vals.push(params.email.toLowerCase().trim());
      conds.push(`LOWER(email) = $${vals.length}`);
    }
    if (params.phoneNumber && params.phoneNumber.trim()) {
      const cleanPhone = params.phoneNumber.trim();
      let digits = cleanPhone.replace(/\D/g, "");
      if (digits.startsWith("251")) digits = digits.slice(3);
      if (digits.startsWith("0")) digits = digits.slice(1);
      const standardPhone = digits.length >= 9 ? "0" + digits.slice(-9) : cleanPhone;

      vals.push(cleanPhone);
      const idx1 = vals.length;
      vals.push(standardPhone);
      const idx2 = vals.length;
      conds.push(`("phoneNumber" = $${idx1} OR "phoneNumber" = $${idx2})`);
    }

    let targetCard: MercatoXCardRecord | null = null;
    let isNewCard = false;

    if (conds.length > 0) {
      const cardRes = await client.query(
        `SELECT * FROM mercatox_cards WHERE (${conds.join(" OR ")}) AND status = 'ACTIVE' ORDER BY balance DESC, "createdAt" DESC LIMIT 1 FOR UPDATE`,
        vals
      );
      if (cardRes.rows.length > 0) {
        targetCard = cardRes.rows[0];
      }
    }

    // 3. If customer does not have a card, generate a new digital MercatoX Card for them!
    if (!targetCard) {
      const newCardId = crypto.randomUUID();
      const rawDigits = `970144${Math.floor(10 + Math.random() * 90)}${Math.floor(1000 + Math.random() * 9000)}${Math.floor(1000 + Math.random() * 9000)}`;
      const formattedCardNum = `${rawDigits.slice(0, 4)} ${rawDigits.slice(4, 8)} ${rawDigits.slice(8, 12)} ${rawDigits.slice(12, 16)}`;
      const cardPin = Math.floor(10000000 + Math.random() * 90000000).toString();

      const insertCardRes = await client.query(
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
          "cardPassword",
          "passwordEmailSent",
          "createdAt",
          "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, 'mercatox-signature', $6, $6, 0, 0, 'ETB', '10/29', '821', 'ACTIVE', 'CHAPA_REWARD', $7, NULL, $8, $9, FALSE, NOW(), NOW()
        )
        RETURNING *
        `,
        [
          newCardId,
          formattedCardNum,
          params.cardholderName || "MercatoX Customer",
          (params.email || "customer.mercatox@gmail.com").toLowerCase().trim(),
          params.phoneNumber || "0911000000",
          rewardAmount,
          `REWARD-${params.txRef}`,
          params.customerId || null,
          cardPin,
        ]
      );

      targetCard = insertCardRes.rows[0];
      isNewCard = true;
    } else {
      // 4. Atomically Credit 2% reward to the existing card
      const creditRes = await client.query(
        `
        UPDATE mercatox_cards
        SET balance = balance + $1, "updatedAt" = NOW()
        WHERE id = $2
        RETURNING *
        `,
        [rewardAmount, targetCard.id]
      );
      targetCard = creditRes.rows[0];
    }

    if (!targetCard) {
      throw new Error("Failed to find or create MercatoX Card for reward.");
    }

    // 5. Update payment metadata to guarantee idempotency
    const rewardMeta = {
      credited: true,
      rewardPercent: 2,
      rewardAmount,
      orderTotal: orderAmount,
      cardId: targetCard.id,
      cardNumber: targetCard.cardNumber,
      cardholderName: targetCard.cardholderName,
      isNewCard,
      creditedAt: new Date().toISOString(),
    };

    if (paymentCheck.rows.length > 0) {
      await client.query(
        `
        UPDATE payments
        SET metadata = jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{chapaReward}',
          $1::jsonb
        )
        WHERE "transactionReference" = $2
        `,
        [JSON.stringify(rewardMeta), params.txRef]
      );
    }

    await client.query("COMMIT");

    console.log(
      `[Chapa Reward] Successfully credited 2% reward (${rewardAmount} ETB) on card ${targetCard.cardNumber}. New balance: ${targetCard.balance} ETB (Order: ${params.orderNumber || params.txRef})`
    );

    // If a new card was auto-generated for the reward, dispatch the 8-digit password email
    if (isNewCard && targetCard?.email && targetCard?.cardPassword) {
      try {
        const { sendCardPasswordEmail } = await import("@/lib/mailer");
        const { markCardPasswordEmailSent } = await import("@/lib/api/card-db");
        await sendCardPasswordEmail({
          toEmail: targetCard.email,
          cardholderName: targetCard.cardholderName,
          cardNumber: targetCard.cardNumber,
          cardPassword: targetCard.cardPassword,
          balance: Number(targetCard.balance || 0),
          currency: targetCard.currency || "ETB",
          expiryDate: targetCard.expiryDate,
        });
        await markCardPasswordEmailSent(targetCard.id);
        console.log(`[Chapa Reward] Dispatched 8-digit card password email for new reward card to ${targetCard.email}`);
      } catch (mailErr) {
        console.warn("[Chapa Reward] Failed to dispatch card password email for new reward card:", mailErr);
      }
    }

    return {
      success: true,
      rewardApplied: true,
      rewardPercent: 2,
      rewardAmount,
      card: targetCard,
      newBalance: Number(targetCard.balance),
      isNewCard,
      message: `2% reward of ${rewardAmount} ETB credited to MercatoX Card successfully!`,
    };
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("[Card DB] Error crediting Chapa order reward to card:", err);
    return {
      success: false,
      rewardApplied: false,
      rewardPercent: 2,
      rewardAmount: 0,
      error: err.message || "Failed to credit reward to card",
    };
  } finally {
    client.release();
  }
}


