import { NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/db";
import { completePayment } from "@/lib/billing";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("[Webhook API] RAZORPAY_WEBHOOK_SECRET is not configured");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("[Webhook API] Invalid signature received");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const eventData = JSON.parse(rawBody);
    console.log(`[Webhook API] Received event: ${eventData.event}`);

    const client = await clientPromise;
    const db = client.db("legacybridge");

    if (eventData.event === "order.paid" || eventData.event === "payment.captured") {
      let orderId = "";
      let paymentId = "";

      if (eventData.event === "order.paid") {
        orderId = eventData.payload?.order?.entity?.id;
        paymentId = eventData.payload?.payment?.entity?.id || "";
      } else {
        orderId = eventData.payload?.payment?.entity?.order_id;
        paymentId = eventData.payload?.payment?.entity?.id;
      }

      if (orderId) {
        console.log(`[Webhook API] Completing payment for Order ID: ${orderId}, Payment ID: ${paymentId}`);
        await completePayment(db, {
          orderId,
          paymentId,
          skipSignatureCheck: true,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Webhook API] Error processing webhook:", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}
