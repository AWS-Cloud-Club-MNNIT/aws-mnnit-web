import * as React from "react"
import connectDB from "@/lib/db"
import Event from "@/models/event"
import EventsPageClient from "./EventsPageClient"

export const dynamic = "force-dynamic"

export default async function EventsPage() {
  await connectDB()
  // Public page: only show published events
  const events = await Event.find({ status: "published" }).sort({ date: 1 }).lean()
  const serialized = JSON.parse(JSON.stringify(events))
  return <EventsPageClient events={serialized} />
}
