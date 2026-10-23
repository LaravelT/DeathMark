import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db";
import { verifyCompanyToken } from "@/lib/companyAuth";

export async function GET(req: Request) {
  try {
    // 1. Extract token from cookie or header
    let token = "";
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    if (!token) {
      const cookieHeader = req.headers.get("cookie") || "";
      const match = cookieHeader.match(/company_portal_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    const payload = verifyCompanyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized session or session expired. Please sign in again." }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const couponsCollection = db.collection("coupons");

    const coupon = await couponsCollection.findOne({
      _id: new ObjectId(payload.couponId),
      status: "active",
    });

    if (!coupon) {
      return NextResponse.json({ error: "Company coupon not found or deactivated." }, { status: 404 });
    }

    const safeCoupon = {
      id: coupon._id.toString(),
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      applicablePlan: coupon.applicablePlan || "all",
      companyName: coupon.companyName,
      maxEmails: coupon.maxEmails || 50,
      allowedEmails: coupon.allowedEmails || [],
    };

    return NextResponse.json({ success: true, coupon: safeCoupon });
  } catch (error: any) {
    console.error("[Company Portal Details API] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch company details" }, { status: 500 });
  }
}
