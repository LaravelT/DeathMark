import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { claimId, accessLink } = await req.json();

    if (!claimId || !accessLink) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const claimsCollection = db.collection("claims");

    const claim = await claimsCollection.findOne({ _id: new ObjectId(claimId) });
    if (!claim) {
      return NextResponse.json({ error: "Claim not found." }, { status: 404 });
    }

    const recipientEmail = claim.claimantGmail;
    if (!recipientEmail) {
      return NextResponse.json({ error: "Claimant email not found." }, { status: 400 });
    }

    // SMTP Configuration
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER || "";
    const smtpPass = process.env.SMTP_PASS || "";
    const smtpFrom = process.env.SMTP_FROM || `"LegacyBridge" <${smtpUser || "no-reply@legacybridge.in"}>`;

    if (!smtpUser || !smtpPass) {
      console.warn("[Send Email API] SMTP credentials not configured in .env.local. Simulating success.");
      // Increment copy/send counter even for simulation so they can track usage
      await claimsCollection.updateOne(
        { _id: new ObjectId(claimId) },
        { $inc: { copyCount: 1 } }
      );
      return NextResponse.json({ 
        success: true, 
        simulated: true, 
        message: "SMTP not configured. Simulated sending to: " + recipientEmail 
      });
    }

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: smtpFrom,
      to: recipientEmail,
      subject: "LegacyBridge Approved: Secure Asset Vault Access",
      html: `
        <div style="font-family: sans-serif; padding: 25px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0;">
          <h2 style="color: #db2777; font-size: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 20px;">LegacyBridge Asset Vault Approved</h2>
          <p style="font-size: 15px; line-height: 1.6;">Hello <strong>${claim.claimantName}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6;">Your relative asset claim request for the vault owner <strong>${claim.ownerEmail}</strong> has been successfully verified and <strong>Approved</strong> by the system administrator.</p>
          <p style="font-size: 14px; color: #ef4444; font-weight: bold; background-color: #fef2f2; border: 1px dashed #fee2e2; padding: 12px; border-radius: 6px; margin: 15px 0;">IMPORTANT SECURITY WARNING: This secure access link can only be opened ONCE. Once you successfully verify details and decrypt the vault, the link will expire immediately. Make sure to download or export the PDF report before closing the page.</p>
          <p style="font-size: 15px; line-height: 1.6; margin-bottom: 24px;">Please click the button below to verify credentials and decrypt the vault assets on your device:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${accessLink}" style="background-color: #ec4899; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(236,72,153,0.4);">Access Decrypted Assets</a>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">If the button above does not work, please copy and paste the following link directly into your browser:</p>
          <p style="background-color: #ffffff; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; word-break: break-all; border: 1px solid #cbd5e1; color: #334155; margin: 10px 0 25px;">${accessLink}</p>
          
          <p style="font-size: 14px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: 25px; margin-bottom: 0;">
            Regards,<br/>
            <strong>The LegacyBridge Admin Team</strong>
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    // Increment send counter (uses copyCount as requested to keep 3-time copy limit same)
    await claimsCollection.updateOne(
      { _id: new ObjectId(claimId) },
      { $inc: { copyCount: 1 } }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Send Email API] Error sending mail:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
