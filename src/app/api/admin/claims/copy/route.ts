import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { claimId } = await req.json();

    if (!claimId) {
      return NextResponse.json({ error: "Missing claimId." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const claimsCollection = db.collection("claims");

    await claimsCollection.updateOne(
      { _id: new ObjectId(claimId) },
      { $inc: { copyCount: 1 } }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Admin Claims Copy API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
