import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "./db";
import nodemailer from "nodemailer";

// These are the specific scopes we need to access the appData folder on Drive
const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/drive.appdata",
].join(" ");

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-google-client-secret",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: GOOGLE_SCOPES,
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        try {
          const client = await clientPromise;
          const db = client.db("legacybridge");
          const usersCollection = db.collection("users");

          const existingUser = await usersCollection.findOne({ email: user.email });
          const isNewUser = !existingUser;

          await usersCollection.updateOne(
            { email: user.email },
            {
              $set: {
                email: user.email,
                lastLogin: new Date(),
              },
              $setOnInsert: {
                createdAt: new Date(),
                plan: "free_trial",
                planActivatedAt: new Date(),
                planExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
              }
            },
            { upsert: true }
          );

          if (isNewUser) {
            // Trigger welcome email asynchronously
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
                }
              });

              const firstName = user.name ? user.name.split(" ")[0] : "there";
              const smtpFrom = process.env.SMTP_FROM || `"LegacyBridge" <${smtpUser || "no-reply@legacybridge.in"}>`;

              const mailOptions = {
                from: smtpFrom,
                to: user.email,
                subject: "Welcome to LegacyBridge",
                html: `
                  <div style="font-family: sans-serif; padding: 30px; color: #1a150e; background-color: #faf7f0; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(217, 184, 133, 0.25); line-height: 1.6; font-size: 15px;">
                    <p>Dear ${firstName},</p>
                    <p>Welcome to <a href="https://legacybridge.in" style="color: #b28e46; text-decoration: underline; font-weight: bold;">LegacyBridge</a>.</p>
                    <p>First of all, thank you for trusting us with something so important.</p>
                    <p>Most of us spend decades building our life—earning money, buying a home, opening bank accounts, investing in mutual funds and shares, taking insurance, creating fixed deposits, building businesses, and collecting documents.</p>
                    <p>But very few of us ever stop to ask one simple question:</p>
                    <p><strong>If something happened to me tomorrow, would my spouse, children, or nominee even know where everything is?</strong></p>
                    <p>Not the value. Just what & where it exists.</p>
                    <p>LegacyBridge was built to solve exactly that problem.</p>
                    <p>It is not a portfolio tracker. It doesn't ask you to update market values every day. It simply helps you create a clear financial roadmap for the people you care about, so they aren't left searching during one of the most difficult times of their lives.</p>
                    
                    <div style="background-color: #ffffff; border-left: 4px solid #b28e46; padding: 15px; margin: 20px 0; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                      <h4 style="margin: 0 0 8px 0; color: #b28e46; font-size: 16px;">Here's all we ask from you:</h4>
                      <p style="margin: 0 0 10px 0;"><strong>Today:</strong> Spend about 30 minutes completing your first setup. Add your important accounts, policies, investments, properties, lockers, and other essential information.</p>
                      <p style="margin: 0;"><strong>Going forward:</strong> Spend just 10 minutes every few months reviewing your information. Even if you update it once every quarter, your family will always have an up-to-date roadmap.</p>
                    </div>

                    <p>Think of it like servicing your car or renewing your insurance.</p>
                    <p>You hope your family never needs it.</p>
                    <p>But if they ever do, they'll be grateful you took the time.</p>
                    <p><strong>One more thing...</strong></p>
                    <p>Your financial information remains encrypted and stored in your own Google Drive. LegacyBridge is designed so that your wealth information stays with you—not as readable data on a third-party server.</p>
                    <p>Thank you once again for becoming part of LegacyBridge.</p>
                    <p>Your family may never say it today. But one day, they just might thank you for this decision.</p>
                    
                    <div style="margin-top: 30px; border-top: 1px solid rgba(217, 184, 133, 0.12); padding-top: 20px;">
                      <p style="margin: 0; color: #6b5a45;">
                        With warm regards,<br/><br/>
                        <strong>Team LegacyBridge</strong><br/>
                        <span style="font-size: 13px; opacity: 0.8;">A product of Solution Planets</span>
                      </p>
                    </div>
                  </div>
                `
              };

              try {
                await transporter.sendMail(mailOptions);
                console.log("[Auth Welcome Email] Welcome email sent successfully to:", user.email);
              } catch (err) {
                console.error("[Auth Welcome Email] Error sending welcome email:", err);
              }
            } else {
              console.warn("[Auth Welcome Email] SMTP credentials not fully configured. Skipped sending welcome email.");
            }
          }
        } catch (error) {
          console.error("Error saving user login info to MongoDB:", error);
        }
      }
      return true;
    },
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token and refresh_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = Math.floor(Date.now() / 1000 + (account.expires_in || 3600));
      }
      if (token.email) {
        try {
          const client = await clientPromise;
          const db = client.db("legacybridge");
          const usersCollection = db.collection("users");
          const dbUser = await usersCollection.findOne({ email: token.email });
          token.isReturningUser = dbUser ? !!dbUser.hasCreatedVault : false;
        } catch (e) {
          console.error(e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      session.isReturningUser = token.isReturningUser as boolean | undefined;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
};
