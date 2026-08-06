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
    const { code, description, discountType, discountValue } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Coupon code name is required." }, { status: 400 });
    }

    const normalizedCode = code.toUpperCase().trim();
    if (!/^[A-Z0-9_-]+$/.test(normalizedCode)) {
      return NextResponse.json({ error: "Coupon code must contain only letters, numbers, hyphens, and underscores." }, { status: 400 });
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

    const newCoupon = {
      code: normalizedCode,
      description: description || "",
      discountType,
      discountValue: val,
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
