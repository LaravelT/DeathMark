import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

// Helper to generate a random 4-character alphanumeric string
function generateRandomString(length: number = 4): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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
    const { discountPercent } = body;

    const percent = parseInt(discountPercent, 10);
    if (isNaN(percent) || percent < 1 || percent > 100) {
      return NextResponse.json({ error: "Invalid discount percentage. Must be between 1 and 100." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const couponsCollection = db.collection("coupons");

    // Generate unique coupon code
    let code = "";
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const suffix = generateRandomString(4);
      code = `LB${percent}-${suffix}`;
      const existing = await couponsCollection.findOne({ code, status: "active" });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json({ error: "Could not generate a unique code. Please try again." }, { status: 500 });
    }

    const newCoupon = {
      code,
      discountPercent: percent,
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

    // We can do a soft delete
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
