import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import nodemailer from "nodemailer";

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
      status: "Pending Review"
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

    // Send confirmation email asynchronously
    try {
      const usersCollection = db.collection("users");
      const ownerUser = await usersCollection.findOne({ email: email.toLowerCase().trim() });
      
      let ownerName = "the user";
      if (ownerUser) {
        ownerName = ownerUser.ownerDetails?.name || ownerUser.name || ownerUser.email;
      }

      const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
      const smtpPort = parseInt(process.env.SMTP_PORT || "587");
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      if (smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass
          },
          name: 'legacybridge.in'
        });

        const smtpFrom = process.env.SMTP_FROM || `"LegacyBridge Support" <${smtpUser}>`;

        const mailOptions = {
          from: smtpFrom,
          to: claimantGmail.toLowerCase().trim(),
          subject: "We have received your LegacyBridge claim request",
          html: `
            <div style="font-family: sans-serif; padding: 30px; color: #1a150e; background-color: #faf7f0; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(217, 184, 133, 0.25); line-height: 1.6; font-size: 15px;">
              <p>Dear ${claimantName},</p>
              
              <p>We have received your request to access the LegacyBridge records of <strong>${ownerName}</strong>.</p>
              
              <p>We understand that this may be a difficult time, and we appreciate you sharing the required details with us.</p>
              
              <p>Our team will now review the information submitted by you as part of the claim process. If any additional details, documents, or verification steps are required, we will contact you.</p>
              
              <p>Please note that access to any records will be provided only after the review and verification process is completed.</p>
              
              <p>We will review your request and revert to you shortly.</p>
              
              <div style="margin-top: 30px; border-top: 1px solid rgba(217, 184, 133, 0.12); padding-top: 20px;">
                <p style="margin: 0; color: #6b5a45;">
                  Warm regards,<br/><br/>
                  <strong>Team LegacyBridge</strong><br/>
                  <span style="font-size: 13px; opacity: 0.8;">A product of Solution Planets</span>
                </p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log("[Claim Submit API] Confirmation email sent to:", claimantGmail);
      }
    } catch (emailError) {
      console.error("[Claim Submit API] Failed to send confirmation email:", emailError);
    }

    return NextResponse.json({ success: true, claimId: result.insertedId });
  } catch (error: any) {
    console.error("[Claim Submit API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
