import * as React from "react"
import { notFound } from "next/navigation"
import connectDB from "@/lib/db"
import Event from "@/models/event"
import EventDetailClient from "./EventDetailClient"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await connectDB()
  const event = await Event.findOne({ slug }).lean()
  if (!event) return { title: "Event Not Found" }
  
  const title = `${event.title} | AWS Cloud Club MNNIT`;
  const description = `${event.title} - ${new Date(event.date).toLocaleDateString()} at ${event.location || "MNNIT Allahabad"}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://www.awscloudclub.mnnit.ac.in/events/${slug}`,
      images: [
        {
          url: event.image || event.coverImage || "/og-image.jpg",
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [event.image || event.coverImage || "/og-image.jpg"],
    },
    alternates: {
      canonical: `https://www.awscloudclub.mnnit.ac.in/events/${slug}`,
    },
  }
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await connectDB()
  const { slug } = await params
  const event = await Event.findOne({ slug, status: "published" }).lean()

  if (!event) return notFound()

  const serialized = JSON.parse(JSON.stringify(event))

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: new Date(event.date).toISOString(),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: event.location || "MNNIT Allahabad",
      address: {
        "@type": "PostalAddress",
        streetAddress: "MNNIT Allahabad Campus",
        addressLocality: "Prayagraj",
        postalCode: "211004",
        addressRegion: "UP",
        addressCountry: "IN"
      }
    },
    image: [event.image || event.coverImage || "https://www.awscloudclub.mnnit.ac.in/og-image.jpg"],
    description: event.description || `${event.title} hosted by AWS Cloud Club MNNIT`,
    organizer: {
      "@type": "Organization",
      name: "AWS Cloud Club MNNIT",
      url: "https://www.awscloudclub.mnnit.ac.in"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EventDetailClient event={serialized} />
    </>
  )
}
