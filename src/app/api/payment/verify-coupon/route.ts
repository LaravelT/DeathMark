import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email?.toLowerCase();
    const body = await req.json().catch(() => ({}));
    const { couponCode, plan } = body;

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

    if (coupon.applicablePlan && coupon.applicablePlan !== "all" && coupon.applicablePlan !== plan) {
      return NextResponse.json({ error: `This coupon is only valid for ${coupon.applicablePlan} plan` }, { status: 400 });
    }

    if (coupon.isCompanyCoupon) {
      if (!userEmail) {
        return NextResponse.json({ error: "You must be logged in to use a company coupon" }, { status: 401 });
      }
      if (!coupon.allowedEmails || !coupon.allowedEmails.includes(userEmail)) {
        return NextResponse.json({ error: "This coupon is not valid for your email address" }, { status: 403 });
      }
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
