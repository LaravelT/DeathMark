import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("[Initialize API] Session detected:", session);
    if (!session?.user?.email) {
      console.log("[Initialize API] No email found in session. Unauthorized.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const ownerDetails = body.ownerDetails || null;

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const usersCollection = db.collection("users");

    console.log("[Initialize API] Updating user in MongoDB:", session.user.email);
    const result = await usersCollection.updateOne(
      { email: session.user.email },
      { $set: { hasCreatedVault: true, ownerDetails } }
    );
    console.log("[Initialize API] MongoDB Update Result:", result);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Initialize API] Error occurred:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
