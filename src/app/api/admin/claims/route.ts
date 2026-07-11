import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("legacybridge");
    const claimsCollection = db.collection("claims");

    const claims = await claimsCollection.find({}).sort({ submittedAt: -1 }).toArray();
    return NextResponse.json({ claims });
  } catch (error: any) {
    console.error("[Admin Claims GET API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { claimId, status } = await req.json();

    if (!claimId || !status) {
      return NextResponse.json({ error: "Missing claimId or status." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const claimsCollection = db.collection("claims");

    await claimsCollection.updateOne(
      { _id: new ObjectId(claimId) },
      { $set: { status } }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Admin Claims POST API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const claimId = searchParams.get("claimId");

    if (!claimId) {
      return NextResponse.json({ error: "Missing claimId." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const claimsCollection = db.collection("claims");

    await claimsCollection.deleteOne({ _id: new ObjectId(claimId) });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Admin Claims DELETE API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
