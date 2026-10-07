import { NextResponse } from "next/server";
import { getOrderDbPool } from "@/lib/db";
import { recordPaymentInDatabase } from "@/lib/api/payment-db";
import crypto from "crypto";

const DEFAULT_CUSTOMER_ID = "609563b9-3c51-4b25-80c2-a3b238ee929f";
const DEFAULT_SELLER_ID = "59972f9f-49ec-4592-9113-ba70a0aa3a52";

function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amount,
      fullName = "",
      phoneNumber = "",
      email = "",
      subcity = "",
      specificAddress = "",
      deliveryNotes = "",
      items = [],
      customerId,
      sellerId,
      paymentMethod = "CHAPA",
    } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order amount" },
        { status: 400 }
      );
    }

    const chapaSecretKey =
      process.env.CHAPA_SECRET_KEY ||
      "CHASECK_TEST-kWkkoI6YlIJm6m5zR6Z2ERwmuqKWanPQ";
    const chapaBaseUrl =
      process.env.CHAPA_BASE_URL || "https://api.chapa.co/v1";

    // Split name into first and last name
    const trimmedName = fullName.trim();
    const nameParts = trimmedName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "Buyer";

    // Clean phone number for Ethiopian standard
    let cleanPhone = phoneNumber.replace(/[\s-]/g, "");
    if (cleanPhone.startsWith("+251")) {
      cleanPhone = "0" + cleanPhone.slice(4);
    } else if (cleanPhone.startsWith("251")) {
      cleanPhone = "0" + cleanPhone.slice(3);
    } else if (!cleanPhone.startsWith("0")) {
      cleanPhone = "0" + cleanPhone;
    }
    if (cleanPhone.length < 10) {
      cleanPhone = "0911223344";
    }

    // Ensure valid public email for Chapa strict validation
    let validEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!validEmail || !emailRegex.test(validEmail) || validEmail.endsWith(".et")) {
      const safePrefix = firstName.toLowerCase().replace(/[^a-z0-9]/g, "") || "customer";
      validEmail = `${safePrefix}.mercatox@gmail.com`;
    }

    // Unique IDs for Order and Payment
    const orderId = crypto.randomUUID();
    const orderNumber = `MX-${new Date().getFullYear()}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;
    const txRef = `MX-CHAPA-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const resolvedCustomerId = isValidUuid(customerId)
      ? customerId
      : DEFAULT_CUSTOMER_ID;
    
    // Find sellerId from items or fallback
    const firstItemSeller = items.find((it: any) => isValidUuid(it.sellerId))?.sellerId;
    const resolvedSellerId = isValidUuid(sellerId)
      ? sellerId
      : (firstItemSeller || DEFAULT_SELLER_ID);

    const calcDeliveryFee = 150;
    const calcTotal = Number(amount);
    const calcSubtotal = calcTotal > calcDeliveryFee ? calcTotal - calcDeliveryFee : calcTotal;

    const deliveryAddressObj = {
      recipientName: trimmedName || "Customer",
      recipientPhone: cleanPhone,
      city: "Addis Ababa",
      subCity: subcity || "Bole (Medhanialem, Rwanda, Atlas, Bulbula)",
      specificLocation: specificAddress || "Addis Ababa",
      phone: cleanPhone,
      notes: deliveryNotes,
    };

    // 1. SAVE ORDER INFORMATION IN ORDER SERVICE (mercatox_order_db)
    try {
      const orderPool = getOrderDbPool();
      const orderClient = await orderPool.connect();

      try {
        await orderClient.query("BEGIN");

        await orderClient.query(
          `
          INSERT INTO orders (
            id,
            "orderNumber",
            "customerId",
            "sellerId",
            status,
            "paymentStatus",
            "subtotalAmount",
            "deliveryFee",
            "totalAmount",
            "deliveryAddress",
            notes,
            "txRef",
            "createdAt",
            "updatedAt"
          ) VALUES ($1, $2, $3, $4, 'CONFIRMED', 'PENDING', $5, $6, $7, $8, $9, $10, NOW(), NOW())
          `,
          [
            orderId,
            orderNumber,
            resolvedCustomerId,
            resolvedSellerId,
            calcSubtotal,
            calcDeliveryFee,
            calcTotal,
            JSON.stringify(deliveryAddressObj),
            deliveryNotes || "",
            txRef,
          ]
        );

        for (const it of items) {
          const itemId = crypto.randomUUID();
          const itemProductId = isValidUuid(it.id || it.productId)
            ? (it.id || it.productId)
            : crypto.randomUUID();
          const itemTitle = it.name || it.productTitle || "Mercato Wholesale Product";
          const itemUnitPrice = Number(it.price || it.unitPrice || 0);
          const itemQty = Number(it.quantity || 1);
          const itemTotalPrice = itemUnitPrice * itemQty;

          await orderClient.query(
            `
            INSERT INTO order_items (
              id,
              "orderId",
              "productId",
              "productTitle",
              "unitOfMeasure",
              "unitPrice",
              quantity,
              "totalPrice",
              "createdAt",
              "updatedAt"
            ) VALUES ($1, $2, $3, $4, 'PIECE', $5, $6, $7, NOW(), NOW())
            `,
            [
              itemId,
              orderId,
              itemProductId,
              itemTitle,
              itemUnitPrice,
              itemQty,
              itemTotalPrice,
            ]
          );
        }

        await orderClient.query("COMMIT");
        console.log(`[Chapa API] Created order ${orderNumber} (${orderId}) in mercatox_order_db`);
      } catch (orderInsertErr) {
        await orderClient.query("ROLLBACK");
        console.error("[Chapa API] Failed to insert order into mercatox_order_db:", orderInsertErr);
      } finally {
        orderClient.release();
      }
    } catch (dbConnErr) {
      console.error("[Chapa API] Order DB connection error:", dbConnErr);
    }

    // Resolve app origin for return_url
    const reqOrigin =
      req.headers.get("origin") ||
      req.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
      "http://localhost:3000";

    const returnUrl = `${reqOrigin}/payments/success?tx_ref=${encodeURIComponent(
      txRef
    )}&amount=${encodeURIComponent(calcTotal)}&order_id=${encodeURIComponent(orderId)}`;

    const callbackUrl = `${reqOrigin}/payments/webhook/chapa`;

    const description = `MercatoX Escrow: ${items.length} item(s) to ${
      subcity ? subcity.split(" ")[0] : "Addis Ababa"
    }`;

    const chapaPayload = {
      amount: Math.round(calcTotal).toString(),
      currency: "ETB",
      email: validEmail,
      first_name: firstName,
      last_name: lastName,
      phone_number: cleanPhone,
      tx_ref: txRef,
      callback_url: callbackUrl,
      return_url: returnUrl,
      "customization[title]": "MercatoX Escrow Checkout",
      "customization[description]": description,
    };

    console.log("[Chapa API] Initializing transaction:", {
      txRef,
      orderId,
      orderNumber,
      amount: calcTotal,
      email: validEmail,
    });

    let checkoutUrl = `${reqOrigin}/payments/success?tx_ref=${encodeURIComponent(
      txRef
    )}&amount=${encodeURIComponent(calcTotal)}&order_id=${encodeURIComponent(orderId)}`;
    let chapaSuccess = false;
    let chapaResponseData: any = null;

    try {
      const chapaRes = await fetch(`${chapaBaseUrl}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${chapaSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chapaPayload),
      });

      chapaResponseData = await chapaRes.json();

      if (chapaRes.ok && chapaResponseData.status === "success" && chapaResponseData.data?.checkout_url) {
        checkoutUrl = chapaResponseData.data.checkout_url;
        chapaSuccess = true;
      } else {
        console.warn("[Chapa API] Gateway responded with non-success:", chapaResponseData);
      }
    } catch (chapaHttpErr) {
      console.warn("[Chapa API] HTTP connection error:", chapaHttpErr);
    }

    // 2. SAVE PAYMENT INFORMATION IN PAYMENT SERVICE (mercatox_payment_db)
    try {
      await recordPaymentInDatabase({
        transactionReference: txRef,
        orderId: orderId,
        customerId: resolvedCustomerId,
        sellerId: resolvedSellerId,
        amount: calcTotal,
        currency: "ETB",
        provider: paymentMethod || "CHAPA",
        status: chapaSuccess ? "INITIATED" : "PENDING",
        providerReference: chapaResponseData?.data?.reference || txRef,
        escrowStatus: "HELD",
        metadata: {
          orderId,
          orderNumber,
          fullName: trimmedName,
          phoneNumber: cleanPhone,
          email: validEmail,
          subcity,
          specificAddress,
          deliveryNotes,
          itemCount: items.length,
          items: items.map((it: any) => ({
            id: it.id,
            name: it.name,
            price: it.price,
            quantity: it.quantity,
          })),
          chapaInitData: chapaResponseData?.data,
          initiatedAt: new Date().toISOString(),
        },
      });
      console.log(`[Chapa API] Saved payment for order ${orderId} (${txRef}) in mercatox_payment_db`);
    } catch (payDbInitErr) {
      console.warn("[Chapa API] Failed to pre-save payment in mercatox_payment_db:", payDbInitErr);
    }

    return NextResponse.json({
      success: true,
      checkoutUrl,
      txRef,
      orderId,
      orderNumber,
      amount: calcTotal,
    });
  } catch (err: any) {
    console.error("[Chapa API Route] Unhandled exception:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Internal server error initializing payment",
      },
      { status: 500 }
    );
  }
}
