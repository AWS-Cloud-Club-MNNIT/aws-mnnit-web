import * as React from "react"
import Image from "next/image"
import { notFound } from "next/navigation"
import connectDB from "@/lib/db"
import Blog from "@/models/blog"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import Link from "next/link"
import { CaretLeft, CalendarBlank, Tag } from "@phosphor-icons/react/dist/ssr"

import { MathWrapper } from "@/components/shared/MathWrapper"
export const dynamic = "force-dynamic"

// ─── Types ──────────────────────────────────────────────────────────────────
interface BlockData {
  html?: string;
  url?: string;
  title?: string;
  images?: Array<{ url: string; alt?: string; caption?: string }>;
  alignment?: "left" | "right" | "center";
  displaySize?: "small" | "medium" | "large" | "full";
  imagePosition?: "left" | "right";
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  filename?: string;
  language?: string;
  code?: string;
  type?: string;
  latex?: string;
}

interface Block {
  id: string;
  type: string;
  data: BlockData;
  order: number;
}

// ─── YouTube embed helper ─────────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return match ? match[1] : null
}

// ─── Block Renderers ──────────────────────────────────────────────────────────
function TextBlock({ data }: { data: BlockData }) {
  return (
    <div
      className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white prose-p:text-white/75 prose-p:leading-relaxed prose-a:text-secondary hover:prose-a:text-secondary/80 prose-strong:text-white prose-code:text-secondary prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-blockquote:border-l-primary prose-blockquote:text-white/60"
      dangerouslySetInnerHTML={{ __html: data.html || "" }}
    />
  )
}

function ImageBlock({ data }: { data: BlockData }) {
  const images = data.images || []
  if (!images.length) return null
  const alignment = data.alignment || "center"
  const alignClass = alignment === "left" ? "justify-start" : alignment === "right" ? "justify-end" : "justify-center"
  const cols = Math.min(images.length, 3)
  // Size controls max-width of the whole block
  const sizeClass: Record<string, string> = {
    small:  "max-w-xs",
    medium: "max-w-xl",
    large:  "max-w-3xl",
    full:   "w-full",
  }
  const wrapClass = sizeClass[data.displaySize || "full"] ?? "w-full"
  return (
    <figure className={`${wrapClass} ${
      alignment === "left" ? "mr-auto" : alignment === "right" ? "ml-auto" : "mx-auto"
    } my-4`}>
      <div className={`flex flex-wrap gap-4 ${alignClass}`}>
        {images.map((img, i: number) => (
          <div key={i} className={`overflow-hidden rounded-2xl border border-white/[0.05] relative ${
            cols === 1 ? "w-full aspect-video" : cols === 2 ? "flex-1 min-w-[45%] aspect-square" : "flex-1 min-w-[30%] aspect-square"
          }`}>
            <Image src={img.url} alt={img.alt || img.caption || ""} fill className="object-cover" loading="lazy" />
            {img.caption && <figcaption className="absolute bottom-0 inset-x-0 bg-black/60 text-center text-xs text-white/90 py-2 px-3 backdrop-blur-sm">{img.caption}</figcaption>}
          </div>
        ))}
      </div>
    </figure>
  )
}

function MixedBlock({ data }: { data: BlockData }) {
  const isRight = data.imagePosition === "right"
  return (
    <div className={`flex flex-col md:flex-row gap-8 items-start my-2 ${isRight ? "md:flex-row-reverse" : ""}`}>
      {data.imageUrl && (
        <figure className="md:w-2/5 flex-shrink-0 relative aspect-video">
          <Image src={data.imageUrl} alt={data.imageAlt || ""} fill className="rounded-2xl border border-white/[0.05] object-cover" loading="lazy" />
          {data.imageCaption && <figcaption className="text-center text-xs text-white/40 mt-2">{data.imageCaption}</figcaption>}
        </figure>
      )}
      <div className="flex-1 prose prose-invert prose-base max-w-none prose-p:text-white/75 prose-headings:text-white" dangerouslySetInnerHTML={{ __html: data.html || "" }} />
    </div>
  )
}

function CodeBlock({ data }: { data: BlockData }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0d1117] my-2">
      {(data.filename || data.language) && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.03]">
          <span className="text-xs font-mono text-white/40">{data.filename || ""}</span>
          {data.language && <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 px-2 py-0.5 bg-white/5 rounded">{data.language}</span>}
        </div>
      )}
      <pre className="p-5 overflow-x-auto"><code className="font-mono text-sm text-green-300/90 leading-relaxed whitespace-pre">{data.code}</code></pre>
    </div>
  )
}

function EmbedBlock({ data }: { data: BlockData }) {
  if (data.type === "youtube" || (data.url && (data.url.includes("youtube") || data.url.includes("youtu.be")))) {
    const videoId = getYouTubeId(data.url || "")
    if (!videoId) return null
    return (
      <figure className="my-4 px-4 md:px-8">
        {/* Wrapper: do NOT use overflow-hidden — it can trap scroll events on mobile */}
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={data.title || "YouTube video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full rounded-2xl border border-white/[0.08]"
          />
        </div>
        {data.title && <figcaption className="text-center text-xs text-white/40 mt-2">{data.title}</figcaption>}
      </figure>
    )
  }
  return (
    <a href={data.url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 transition-all group my-2">
      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
        <Tag className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm group-hover:text-secondary transition-colors truncate">{data.title || data.url}</p>
        <p className="text-white/30 text-xs truncate mt-0.5">{data.url}</p>
      </div>
    </a>
  )
}

/**
 * MathBlock — renders LaTeX formulas using the parent MathWrapper's KaTeX auto-render.
 * We output the raw LaTeX wrapped in $$ delimiters so MathWrapper picks it up.
 */
function MathBlock({ data }: { data: BlockData }) {
  const latex = data.latex?.trim() || ""
  if (!latex) return null
  // If user already wrapped with $$ keep as-is, otherwise wrap for display mode
  const content = latex.startsWith("$$") ? latex : `$$${latex}$$`
  return (
    <div className="overflow-x-auto rounded-2xl bg-black/20 border border-white/[0.08] px-6 py-5 my-2 text-center">
      {/* MathWrapper's auto-render will find and render this */}
      <span dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}

function renderBlock(block: Block) {
  switch (block.type) {
    case "text": return <TextBlock key={block.id} data={block.data} />
    case "image": return <ImageBlock key={block.id} data={block.data} />
    case "mixed": return <MixedBlock key={block.id} data={block.data} />
    case "code": return <CodeBlock key={block.id} data={block.data} />
    case "embed": return <EmbedBlock key={block.id} data={block.data} />
    case "math": return <MathBlock key={block.id} data={block.data} />
    default: return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await connectDB()
  const blog = await Blog.findOne({ slug }).lean()
  if (!blog) return { title: "Post Not Found" }
  
  const description = (blog.blocks?.find((b: Block) => b.type === "text")?.data?.html || "").replace(/<[^>]+>/g, "").slice(0, 160) || "Read the latest post from AWS Cloud Club MNNIT.";
  const title = `${blog.title} | AWS Cloud Club MNNIT`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://www.awscloudclub.mnnit.ac.in/blogs/${slug}`,
      images: [
        {
          url: blog.coverImage || "/og-image.jpg",
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [blog.coverImage || "/og-image.jpg"],
    },
    alternates: {
      canonical: `https://www.awscloudclub.mnnit.ac.in/blogs/${slug}`,
    },
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await connectDB()
  const { slug } = await params
  const blog = await Blog.findOne({ slug, status: "published" })

  if (!blog) return notFound()

  const sortedBlocks = [...blog.blocks].sort((a, b) => a.order - b.order)
  const description = (sortedBlocks.find((b: Block) => b.type === "text")?.data?.html || "").replace(/<[^>]+>/g, "").slice(0, 160) || "Read the latest post from AWS Cloud Club MNNIT.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    image: [blog.coverImage || "https://www.awscloudclub.mnnit.ac.in/og-image.jpg"],
    datePublished: blog.createdAt ? new Date(blog.createdAt).toISOString() : new Date().toISOString(),
    dateModified: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : new Date().toISOString(),
    author: [{
      "@type": "Person",
      name: "AWS Cloud Club MNNIT",
    }],
    description: description,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero / Cover */}
        <div className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background z-10" />
          <Image src={blog.coverImage} alt={blog.title} fill className="object-cover" priority />
        </div>

        {/* Article — overflow-x-hidden prevents wide blocks (code, images) from causing horizontal scroll */}
        <article className="-mt-24 relative z-20 pb-24 px-4 md:px-8 overflow-x-hidden">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(blog.tags || []).map((t: string) => (
              <span key={t} className="px-3 py-1 bg-primary/20 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                {t}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6">
            {blog.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-6 text-xs font-medium text-white/40 mb-12 pb-8 border-b border-white/[0.06]">
            <span className="flex items-center gap-1.5">
              <CalendarBlank className="w-4 h-4" />
              {new Date(blog.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span>{sortedBlocks.length} block{sortedBlocks.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Blocks */}
          <MathWrapper className="space-y-8">
            {sortedBlocks.map(block => renderBlock(block))}
          </MathWrapper>

          {/* Back link */}
          <div className="pt-16 border-t border-white/[0.06] mt-16">
            <Link href="/blogs" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors group font-medium text-sm">
              <CaretLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to all posts
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
