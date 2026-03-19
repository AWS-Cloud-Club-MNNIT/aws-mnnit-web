import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "aws-mnnit",
          format: "webp",
          quality: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      url: (cloudinaryResult as any).secure_url,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Image upload failed" },
      { status: 500 }
    );
  }
}
