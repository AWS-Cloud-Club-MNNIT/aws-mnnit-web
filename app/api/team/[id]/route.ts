import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/models/team";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const deletedTeamMenu = await Team.findByIdAndDelete(id);
    if (!deletedTeamMenu) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Team member deleted successfully" });
  } catch (error) {
    console.error("Failed to delete team member:", error);
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await connectDB();
    
    const updatedTeam = await Team.findByIdAndUpdate(id, body, { new: true });
    if (!updatedTeam) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }
    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error("Failed to update team member:", error);
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
  }
}
