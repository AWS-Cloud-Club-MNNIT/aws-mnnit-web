import * as React from "react"
import Link from "next/link"
import connectDB from "@/lib/db"
import Blog from "@/models/blog"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import Image from "next/image"
import { BookOpenText } from "@phosphor-icons/react/dist/ssr"

export const dynamic = "force-dynamic"

export default async function BlogsPage() {
  await connectDB()
  const blogs = await Blog.find().sort({ createdAt: -1 })

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 md:w-2/3 mx-auto">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Cloud <span className="text-secondary">Engineering</span> Insights
            </h1>
            <p className="text-lg md:text-xl text-white/50">
              Deep-dive tutorials, architecture breakdowns, and best practices curated by the AWS Cloud Club MNNIT community.
            </p>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-20 border border-white/[0.05] rounded-3xl bg-card/20">
              <p className="text-white/60">Check back soon for engineering blogs!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <Link href={`/blogs/${blog.slug}`} key={blog._id.toString()} className="group h-full flex flex-col bg-card/20 border border-white/[0.05] hover:border-white/20 transition-all rounded-3xl overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-2xl shadow-primary/10">
                  <div className="h-48 w-full relative overflow-hidden">
                    <Image 
                      src={blog.thumbnail} 
                      fill
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      alt={blog.title} 
                    />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      {blog.tags.slice(0, 2).map((t: string) => (
                        <span key={t} className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/5 rounded text-white border border-white/5">
                          {t}
                        </span>
                      ))}
                    </div>
                    
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all line-clamp-2">
                      {blog.title}
                    </h2>
                    
                    <div className="mt-auto pt-6 flex items-center justify-between text-xs font-semibold text-white/40 border-t border-white/[0.05]">
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1 group-hover:text-secondary transition-colors"><BookOpenText className="w-4 h-4" /> Read Article</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
