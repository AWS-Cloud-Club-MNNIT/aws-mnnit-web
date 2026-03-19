import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Track from '@/models/track'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const track = await Track.findByIdAndUpdate(id, body, { new: true })
    if (!track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    return NextResponse.json({ track })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update track' }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const track = await Track.findByIdAndDelete(id)
    if (!track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    return NextResponse.json({ message: 'Track deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete track' }, { status: 400 })
  }
}
