import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Blog from "@/models/blog";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // 'published' | 'draft' | null (all)
    const query = status ? { status } : {};
    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectDB();

    if (!body.title || !body.slug || !body.coverImage) {
      return NextResponse.json({ error: "Missing required fields: title, slug, coverImage" }, { status: 400 });
    }

    const newBlog = await Blog.create(body);
    return NextResponse.json(newBlog, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }
    console.error("Failed to create blog:", error);
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
  }
}
