import * as React from "react"
import { notFound } from "next/navigation"
import connectDB from "@/lib/db"
import Blog from "@/models/blog"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import Markdown from "react-markdown"

export const dynamic = "force-dynamic"

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await connectDB()
  const { slug } = await params
  const blog = await Blog.findOne({ slug })

  if (!blog) return notFound()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-24">
        <article className="container mx-auto px-6 max-w-4xl">
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
              {blog.tags.map((t: string) => (
                <span key={t} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-white/80">
                  {t}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6">
              {blog.title}
            </h1>
            <p className="text-white/40 font-medium tracking-widest text-sm uppercase">
              Published on {new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="w-full h-[300px] md:h-[500px] rounded-3xl overflow-hidden mb-16 border border-white/[0.05] shadow-2xl">
            <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover" />
          </div>

          <div className="prose prose-invert prose-lg md:prose-xl max-w-none text-white/80 leading-relaxed font-sans prose-headings:font-bold prose-headings:tracking-tight prose-a:text-secondary hover:prose-a:text-secondary/80">
            <Markdown>{blog.content}</Markdown>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
