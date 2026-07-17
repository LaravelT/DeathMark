import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("legacybridge");
    const usersCollection = db.collection("users");
    const paymentsCollection = db.collection("payments");

    // Fetch all users
    const users = await usersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Fetch all payments to extract invoice number by email
    const payments = await paymentsCollection
      .find({ status: "completed" })
      .toArray();

    // Map invoice numbers to emails
    const invoiceMap: Record<string, string> = {};
    payments.forEach(p => {
      if (p.userId && p.invoiceNumber) {
        invoiceMap[p.userId] = p.invoiceNumber;
      }
    });

    const userReports = users.map(user => {
      return {
        _id: user._id,
        email: user.email,
        name: user.ownerDetails?.name || user.name || "N/A",
        createdAt: user.createdAt,
        plan: user.plan || "free_trial",
        invoiceNumber: invoiceMap[user.email] || "N/A"
      };
    });

    return NextResponse.json({ users: userReports });
  } catch (error: any) {
    console.error("[Admin Users GET API] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load users" }, { status: 500 });
  }
}
