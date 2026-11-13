import { NextResponse } from "next/server";
import { getOrderDbPool, getUsersDbPool, getPaymentDbPool } from "@/lib/db";
import { recordPaymentInDatabase } from "@/lib/api/payment-db";
import { getAccurateProductImage } from "@/lib/utils/product-image";
import { triggerOrderEmailNotifications } from "@/app/api/orders/route";
import crypto from "crypto";

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
      cardNumber = "",
      cardPassword = "",
      returnUrl: customReturnUrl,
    } = body || {};

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order amount" },
        { status: 400 }
      );
    }

    const chapaSecretKey = process.env.CHAPA_SECRET_KEY || "";
    const chapaBaseUrl =
      process.env.CHAPA_BASE_URL || "https://api.chapa.co/v1";

    // Split name into first and last name
    const trimmedName = fullName.trim();
    const nameParts = trimmedName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "Buyer";

    // Clean phone number for strict Ethiopian mobile standard (09xxxxxxxx or 07xxxxxxxx)
    let digits = (phoneNumber || "").replace(/\D/g, "");
    if (digits.startsWith("251")) {
      digits = digits.slice(3);
    }
    if (digits.startsWith("0")) {
      digits = digits.slice(1);
    }
    let cleanPhone: string;
    if (digits.length === 9 && (digits.startsWith("9") || digits.startsWith("7"))) {
      cleanPhone = "0" + digits;
    } else if (digits.length >= 8) {
      // E.g. from 116678920 or 91144220 -> 09 + last 8 digits -> 0916678920
      cleanPhone = "09" + digits.slice(digits.length - 8);
    } else {
      cleanPhone = "0911442200";
    }

    // Resolve authentic customer email from input, profiles, cards, or auth
    let resolvedCustomerRealEmail: string | undefined = undefined;
    if (
      email &&
      email.trim().includes("@") &&
      !email.trim().toLowerCase().includes(".mercatox@gmail.com") &&
      !email.trim().toLowerCase().includes("example.com")
    ) {
      resolvedCustomerRealEmail = email.trim().toLowerCase();
    }

    if (!resolvedCustomerRealEmail && isValidUuid(customerId)) {
      try {
        const uPool = getUsersDbPool();
        const uRes = await uPool.query(
          `SELECT email FROM profiles WHERE "userId" = $1 OR id = $1 LIMIT 1`,
          [customerId]
        );
        if (uRes.rows.length > 0 && uRes.rows[0].email && !uRes.rows[0].email.includes("example.com")) {
          resolvedCustomerRealEmail = uRes.rows[0].email.trim().toLowerCase();
        }
      } catch { }
    }

    if (!resolvedCustomerRealEmail && cleanPhone) {
      try {
        const uPool = getUsersDbPool();
        const pRes = await uPool.query(
          `SELECT email FROM profiles WHERE "phoneNumber" LIKE $1 LIMIT 1`,
          [`%${cleanPhone.slice(-8)}%`]
        );
        if (pRes.rows.length > 0 && pRes.rows[0].email && !pRes.rows[0].email.includes("example.com")) {
          resolvedCustomerRealEmail = pRes.rows[0].email.trim().toLowerCase();
        }
      } catch { }
    }

    if (!resolvedCustomerRealEmail && body.cardNumber) {
      try {
        const pPool = getPaymentDbPool();
        const targetNum = String(body.cardNumber).replace(/\D/g, "");
        const cRes = await pPool.query(
          `SELECT email FROM mercatox_cards WHERE REPLACE("cardNumber", ' ', '') = $1 LIMIT 1`,
          [targetNum]
        );
        if (cRes.rows.length > 0 && cRes.rows[0].email && !cRes.rows[0].email.includes("example.com")) {
          resolvedCustomerRealEmail = cRes.rows[0].email.trim().toLowerCase();
        }
      } catch { }
    }

    let validEmail = resolvedCustomerRealEmail || (email || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|org|net|io|co|edu|biz|info)$/i;
    if (!validEmail || !emailRegex.test(validEmail) || validEmail.toLowerCase().endsWith(".et")) {
      const safePrefix = firstName.toLowerCase().replace(/[^a-z0-9]/g, "") || "buyer";
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
      : crypto.randomUUID();
    
    // Find sellerId from items or fallback
    const firstItemSeller = items.find((it: any) => isValidUuid(it.sellerId))?.sellerId;
    const resolvedSellerId = isValidUuid(sellerId)
      ? sellerId
      : (firstItemSeller || DEFAULT_SELLER_ID);

    const calcDeliveryFee = 150;
    const calcTotal = Number(amount);
    const calcSubtotal = calcTotal > calcDeliveryFee ? calcTotal - calcDeliveryFee : calcTotal;

    const itemsSnapshot = items.map((it: any) => ({
      id: it.id,
      productId: isValidUuid(it.id || it.productId) ? (it.id || it.productId) : it.id,
      productTitle: it.name || it.productTitle || "Mercato Wholesale Product",
      price: Number(it.price || it.unitPrice || 0),
      unitPrice: Number(it.price || it.unitPrice || 0),
      quantity: Number(it.quantity || 1),
      totalPrice: Number(it.price || it.unitPrice || 0) * Number(it.quantity || 1),
      image: it.image || getAccurateProductImage(it.name || it.productTitle),
      sellerId: it.sellerId || resolvedSellerId,
      unitOfMeasure: it.unitOfMeasure || "PIECE",
      sku: it.sku || it.productSku,
    }));

    const deliveryAddressObj = {
      buyerId: customerId || resolvedCustomerId,
      buyerEmail: resolvedCustomerRealEmail || validEmail,
      buyerPhone: phoneNumber || cleanPhone,
      buyerName: trimmedName || "Customer",
      recipientName: trimmedName || "Customer",
      recipientPhone: cleanPhone,
      city: "Addis Ababa",
      subCity: subcity || "Bole (Medhanialem, Rwanda, Atlas, Bulbula)",
      specificLocation: specificAddress || "Addis Ababa",
      phone: cleanPhone,
      email: resolvedCustomerRealEmail || validEmail,
      notes: deliveryNotes,
      itemsSnapshot,
    };

    // Resolve app origin for return_url
    const reqOrigin =
      req.headers.get("origin") ||
      req.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
      "http://localhost:3000";

    const defaultReturnUrl = `${reqOrigin}/payments/success?tx_ref=${encodeURIComponent(
      txRef
    )}&amount=${encodeURIComponent(calcTotal)}&order_id=${encodeURIComponent(orderId)}&order_number=${encodeURIComponent(orderNumber)}`;

    let returnUrl = defaultReturnUrl;
    if (customReturnUrl) {
      const baseCustom = customReturnUrl.startsWith("http")
        ? customReturnUrl
        : `${reqOrigin}${customReturnUrl.startsWith("/") ? "" : "/"}${customReturnUrl}`;
      const separator = baseCustom.includes("?") ? "&" : "?";
      returnUrl = `${baseCustom}${separator}tx_ref=${encodeURIComponent(
        txRef
      )}&amount=${encodeURIComponent(
        calcTotal
      )}&order_id=${encodeURIComponent(
        orderId
      )}&order_number=${encodeURIComponent(
        orderNumber
      )}`;
    }

    const callbackUrl = `${reqOrigin}/api/payments/verify?tx_ref=${encodeURIComponent(txRef)}`;

    const description = `MercatoX Escrow: ${items?.length || 1} item(s) to ${
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

    const isMercatoXCard =
      String(paymentMethod).toUpperCase() === "MERCATOX_CARD" ||
      String(paymentMethod).toLowerCase() === "mercatox_card";

    let checkoutUrl = "";
    let chapaResponseData: any = null;
    let cardDeductInfo: any = null;

    if (isMercatoXCard) {
      // 1A. MercatoX Card: verify card exists, sufficient balance, and 8-digit PIN BEFORE creating order
      const { verifyAndDeductCardBalance } = await import("@/lib/api/card-db");
      const deductResult = await verifyAndDeductCardBalance({
        cardNumber: cardNumber || "",
        amount: calcTotal,
        cardPassword: cardPassword || "",
        email: email || validEmail,
        phoneNumber: phoneNumber || cleanPhone,
        customerId: resolvedCustomerId,
      });

      if (!deductResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: deductResult.error || "Failed to process MercatoX Card payment.",
          },
          { status: 400 }
        );
      }

      cardDeductInfo = deductResult;
      checkoutUrl = returnUrl;
      console.log(
        `[Payment API] MercatoX Card payment approved for order ${orderNumber} (${txRef}). Deducted ETB ${calcTotal}, Remaining Balance: ${deductResult.newBalance}`
      );

      // Payment succeeded immediately via MercatoX Card -> create PAID/CONFIRMED order now
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
            ) VALUES ($1, $2, $3, $4, 'CONFIRMED', 'PAID', $5, $6, $7, $8, $9, $10, NOW(), NOW())
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
          console.log(`[Card API] Created PAID order ${orderNumber} (${orderId}) in mercatox_order_db`);
        } catch (orderInsertErr) {
          await orderClient.query("ROLLBACK");
          console.error("[Card API] Failed to insert order into mercatox_order_db:", orderInsertErr);
        } finally {
          orderClient.release();
        }
      } catch (dbConnErr) {
        console.error("[Card API] Order DB connection error:", dbConnErr);
      }
    } else {
      // 1B. Chapa Gateway: MUST successfully initialize real Chapa checkout URL (NO fallback bypass, NO pre-order creation!)
      if (!chapaSecretKey) {
        return NextResponse.json(
          {
            success: false,
            error: "Chapa payment gateway secret key is not configured on the server.",
          },
          { status: 500 }
        );
      }

      try {
        const chapaRes = await fetch(`${chapaBaseUrl}/transaction/initialize`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${chapaSecretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chapaPayload),
        });

        chapaResponseData = await chapaRes.json().catch(() => ({}));

        if (chapaRes.ok && chapaResponseData?.status === "success" && chapaResponseData?.data?.checkout_url) {
          checkoutUrl = chapaResponseData.data.checkout_url;
        } else {
          const rawMsg = chapaResponseData?.message;
          const readableErr =
            typeof rawMsg === "string"
              ? rawMsg
              : rawMsg && typeof rawMsg === "object"
              ? Object.values(rawMsg).flat().join(", ")
              : "Chapa could not initialize this transaction.";
          console.warn("[Chapa API] Gateway responded with non-success:", chapaResponseData);
          return NextResponse.json(
            {
              success: false,
              error: readableErr,
              details: chapaResponseData,
            },
            { status: 400 }
          );
        }
      } catch (chapaHttpErr: any) {
        console.error("[Chapa API] HTTP connection error:", chapaHttpErr);
        return NextResponse.json(
          {
            success: false,
            error: chapaHttpErr?.message || "Unable to connect to Chapa payment gateway. Check your internet connection and try again.",
          },
          { status: 502 }
        );
      }
    }

    // 2. SAVE PAYMENT INFORMATION IN PAYMENT SERVICE (mercatox_payment_db)
    // Note: For Chapa, status stays INITIATED and pendingOrder is held in metadata until Chapa confirms PAID!
    try {
      await recordPaymentInDatabase({
        transactionReference: txRef,
        orderId: orderId,
        customerId: resolvedCustomerId,
        sellerId: resolvedSellerId,
        amount: calcTotal,
        currency: "ETB",
        provider: isMercatoXCard ? "MERCATOX_CARD" : (paymentMethod || "CHAPA"),
        status: isMercatoXCard ? "COMPLETED" : "INITIATED",
        providerReference: chapaResponseData?.data?.reference || txRef,
        paymentReceiptUrl: checkoutUrl,
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
          itemCount: items?.length || 0,
          items: (items || []).map((it: any) => ({
            id: it?.id,
            name: it?.name,
            price: it?.price,
            quantity: it?.quantity,
          })),
          pendingOrder: !isMercatoXCard
            ? {
                orderId,
                orderNumber,
                customerId: resolvedCustomerId,
                sellerId: resolvedSellerId,
                subtotalAmount: calcSubtotal,
                deliveryFee: calcDeliveryFee,
                totalAmount: calcTotal,
                deliveryAddress: deliveryAddressObj,
                itemsSnapshot,
                items,
                notes: deliveryNotes || "",
                customerEmail: resolvedCustomerRealEmail || (validEmail.includes(".mercatox@gmail.com") ? undefined : validEmail),
                customerName: trimmedName || firstName,
                customerPhone: cleanPhone,
              }
            : undefined,
          chapaInitData: chapaResponseData?.data,
          cardNumber: cardDeductInfo?.card?.cardNumber,
          remainingCardBalance: cardDeductInfo?.newBalance,
          initiatedAt: new Date().toISOString(),
        },
      });
      console.log(`[Chapa API] Saved ${isMercatoXCard ? "COMPLETED" : "INITIATED"} payment for ${txRef} in mercatox_payment_db`);

      if (isMercatoXCard) {
        try {
          // Trigger email notifications for MercatoX Card order (Customer, Admin, and Each Seller)
          const targetRecipientEmail =
            (resolvedCustomerRealEmail && resolvedCustomerRealEmail.includes("@") && !resolvedCustomerRealEmail.includes("example.com"))
              ? resolvedCustomerRealEmail
              : ((cardDeductInfo?.card?.email && cardDeductInfo.card.email.includes("@") && !cardDeductInfo.card.email.includes("example.com"))
                  ? cardDeductInfo.card.email
                  : (validEmail.includes(".mercatox@gmail.com") ? undefined : validEmail));

          await triggerOrderEmailNotifications({
            id: orderId,
            orderNumber,
            customerId: resolvedCustomerId,
            sellerId: resolvedSellerId,
            customerEmail: targetRecipientEmail,
            customerName: trimmedName || firstName,
            customerPhone: cleanPhone,
            subtotalAmount: calcSubtotal,
            deliveryFee: calcDeliveryFee,
            totalAmount: calcTotal,
            deliveryAddress: deliveryAddressObj,
            paymentMethod: "MercatoX Card Escrow (0% Transaction Fee)",
            paymentStatus: "PAID",
            notes: deliveryNotes,
            items: itemsSnapshot,
            createdAt: new Date().toISOString(),
          });
        } catch (orderUpdErr) {
          console.warn("[Chapa API] Failed to dispatch emails for card order:", orderUpdErr);
        }
      }
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
