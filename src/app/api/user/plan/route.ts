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
    
    const plan = user?.plan || null;
    const planActivatedAt = user?.planActivatedAt || null;
    const planExpiresAt = user?.planExpiresAt || null;
    const hasUsedTrial = user?.hasUsedTrial || false;

    let isExpired = false;
    if (plan === "free_trial" && planExpiresAt) {
      isExpired = Date.now() > new Date(planExpiresAt).getTime();
    } else if (plan === "annual" && planExpiresAt) {
      isExpired = Date.now() > new Date(planExpiresAt).getTime();
    }

    return NextResponse.json({
      plan,
      planActivatedAt,
      planExpiresAt,
      isExpired,
      hasUsedTrial
    });
  } catch (error: any) {
    console.error("[Plan GET API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { plan } = body; // "free_trial" | "annual" | "lifetime"

    if (!["free_trial", "annual", "lifetime"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email: session.user.email });

    if (plan === "free_trial" && user?.hasUsedTrial) {
      return NextResponse.json({ error: "You have already used the 48-hour free trial" }, { status: 400 });
    }

    const planActivatedAt = new Date();
    let planExpiresAt = null;

    if (plan === "free_trial") {
      planExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
    } else if (plan === "annual") {
      planExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    }

    const updateDoc: any = {
      plan,
      planActivatedAt,
      planExpiresAt
    };

    if (plan === "free_trial") {
      updateDoc.hasUsedTrial = true;
    }

    await usersCollection.updateOne(
      { email: session.user.email },
      { $set: updateDoc }
    );

    return NextResponse.json({
      success: true,
      plan,
      planActivatedAt,
      planExpiresAt,
      hasUsedTrial: plan === "free_trial" ? true : (user?.hasUsedTrial || false)
    });
  } catch (error: any) {
    console.error("[Plan POST API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
