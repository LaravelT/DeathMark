import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("legacybridge");

    // 1. Verify if there is an Approved claim for this owner email
    const claimsCollection = db.collection("claims");
    const approvedClaim = await claimsCollection.findOne({
      ownerEmail: email.toLowerCase().trim(),
      status: "Approved"
    });

    if (!approvedClaim) {
      return NextResponse.json(
        { error: "Access Denied. No approved claims found for this vault." },
        { status: 403 }
      );
    }

    // 2. Fetch the encrypted snapshot
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email: email.toLowerCase().trim() });

    if (!user || !user.encryptedSnapshot) {
      return NextResponse.json(
        { error: "No vault snapshot found for this user." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      encryptedSnapshot: user.encryptedSnapshot,
      ownerName: user.ownerDetails?.name || ""
    });
  } catch (error: any) {
    console.error("[Claim Snapshot API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
