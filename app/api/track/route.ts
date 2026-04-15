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

    const { title, slug, description, image } = body
    const missing = []
    if (!title) missing.push('title')
    if (!slug) missing.push('slug')
    if (!description) missing.push('description')
    if (!image) missing.push('image')

    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 })
    }

    const track = await Track.create(body)
    return NextResponse.json({ track }, { status: 201 })
  } catch (error: any) {
    console.error('Track creation error:', error)
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Slug already exists. Please choose a unique slug.' }, { status: 400 })
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: `Validation error: ${messages.join(', ')}` }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || 'Failed to create track' }, { status: 400 })
  }
}
