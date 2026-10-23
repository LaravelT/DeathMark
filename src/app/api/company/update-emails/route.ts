import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db";
import { verifyCompanyToken } from "@/lib/companyAuth";

export async function POST(req: Request) {
  try {
    let token = "";
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    if (!token) {
      const cookieHeader = req.headers.get("cookie") || "";
      const match = cookieHeader.match(/company_portal_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    const payload = verifyCompanyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized session or session expired. Please sign in again." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { emails } = body;

    if (!Array.isArray(emails)) {
      return NextResponse.json({ error: "Invalid emails data format. Array expected." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("legacybridge");
    const couponsCollection = db.collection("coupons");

    const coupon = await couponsCollection.findOne({
      _id: new ObjectId(payload.couponId),
      status: "active",
    });

    if (!coupon) {
      return NextResponse.json({ error: "Company coupon not found or deactivated." }, { status: 404 });
    }

    const maxAllowed = coupon.maxEmails || 50;

    // Clean, format, and deduplicate emails
    const uniqueEmails = Array.from(
      new Set(
        emails
          .map((e: any) => String(e).trim().toLowerCase())
          .filter((e: string) => e.length > 0)
      )
    );

    // Validate that each entry looks like an email or domain
    const invalidItems = uniqueEmails.filter((item) => !item.includes("@") && !item.includes("."));
    if (invalidItems.length > 0) {
      return NextResponse.json({ 
        error: `Invalid email or domain format detected: "${invalidItems.slice(0, 3).join(", ")}"` 
      }, { status: 400 });
    }

    if (uniqueEmails.length > maxAllowed) {
      return NextResponse.json({ 
        error: `Quota exceeded! You can register a maximum of ${maxAllowed} emails. You have provided ${uniqueEmails.length}.` 
      }, { status: 400 });
    }

    await couponsCollection.updateOne(
      { _id: new ObjectId(payload.couponId) },
      { 
        $set: { 
          allowedEmails: uniqueEmails,
          emailsUpdatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({
      success: true,
      allowedEmails: uniqueEmails,
      count: uniqueEmails.length,
      maxEmails: maxAllowed,
      message: `Successfully saved ${uniqueEmails.length} allowed employee emails.`
    });
  } catch (error: any) {
    console.error("[Company Portal Update Emails API] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update emails" }, { status: 500 });
  }
}
