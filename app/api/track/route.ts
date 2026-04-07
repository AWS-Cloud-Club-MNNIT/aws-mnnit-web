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

    if (!body.title || !body.slug || !body.description || !body.image) {
      return NextResponse.json({ error: 'Missing required fields: title, slug, description, image' }, { status: 400 })
    }

    const track = await Track.create(body)
    return NextResponse.json({ track }, { status: 201 })
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create track' }, { status: 400 })
  }
}
