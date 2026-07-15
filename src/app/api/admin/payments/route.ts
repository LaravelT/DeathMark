import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("legacybridge");
    const paymentsCollection = db.collection("payments");

    const payments = await paymentsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ payments });
  } catch (error: any) {
    console.error("[Admin Payments GET API] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load payments" }, { status: 500 });
  }
}
