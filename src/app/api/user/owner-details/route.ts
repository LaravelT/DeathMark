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
    const ownerDetails = user?.ownerDetails || null;

    return NextResponse.json({ ownerDetails });
  } catch (error: any) {
    console.error("[Owner Details API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
