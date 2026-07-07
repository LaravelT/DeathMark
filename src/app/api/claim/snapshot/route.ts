import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const claimId = searchParams.get("claimId");

    if (!email && !claimId) {
      return NextResponse.json({ error: "Email or Claim ID is required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("legacybridge");

    // 1. Verify if there is an Approved claim
    const claimsCollection = db.collection("claims");
    
    const query: any = { status: "Approved" };
    if (claimId && claimId !== "undefined") {
      try {
        query._id = new ObjectId(claimId);
      } catch (err) {
        return NextResponse.json({ error: "Invalid Claim ID format." }, { status: 400 });
      }
    } else if (email) {
      query.ownerEmail = email.toLowerCase().trim();
    } else {
      return NextResponse.json({ error: "Insufficient details to locate claim." }, { status: 400 });
    }

    const approvedClaim = await claimsCollection.findOne(query);

    if (!approvedClaim) {
      return NextResponse.json(
        { error: "Access Denied. No approved claims found for this vault." },
        { status: 403 }
      );
    }

    if (approvedClaim.expired) {
      return NextResponse.json(
        { error: "This secure access link has already been used and is expired." },
        { status: 403 }
      );
    }

    const targetEmail = approvedClaim.ownerEmail || (email ? email.toLowerCase().trim() : "");
    if (!targetEmail) {
      return NextResponse.json({ error: "Vault owner email not found." }, { status: 404 });
    }

    // 2. Fetch the encrypted snapshot
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email: targetEmail });

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
