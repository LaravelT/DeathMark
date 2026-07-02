import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { nomineeAadhaar, nomineePan } = await req.json();

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const usersCollection = db.collection("users");

    await usersCollection.updateOne(
      { email: session.user.email },
      { $set: { nomineeAadhaar, nomineePan } }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Nominee Credentials API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
