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

    // Map invoice numbers and plans to emails
    const invoiceMap: Record<string, string> = {};
    const planMap: Record<string, string> = {};
    payments.forEach(p => {
      if (p.userId) {
        if (p.invoiceNumber) invoiceMap[p.userId] = p.invoiceNumber;
        if (p.plan) planMap[p.userId] = p.plan;
      }
    });

    const userReports = users.map(user => {
      const finalPlan = planMap[user.email] || user.plan || "free_trial";
      return {
        _id: user._id,
        email: user.email,
        name: user.ownerDetails?.name || user.name || "N/A",
        createdAt: user.createdAt,
        plan: finalPlan,
        invoiceNumber: invoiceMap[user.email] || "N/A"
      };
    });

    return NextResponse.json({ users: userReports });
  } catch (error: any) {
    console.error("[Admin Users GET API] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load users" }, { status: 500 });
  }
}
