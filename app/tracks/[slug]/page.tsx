import { notFound } from "next/navigation"
import connectDB from "@/lib/db"
import Track from "@/models/track"
import TrackDetailClient from "./TrackDetailClient"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await connectDB()
  const track = await Track.findOne({ slug })
  if (!track) return { title: "Track Not Found" }
  return {
    title: `${track.title} | AWS Cloud Club MNNIT`,
    description: track.description,
  }
}

export default async function TrackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await connectDB()
  const track = await Track.findOne({ slug }).lean()

  if (!track) return notFound()

  // Serialize for client (convert MongoDB _id to string)
  const serialized = JSON.parse(JSON.stringify(track))

  return <TrackDetailClient track={serialized} />
}
