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
    
    // Check if 48-hour setup access has expired
    const createdAt = user?.createdAt || user?.lastLogin || new Date();
    if (user && !user.createdAt) {
      await usersCollection.updateOne({ _id: user._id }, { $set: { createdAt } });
    }

    const timeDiff = Date.now() - new Date(createdAt).getTime();
    const isExpired = timeDiff > 48 * 60 * 60 * 1000;

    const ownerDetails = user?.ownerDetails || null;

    return NextResponse.json({ ownerDetails, isExpired, createdAt });
  } catch (error: any) {
    console.error("[Owner Details API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
