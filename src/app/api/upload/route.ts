import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: Request) {
  try {
    const { file, folder } = await req.json();

    if (!file) {
      return NextResponse.json({ error: "Missing file data." }, { status: 400 });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ 
        error: "Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing on the Vercel production server. Please configure them in the Vercel Dashboard." 
      }, { status: 500 });
    }

    // Configure Cloudinary dynamically inside the request handler to ensure environment variables are fresh
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
      api_key: process.env.CLOUDINARY_API_KEY.trim(),
      api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
    });

    // Upload to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(file, {
      folder: folder || "legacybridge",
      resource_type: "auto", // handles images, PDFs, etc.
    });

    return NextResponse.json({
      success: true,
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
    });
  } catch (error: any) {
    console.error("[Upload API] Error uploading to Cloudinary:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
