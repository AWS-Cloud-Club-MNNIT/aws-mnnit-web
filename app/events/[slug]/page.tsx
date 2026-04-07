import * as React from "react"
import { notFound } from "next/navigation"
import connectDB from "@/lib/db"
import Event from "@/models/event"
import EventDetailClient from "./EventDetailClient"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await connectDB()
  const event = await Event.findOne({ slug })
  if (!event) return { title: "Event Not Found" }
  return {
    title: `${event.title} | AWS Cloud Club MNNIT`,
    description: `${event.title} - ${new Date(event.date).toLocaleDateString()} at ${event.location || "MNNIT Allahabad"}`,
  }
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await connectDB()
  const { slug } = await params
  const event = await Event.findOne({ slug, status: "published" }).lean()

  if (!event) return notFound()

  const serialized = JSON.parse(JSON.stringify(event))

  return <EventDetailClient event={serialized} />
}
