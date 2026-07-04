import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const claimsCollection = db.collection("claims");

    // Mark the approved claim for this owner as expired
    await claimsCollection.updateOne(
      { ownerEmail: email.toLowerCase().trim(), status: "Approved" },
      { $set: { expired: true } }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Claim Expire API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
