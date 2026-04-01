import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Sponsor from "@/models/sponsor";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const sponsor = await Sponsor.findById(id);
    if (!sponsor) {
      return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
    }
    return NextResponse.json(sponsor);
  } catch (error) {
    console.error("Failed to fetch sponsor:", error);
    return NextResponse.json({ error: "Failed to fetch sponsor" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await connectDB();

    const updatedSponsor = await Sponsor.findByIdAndUpdate(id, body, { new: true });
    if (!updatedSponsor) {
      return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
    }
    return NextResponse.json(updatedSponsor);
  } catch (error) {
    console.error("Failed to update sponsor:", error);
    return NextResponse.json({ error: "Failed to update sponsor" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const deletedSponsor = await Sponsor.findByIdAndDelete(id);
    if (!deletedSponsor) {
      return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Sponsor deleted successfully" });
  } catch (error) {
    console.error("Failed to delete sponsor:", error);
    return NextResponse.json({ error: "Failed to delete sponsor" }, { status: 500 });
  }
}
