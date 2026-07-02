import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { step, email, ownerName, ownerAadhaar, ownerPan, nomineeAadhaar, nomineePan } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: "Invalid relative details. Please check and try again." }, { status: 400 });
    }

    // Check if there is an active claim (submitted less than 7 days ago)
    const claimsCollection = db.collection("claims");
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const existingClaim = await claimsCollection.findOne({
      ownerEmail: email.toLowerCase().trim(),
      submittedAt: { $gte: sevenDaysAgo }
    });

    if (existingClaim) {
      return NextResponse.json({ 
        success: true, 
        alreadyClaimed: true, 
        claimStatus: existingClaim.status,
        submittedAt: existingClaim.submittedAt 
      });
    }

    if (step === 1) {
      const dbOwnerName = user.ownerDetails?.name || "";
      if (dbOwnerName.toLowerCase().trim() !== ownerName.toLowerCase().trim()) {
        return NextResponse.json({ error: "Your details are invalid. Please check." }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (step === 2) {
      const dbOwnerAadhaar = user.ownerDetails?.aadhaarNo || "";
      const dbOwnerPan = user.ownerDetails?.panCardNo || "";
      if (dbOwnerAadhaar !== ownerAadhaar || dbOwnerPan.toUpperCase() !== ownerPan.toUpperCase()) {
        return NextResponse.json({ error: "Owner Aadhaar or PAN card number does not match." }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (step === 3) {
      const dbNomineeAadhaar = user.nomineeAadhaar || "";
      const dbNomineePan = user.nomineePan || "";
      if (dbNomineeAadhaar !== nomineeAadhaar || dbNomineePan.toUpperCase() !== nomineePan.toUpperCase()) {
        return NextResponse.json({ error: "Nominee Aadhaar or PAN card number does not match." }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid verification step." }, { status: 400 });
  } catch (error: any) {
    console.error("[Claim Verify API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
