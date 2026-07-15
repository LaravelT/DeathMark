import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const paymentsCollection = db.collection("payments");

    const payments = await paymentsCollection
      .find({ userId: session.user.email, status: "completed" })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(payments);
  } catch (error: any) {
    console.error("[Payment History API] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch history" }, { status: 500 });
  }
}
