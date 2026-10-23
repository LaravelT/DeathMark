import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("legacybridge");
    const couponsCollection = db.collection("coupons");

    const coupons = await couponsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ coupons });
  } catch (error: any) {
    console.error("[Admin Coupons GET API] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load coupons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { 
      code, 
      description, 
      discountType, 
      discountValue, 
      applicablePlan = "all", 
      isCompanyCoupon, 
      companyName, 
      allowedEmails,
      portalUsername,
      portalPassword,
      maxEmails
    } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Coupon code name is required." }, { status: 400 });
    }

    const normalizedCode = code.toUpperCase().trim();
    if (!/^[A-Z0-9_-]+$/.test(normalizedCode)) {
      return NextResponse.json({ error: "Coupon code must contain only letters, numbers, hyphens, and underscores." }, { status: 400 });
    }

    if (!["all", "annual", "lifetime"].includes(applicablePlan)) {
      return NextResponse.json({ error: "Invalid applicable plan. Must be 'all', 'annual', or 'lifetime'." }, { status: 400 });
    }

    if (!["percentage", "flat"].includes(discountType)) {
      return NextResponse.json({ error: "Invalid discount type. Must be 'percentage' or 'flat'." }, { status: 400 });
    }

    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      return NextResponse.json({ error: "Discount value must be a positive number." }, { status: 400 });
    }

    if (discountType === "percentage" && val > 100) {
      return NextResponse.json({ error: "Percentage discount cannot exceed 100%." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const couponsCollection = db.collection("coupons");

    // Check if code already exists as active
    const existing = await couponsCollection.findOne({ code: normalizedCode, status: "active" });
    if (existing) {
      return NextResponse.json({ error: "An active coupon with this code already exists." }, { status: 400 });
    }

    let parsedEmails: string[] = [];
    let portalUser: string | null = null;
    let portalPass: string | null = null;
    let quotaLimit: number | null = null;

    if (isCompanyCoupon) {
      if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
        return NextResponse.json({ error: "Company name is required for company coupons." }, { status: 400 });
      }

      if (!portalUsername || typeof portalUsername !== "string" || !portalUsername.trim()) {
        return NextResponse.json({ error: "Company Portal User ID is required." }, { status: 400 });
      }

      if (!portalPassword || typeof portalPassword !== "string" || !portalPassword.trim()) {
        return NextResponse.json({ error: "Company Portal Password is required." }, { status: 400 });
      }

      portalUser = portalUsername.trim().toLowerCase();
      portalPass = portalPassword.trim();

      // Check if portalUsername already taken by an active coupon
      const existingPortalUser = await couponsCollection.findOne({ 
        portalUsername: portalUser, 
        status: "active" 
      });
      if (existingPortalUser) {
        return NextResponse.json({ error: `Portal User ID "${portalUsername}" is already taken by another active company.` }, { status: 400 });
      }

      quotaLimit = parseInt(String(maxEmails), 10);
      if (isNaN(quotaLimit) || quotaLimit <= 0) {
        return NextResponse.json({ error: "Allowed number of emails must be a positive integer." }, { status: 400 });
      }

      // Optional initial emails
      if (typeof allowedEmails === "string" && allowedEmails.trim()) {
        parsedEmails = allowedEmails
          .split(",")
          .map(e => e.trim().toLowerCase())
          .filter(e => e);
      } else if (Array.isArray(allowedEmails)) {
        parsedEmails = allowedEmails
          .map(e => String(e).trim().toLowerCase())
          .filter(e => e);
      }

      if (parsedEmails.length > quotaLimit) {
        return NextResponse.json({ error: `Initial emails count (${parsedEmails.length}) exceeds the maximum allowed limit (${quotaLimit}).` }, { status: 400 });
      }
    }

    const newCoupon = {
      code: normalizedCode,
      description: description || "",
      discountType,
      discountValue: val,
      applicablePlan,
      isCompanyCoupon: !!isCompanyCoupon,
      companyName: isCompanyCoupon ? companyName.trim() : null,
      portalUsername: isCompanyCoupon ? portalUser : null,
      portalPassword: isCompanyCoupon ? portalPass : null,
      maxEmails: isCompanyCoupon ? quotaLimit : null,
      allowedEmails: isCompanyCoupon ? parsedEmails : null,
      status: "active",
      createdAt: new Date(),
    };

    await couponsCollection.insertOne(newCoupon);

    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (error: any) {
    console.error("[Admin Coupons POST API] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create coupon" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const couponId = searchParams.get("id");

    if (!couponId) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const couponsCollection = db.collection("coupons");

    // Soft delete
    const result = await couponsCollection.updateOne(
      { _id: new ObjectId(couponId) },
      { $set: { status: "deleted" } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Admin Coupons DELETE API] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete coupon" }, { status: 500 });
  }
}
