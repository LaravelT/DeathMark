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
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email: session.user.email });
    
    // Check plan expiration
    const plan = user?.plan || null;
    const planActivatedAt = user?.planActivatedAt || null;
    const planExpiresAt = user?.planExpiresAt || null;
    
    const createdAt = user?.createdAt || user?.lastLogin || new Date();
    if (user && !user.createdAt) {
      await usersCollection.updateOne({ _id: user._id }, { $set: { createdAt } });
    }

    let isExpired = false;
    if (plan === "free_trial" && planExpiresAt) {
      isExpired = Date.now() > new Date(planExpiresAt).getTime();
    } else if (plan === "annual" && planExpiresAt) {
      isExpired = Date.now() > new Date(planExpiresAt).getTime();
    }

    const ownerDetails = user?.ownerDetails || null;

    return NextResponse.json({
      ownerDetails,
      isExpired,
      createdAt,
      plan,
      planActivatedAt,
      planExpiresAt
    });
  } catch (error: any) {
    console.error("[Owner Details API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
