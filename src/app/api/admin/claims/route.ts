import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";

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

    if (status === "Rejected") {
      const claim = await claimsCollection.findOne({ _id: new ObjectId(claimId) });
      if (claim && claim.claimantGmail) {
        const url = new URL(req.url);
        const origin = url.origin;
        
        const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
        const smtpPort = parseInt(process.env.SMTP_PORT || "587");
        const smtpUser = process.env.SMTP_USER || "";
        const smtpPass = process.env.SMTP_PASS || "";
        const smtpFrom = process.env.SMTP_FROM || `"LegacyBridge" <${smtpUser || "no-reply@legacybridge.in"}>`;

        if (smtpUser && smtpPass) {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
              user: smtpUser,
              pass: smtpPass
            },
            name: "legacybridge.in"
          });

          const mailOptions = {
            from: smtpFrom,
            to: claim.claimantGmail,
            subject: "LegacyBridge Claim Request Status: Rejected",
            html: `
              <div style="font-family: sans-serif; padding: 25px; color: #1a150e; background-color: #faf7f0; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(217, 184, 133, 0.25);">
                <div style="text-align: center; margin-bottom: 20px;">
                  <img src="${origin}/assets/legacybridge-logo.png" alt="LegacyBridge Logo" style="height: 60px; width: auto;" />
                </div>
                <h2 style="color: #ef4444; font-size: 20px; border-bottom: 2px solid rgba(217, 184, 133, 0.12); padding-bottom: 12px; margin-bottom: 20px; text-align: center;">LegacyBridge Claim Request Rejected</h2>
                <p style="font-size: 15px; line-height: 1.6;">Hello <strong>${claim.claimantName || "Beneficiary"}</strong>,</p>
                <p style="font-size: 15px; line-height: 1.6;">Your relative asset claim request for the vault owner <strong>${claim.ownerEmail}</strong> has been reviewed by our administrator and was <strong>Rejected</strong>.</p>
                <p style="font-size: 15px; line-height: 1.6; color: #6b5a45;">This is usually due to mismatched identity details (such as Aadhaar or PAN) or invalid death proof/certificates uploaded.</p>
                <p style="font-size: 15px; line-height: 1.6; margin-bottom: 24px;">Please visit the Beneficiary Claim Portal again, check the correct details, and submit a fresh request with valid proof documents.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${origin}/claim" style="background-color: #ef4444; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.4);">Restart Claim Request</a>
                </div>
                
                <p style="font-size: 14px; color: #6b5a45; border-top: 1px solid rgba(217, 184, 133, 0.12); padding-top: 15px; margin-top: 25px; margin-bottom: 0;">
                  Regards,<br/>
                  <strong>The LegacyBridge Admin Team</strong>
                </p>
              </div>
            `
          };

          await transporter.sendMail(mailOptions);
          console.log("[Admin Claims API] Rejection email sent to:", claim.claimantGmail);
        } else {
          console.warn("[Admin Claims API] SMTP credentials not configured. Rejection email sending skipped.");
        }
      }
    }

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
