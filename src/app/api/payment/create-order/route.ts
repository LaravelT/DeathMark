import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { plan, state, billingName, billingAddress, billingEmail, billingMobile, gstNo } = body;

    if (!["annual", "lifetime"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    if (!state || !billingName || !billingAddress || !billingEmail || !billingMobile) {
      return NextResponse.json({ error: "All billing details (Name, Address, State, Email, Mobile) are required" }, { status: 400 });
    }

    const base = plan === "annual" ? 1000 : 5000;
    const gst = Math.round(base * 0.18);
    const total = base + gst;
    const isMH = state.toLowerCase() === "maharashtra";
    const cgst = isMH ? Math.round(base * 0.09) : 0;
    const sgst = isMH ? Math.round(base * 0.09) : 0;
    const igst = !isMH ? gst : 0;

    // Initialize Razorpay client
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay credentials are not configured on server" }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const orderOptions = {
      amount: total * 100, // in paisa
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      notes: {
        Source: "legacybridge"
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    // Save pending payment record to MongoDB
    const client = await clientPromise;
    const db = client.db("legacybridge");
    const paymentsCollection = db.collection("payments");

    await paymentsCollection.insertOne({
      userId: session.user.email,
      orderId: order.id,
      plan,
      state,
      billingName,
      billingAddress,
      billingEmail,
      billingMobile,
      gstNo: gstNo || "",
      baseAmount: base,
      gstAmount: gst,
      cgst,
      sgst,
      igst,
      totalAmount: total,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("[Create Order API] Error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
