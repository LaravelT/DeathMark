import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { createCompanyToken } from "@/lib/companyAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Please enter both User ID and Password." }, { status: 400 });
    }

    const cleanUser = String(username).trim().toLowerCase();
    const cleanPass = String(password).trim();

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const couponsCollection = db.collection("coupons");

    const coupon = await couponsCollection.findOne({
      portalUsername: cleanUser,
      status: "active"
    });

    if (!coupon || coupon.portalPassword !== cleanPass) {
      return NextResponse.json({ error: "Invalid User ID or Password, or this portal access is inactive." }, { status: 401 });
    }

    const token = createCompanyToken(coupon._id.toString(), cleanUser);

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

    const response = NextResponse.json({
      success: true,
      token,
      coupon: safeCoupon,
    });

    response.cookies.set({
      name: "company_portal_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("[Company Portal Login API] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to log in" }, { status: 500 });
  }
}
