import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Blog from "@/models/blog";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const deletedBlog = await Blog.findByIdAndDelete(id);
    if (!deletedBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Failed to delete blog:", error);
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await connectDB();
    
    const updatedBlog = await Blog.findByIdAndUpdate(id, body, { new: true });
    if (!updatedBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error("Failed to update blog:", error);
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    return NextResponse.json(blog);
  } catch (error) {
    console.error("Failed to fetch blog:", error);
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 });
  }
}
