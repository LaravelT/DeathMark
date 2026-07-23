import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import nodemailer from "nodemailer";

export async function GET(req: Request) {
  try {
    // Basic security check via query param
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    const cronSecret = process.env.CRON_SECRET || "legacybridge_cron_secret_key_2026";

    if (secret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const usersCollection = db.collection("users");

    // 90 days ago threshold
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // Find users who have created their vault, and either:
    // 1. have lastQuarterlyReminder <= 90 days ago OR
    // 2. have no lastQuarterlyReminder but createdAt <= 90 days ago
    const usersToRemind = await usersCollection.find({
      hasCreatedVault: true,
      $or: [
        { lastQuarterlyReminder: { $lte: ninetyDaysAgo } },
        { 
          lastQuarterlyReminder: { $exists: false },
          createdAt: { $lte: ninetyDaysAgo }
        }
      ]
    }).toArray();

    if (usersToRemind.length === 0) {
      return NextResponse.json({ message: "No users need quarterly reminders today." });
    }

    // SMTP Configuration
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER || "";
    const smtpPass = process.env.SMTP_PASS || "";
    const smtpFrom = process.env.SMTP_FROM || `"LegacyBridge" <${smtpUser || "no-reply@legacybridge.in"}>`;

    if (!smtpUser || !smtpPass) {
      return NextResponse.json({ error: "SMTP credentials not configured" }, { status: 500 });
    }

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

    let successCount = 0;
    let failCount = 0;

    for (const user of usersToRemind) {
      try {
        const emailName = user.email ? user.email.split("@")[0].replace(/[^a-zA-Z]/g, ' ') : "User";
        const capitalizedEmailName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        
        const firstName = user.ownerDetails?.name 
          ? user.ownerDetails.name.split(" ")[0] 
          : (user.name ? user.name.split(" ")[0] : capitalizedEmailName);

        const mailOptions = {
          from: smtpFrom,
          to: user.email,
          subject: "Time for your LegacyBridge quarterly review",
          html: `
            <div style="font-family: sans-serif; padding: 30px; color: #1a150e; background-color: #faf7f0; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(217, 184, 133, 0.25); line-height: 1.6; font-size: 15px;">
              <p>Dear ${firstName},</p>
              
              <p>This is a gentle reminder to review your LegacyBridge information.</p>
              
              <p>Once your first setup is done, you don’t need to spend much time on it again.</p>
              
              <p>Just 10 minutes once every quarter is enough.</p>
              
              <div style="background-color: #ffffff; border-left: 4px solid #b28e46; padding: 15px; margin: 20px 0; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <h4 style="margin: 0 0 10px 0; color: #b28e46; font-size: 15px;">In the last few months, you may have:</h4>
                <ul style="margin: 0; padding-left: 25px; color: #5c4d3c;">
                  <li style="margin-bottom: 6px;">Opened or closed a bank account</li>
                  <li style="margin-bottom: 6px;">Added a new investment</li>
                  <li style="margin-bottom: 6px;">Changed an insurance policy</li>
                  <li style="margin-bottom: 6px;">Created a new fixed deposit</li>
                  <li style="margin-bottom: 6px;">Taken or repaid a loan</li>
                  <li style="margin-bottom: 6px;">Updated nominee details</li>
                  <li style="margin-bottom: 6px;">Changed where important documents are kept</li>
                  <li style="margin-bottom: 6px;">Started or stopped an auto-debit</li>
                </ul>
              </div>
              
              <p>These small changes are easy to forget.</p>
              
              <p>But for your family, they can become very important.</p>
              
              <p>Please take 10 minutes today to review your LegacyBridge record and update anything that has changed.</p>
              
              <p>Think of it as a simple family responsibility — like renewing insurance or checking important documents.</p>
              
              <p>You are not doing this for today.</p>
              
              <p>You are doing this so your spouse, children, or nominee are not left guessing tomorrow.</p>
              
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
        
        // Mark as sent by updating lastQuarterlyReminder date
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { lastQuarterlyReminder: new Date() } }
        );
        successCount++;
      } catch (err) {
        console.error(`[Cron Quarterly Reminder] Failed to send email to ${user.email}:`, err);
        failCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: usersToRemind.length,
      sentSuccessfully: successCount,
      failedCount: failCount
    });
  } catch (error: any) {
    console.error("[Cron Quarterly Reminder GET API] Error:", error);
    return NextResponse.json({ error: error.message || "Cron execution failed" }, { status: 500 });
  }
}
