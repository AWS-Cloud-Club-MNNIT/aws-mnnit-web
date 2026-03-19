import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Track from '@/models/track'

export async function GET() {
  try {
    await connectDB()
    const tracks = await Track.find({}).sort({ createdAt: -1 })
    return NextResponse.json({ tracks })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()
    const track = await Track.create(body)
    return NextResponse.json({ track }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create track' }, { status: 400 })
  }
}
