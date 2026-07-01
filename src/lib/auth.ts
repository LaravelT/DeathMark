import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "./db";

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

          await usersCollection.updateOne(
            { email: user.email },
            {
              $set: {
                email: user.email,
                lastLogin: new Date(),
              },
            },
            { upsert: true }
          );
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
