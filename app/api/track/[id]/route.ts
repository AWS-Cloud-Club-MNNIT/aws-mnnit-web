import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Track from '@/models/track'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const track = await Track.findByIdAndUpdate(id, body, { new: true, runValidators: true })
    if (!track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    return NextResponse.json({ track })
  } catch (error: any) {
    console.error('Track update error:', error)
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Slug already exists. Please choose a unique slug.' }, { status: 400 })
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: `Validation error: ${messages.join(', ')}` }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || 'Failed to update track' }, { status: 400 })
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
