import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const { file, folder } = await req.json();

    if (!file) {
      return NextResponse.json({ error: "Missing file data." }, { status: 400 });
    }

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
