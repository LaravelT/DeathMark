import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, claimantName, claimantGmail, reason, document } = await req.json();

    if (!email || !claimantName || !claimantGmail || !reason) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("legacybridge");
    
    // Check if there is an active claim submitted less than 7 days ago
    const claimsCollection = db.collection("claims");
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const existingClaim = await claimsCollection.findOne({
      ownerEmail: email.toLowerCase().trim(),
      submittedAt: { $gte: sevenDaysAgo }
    });

    if (existingClaim) {
      return NextResponse.json({ error: "An application is already in review for this email." }, { status: 400 });
    }

    const newClaim = {
      ownerEmail: email.toLowerCase().trim(),
      claimantName,
      claimantGmail: claimantGmail.toLowerCase().trim(),
      reason,
      document, // base64 representation of death certificate or supporting document
      status: "Pending Review",
      submittedAt: new Date()
    };

    const result = await claimsCollection.insertOne(newClaim);

    return NextResponse.json({ success: true, claimId: result.insertedId });
  } catch (error: any) {
    console.error("[Claim Submit API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
