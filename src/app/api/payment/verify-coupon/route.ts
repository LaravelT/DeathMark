import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { couponCode } = body;

    if (!couponCode || typeof couponCode !== "string") {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const couponsCollection = db.collection("coupons");

    // Match case-insensitively, but standard uppercase comparison is safer
    const normalizedCode = couponCode.toUpperCase().trim();

    const coupon = await couponsCollection.findOne({
      code: normalizedCode,
      status: "active"
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      couponCode: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    });
  } catch (error: any) {
    console.error("[Verify Coupon API] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to verify coupon" }, { status: 500 });
  }
}
