import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { email, claimId } = await req.json();

    if (!email && !claimId) {
      return NextResponse.json({ error: "Missing email or claimId." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const claimsCollection = db.collection("claims");

    const query: any = { status: "Approved" };
    if (claimId && claimId !== "undefined") {
      try {
        query._id = new ObjectId(claimId);
      } catch (err) {
        return NextResponse.json({ error: "Invalid claimId format." }, { status: 400 });
      }
    } else if (email) {
      query.ownerEmail = email.toLowerCase().trim();
    } else {
      return NextResponse.json({ error: "Insufficient details to locate claim." }, { status: 400 });
    }

    // Mark the approved claim for this owner as expired
    await claimsCollection.updateOne(
      query,
      { $set: { expired: true } }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Claim Expire API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
