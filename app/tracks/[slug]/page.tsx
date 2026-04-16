import { notFound } from "next/navigation"
import connectDB from "@/lib/db"
import Track from "@/models/track"
import TrackDetailClient from "./TrackDetailClient"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await connectDB()
  const track = await Track.findOne({ slug }).lean()
  if (!track) return { title: "Track Not Found" }

  const title = `${track.title} | AWS Cloud Club MNNIT`;
  const description = track.description || "Explore our comprehensive learning tracks at AWS Cloud Club MNNIT.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://www.awscloudclub.mnnit.ac.in/tracks/${slug}`,
      images: [
        {
          url: track.image || "/og-image.jpg",
          alt: track.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [track.image || "/og-image.jpg"],
    },
    alternates: {
      canonical: `https://www.awscloudclub.mnnit.ac.in/tracks/${slug}`,
    },
  }
}

export default async function TrackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await connectDB()
  const track = await Track.findOne({ slug }).lean()

  if (!track) return notFound()

  const serialized = JSON.parse(JSON.stringify(track))

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: track.title,
    description: track.description || `Learning track for ${track.title} by AWS Cloud Club MNNIT.`,
    provider: {
      "@type": "Organization",
      name: "AWS Cloud Club MNNIT",
      sameAs: "https://www.awscloudclub.mnnit.ac.in"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrackDetailClient track={serialized} />
    </>
  )
}
