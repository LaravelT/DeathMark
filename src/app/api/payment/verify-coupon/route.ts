import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { isEmailOrDomainAllowed } from "@/lib/coupon";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email?.toLowerCase();
    const body = await req.json().catch(() => ({}));
    const { couponCode, plan, email, billingEmail } = body;

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
      const candidateBillingEmail = typeof email === "string" ? email.trim().toLowerCase() : 
                                    typeof billingEmail === "string" ? billingEmail.trim().toLowerCase() : "";

      if (!userEmail && !candidateBillingEmail) {
        return NextResponse.json({ error: "You must be logged in to use a company coupon" }, { status: 401 });
      }

      const isAllowed = isEmailOrDomainAllowed(coupon.allowedEmails, userEmail) ||
                        (candidateBillingEmail ? isEmailOrDomainAllowed(coupon.allowedEmails, candidateBillingEmail) : false);

      if (!isAllowed) {
        const companyName = coupon.companyName ? coupon.companyName : "the company";
        return NextResponse.json({ 
          error: `This coupon code is exclusively reserved for selected employees of ${companyName}. Your email address is not in the authorized list. Please contact your HR or company administrator to get access.` 
        }, { status: 403 });
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
