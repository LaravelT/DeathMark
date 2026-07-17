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

    // 7 days ago threshold
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Find users registered >= 7 days ago who haven't completed their vault and haven't received this reminder
    const usersToRemind = await usersCollection.find({
      createdAt: { $lte: sevenDaysAgo },
      sentSevenDayReminder: { $ne: true },
      hasCreatedVault: { $ne: true }
    }).toArray();

    if (usersToRemind.length === 0) {
      return NextResponse.json({ message: "No users need reminders today." });
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
      }
    });

    let successCount = 0;
    let failCount = 0;

    for (const user of usersToRemind) {
      try {
        const firstName = user.ownerDetails?.name 
          ? user.ownerDetails.name.split(" ")[0] 
          : (user.name ? user.name.split(" ")[0] : "there");

        const mailOptions = {
          from: smtpFrom,
          to: user.email,
          subject: "Have you completed your LegacyBridge setup?",
          html: `
            <div style="font-family: sans-serif; padding: 30px; color: #1a150e; background-color: #faf7f0; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(217, 184, 133, 0.25); line-height: 1.6; font-size: 15px;">
              <p>Dear ${firstName},</p>
              
              <p>You registered on <a href="https://legacybridge.in" style="color: #b28e46; text-decoration: underline; font-weight: bold;">LegacyBridge</a> a few days ago, and we hope you've had a chance to start your setup.</p>
              
              <p>This is a gentle reminder to complete your LegacyBridge record.</p>
              
              <p>We know it may feel like a task you can do “later,” but this is exactly the kind of thing most families wish had been done earlier.</p>
              
              <p>You don’t need to complete everything perfectly.</p>
              
              <div style="background-color: #ffffff; border-left: 4px solid #b28e46; padding: 15px; margin: 20px 0; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <h4 style="margin: 0 0 10px 0; color: #b28e46; font-size: 15px;">Start with the basics:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #5c4d3c; display: flex; flexDirection: column; gap: 6px;">
                  <li>Bank accounts</li>
                  <li>Insurance policies</li>
                  <li>Investments</li>
                  <li>Property details</li>
                  <li>Important documents</li>
                  <li>Lockers, loans, and liabilities</li>
                  <li>Anything your spouse, children, or nominee should know</li>
                </ul>
              </div>
              
              <p>The first setup may take around 30 minutes.</p>
              
              <p>But those 30 minutes can save your family from confusion, stress, and helpless searching in the future.</p>
              
              <p><strong>LegacyBridge is not about tracking your wealth.</strong></p>
              
              <p>It is about helping your family know where to look, whom to contact, and what exists.</p>
              
              <p>Please take some time today and complete your setup.</p>
              
              <p>Your family may not need this information today.</p>
              
              <p>But if they ever do, this one step can make a big difference.</p>
              
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
        
        // Mark as sent
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { sentSevenDayReminder: true } }
        );
        successCount++;
      } catch (err) {
        console.error(`[Cron Reminder] Failed to send email to ${user.email}:`, err);
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
    console.error("[Cron Reminder GET API] Error:", error);
    return NextResponse.json({ error: error.message || "Cron execution failed" }, { status: 500 });
  }
}
