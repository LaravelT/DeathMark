import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, otp, newPassphrase } = await req.json();
    const email = session.user.email;

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const otpsCollection = db.collection("otps");
    const usersCollection = db.collection("users");

    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER || "";
    const smtpPass = process.env.SMTP_PASS || "";
    const smtpFrom = process.env.SMTP_FROM || `"LegacyBridge" <${smtpUser || "no-reply@legacybridge.in"}>`;

    if (action === "send") {
      // Generate 6 digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

      // Store in DB
      await otpsCollection.updateOne(
        { email },
        { $set: { otp: generatedOtp, expiresAt } },
        { upsert: true }
      );

      // SMTP send
      if (!smtpUser || !smtpPass) {
        console.warn("[Forgot Password API] SMTP credentials not configured. OTP:", generatedOtp);
        return NextResponse.json({ 
          success: true, 
          simulated: true, 
          otp: generatedOtp,
          message: `SMTP not configured. OTP (Simulated): ${generatedOtp}` 
        });
      }

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
        to: email,
        subject: "LegacyBridge: Passphrase Reset OTP",
        html: `
          <div style="font-family: sans-serif; padding: 25px; color: #1a150e; background-color: #faf7f0; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(217, 184, 133, 0.25);">
            <h2 style="color: #b28e46; font-size: 20px; border-bottom: 2px solid rgba(217, 184, 133, 0.12); padding-bottom: 12px; margin-bottom: 20px; text-align: center;">Reset Passphrase OTP</h2>
            <p style="font-size: 15px; line-height: 1.6;">Hello,</p>
            <p style="font-size: 15px; line-height: 1.6;">We received a request to reset your LegacyBridge Master Passphrase. Use the following One-Time Password (OTP) to proceed:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #b28e46; background-color: #ffffff; padding: 12px 24px; border-radius: 8px; border: 1px solid rgba(217, 184, 133, 0.3); display: inline-block;">${generatedOtp}</span>
            </div>

            <p style="font-size: 13px; color: #b91c1c; font-weight: bold; text-align: center;">This OTP is valid for 5 minutes only. Do not share this OTP with anyone.</p>
            
            <p style="font-size: 14px; color: #6b5a45; border-top: 1px solid rgba(217, 184, 133, 0.12); padding-top: 15px; margin-top: 25px; margin-bottom: 0;">
              Regards,<br/>
              <strong>The LegacyBridge Support Team</strong>
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      return NextResponse.json({ success: true });
    }

    if (action === "verify") {
      if (!otp) {
        return NextResponse.json({ error: "Missing OTP." }, { status: 400 });
      }

      const record = await otpsCollection.findOne({ email });
      if (!record) {
        return NextResponse.json({ error: "OTP not requested or expired." }, { status: 400 });
      }

      if (new Date() > record.expiresAt) {
        return NextResponse.json({ error: "OTP has expired." }, { status: 400 });
      }

      if (record.otp !== otp) {
        return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
      }

      // OTP verified. Delete OTP record.
      await otpsCollection.deleteOne({ email });

      return NextResponse.json({ success: true });
    }

    if (action === "reset") {
      if (!newPassphrase) {
        return NextResponse.json({ error: "Missing new passphrase." }, { status: 400 });
      }

      // To reset, we set hasCreatedVault to false so the user can re-initialize their vault key/mnemonic.
      // This is because we cannot decrypt the old data without the old password.
      // We will remove their salt/metadata from MongoDB so they can do a fresh initialization.
      await usersCollection.updateOne(
        { email },
        { $set: { hasCreatedVault: false }, $unset: { ownerDetails: "" } }
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("[Forgot Password API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
