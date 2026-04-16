"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import {
  CaretLeft, CaretDown, CaretRight, CheckCircle, Circle, YoutubeLogo,
  ArrowSquareOut, BookOpen, Video, Link as LinkIcon, Exam, Article,
  GithubLogo
} from "@phosphor-icons/react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import remarkGfm from "remark-gfm"
import "katex/dist/katex.min.css"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Problem { id: string; title: string; url: string; difficulty: "easy" | "medium" | "hard" }
interface VideoItem { id: string; title: string; youtubeUrl: string }
interface Resource { id: string; title: string; url: string; type: string }
interface Topic {
  id: string; title: string; description: string; notes: string; order: number;
  problems: Problem[]; videos: VideoItem[]; resources: Resource[]; subtopics: Topic[]
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return match ? match[1] : null
}

const DIFFICULTY_COLORS = {
  easy: "text-green-400 bg-green-400/10 border-green-400/20",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  hard: "text-red-400 bg-red-400/10 border-red-400/20",
}

const RESOURCE_ICONS: Record<string, React.ElementType> = {
  article: Article,
  doc: BookOpen,
  github: GithubLogo,
  other: LinkIcon,
}

// ─── Flatten topics for "all IDs" ────────────────────────────────────────────
function flattenIds(topics: Topic[]): string[] {
  return topics.flatMap(t => [t.id, ...flattenIds(t.subtopics || [])])
}

// ─── Sidebar Tree Item ────────────────────────────────────────────────────────
function TreeItem({
  topic,
  depth = 0,
  selectedId,
  completedIds,
  onSelect,
}: {
  topic: Topic
  depth?: number
  selectedId: string | null
  completedIds: Set<string>
  onSelect: (id: string) => void
}) {
  const [open, setOpen] = React.useState(depth === 0)
  const hasChildren = topic.subtopics && topic.subtopics.length > 0
  const isSelected = selectedId === topic.id
  const isCompleted = completedIds.has(topic.id)

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all group
          ${isSelected ? "bg-primary/20 text-white border border-primary/30" : "hover:bg-white/[0.04] text-white/60 hover:text-white border border-transparent"}`}
        style={{ paddingLeft: `${(depth * 16) + 12}px` }}
        onClick={() => onSelect(topic.id)}
      >
        {isCompleted
          ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" weight="fill" />
          : <Circle className="w-4 h-4 text-white/20 flex-shrink-0 group-hover:text-white/40 transition-colors" />
        }
        <span className={`flex-1 text-sm font-medium truncate ${isSelected ? "text-white" : ""}`}>{topic.title}</span>
        {hasChildren && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
            className="flex-shrink-0 p-0.5 hover:bg-white/10 rounded transition-colors"
          >
            {open ? <CaretDown className="w-3 h-3" /> : <CaretRight className="w-3 h-3" />}
          </button>
        )}
      </div>
      {hasChildren && open && (
        <div>
          {[...topic.subtopics].sort((a, b) => a.order - b.order).map(sub => (
            <TreeItem key={sub.id} topic={sub} depth={depth + 1} selectedId={selectedId} completedIds={completedIds} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Topic Content Area ───────────────────────────────────────────────────────
function TopicContent({
  topic,
  completedIds,
  onToggleComplete,
}: {
  topic: Topic
  completedIds: Set<string>
  onToggleComplete: (id: string) => void
}) {
  const isCompleted = completedIds.has(topic.id)

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-3">{topic.title}</h1>
          {topic.description && <p className="text-white/60 text-lg leading-relaxed">{topic.description}</p>}
        </div>
        <button
          type="button"
          onClick={() => onToggleComplete(topic.id)}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
            isCompleted
              ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/30"
              : "bg-white/[0.04] text-white/50 border-white/[0.08] hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/20"
          }`}
        >
          {isCompleted ? <><CheckCircle className="w-4 h-4" weight="fill" /> Completed</> : <><Circle className="w-4 h-4" /> Mark Complete</>}
        </button>
      </div>

      {/* Notes — supports both legacy string and new block format */}
      {topic.notes && (Array.isArray(topic.notes) ? topic.notes.length > 0 : !!topic.notes) && (
        <div className="bg-primary/[0.06] border border-primary/20 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Notes
          </h3>
          {/* Legacy string notes */}
          {typeof topic.notes === "string" && (
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-white/70 prose-a:text-secondary hover:prose-a:text-secondary/80 prose-strong:text-white prose-code:text-secondary prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10">
              <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                {topic.notes}
              </ReactMarkdown>
            </div>
          )}
          {/* New block-based notes */}
          {Array.isArray(topic.notes) && (
            <div className="space-y-5">
              {(topic.notes as any[]).map((block: any, i: number) => {
                if (block.type === "text") {
                  return (
                    <div key={block.id || i} className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-white/70 prose-a:text-secondary prose-strong:text-white prose-code:text-secondary prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10"
                      dangerouslySetInnerHTML={{ __html: block.data?.html || "" }} />
                  )
                }
                if (block.type === "code") {
                  return (
                    <div key={block.id || i} className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0d1117]">
                      {(block.data?.filename || block.data?.language) && (
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.03]">
                          <span className="text-xs font-mono text-white/40">{block.data.filename || ""}</span>
                          {block.data.language && <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 px-2 py-0.5 bg-white/5 rounded">{block.data.language}</span>}
                        </div>
                      )}
                      <pre className="p-5 overflow-x-auto"><code className="font-mono text-sm text-green-300/90 leading-relaxed whitespace-pre">{block.data?.code}</code></pre>
                    </div>
                  )
                }
                if (block.type === "image") {
                  const images: any[] = block.data?.images || []
                  if (!images.length) return null
                  const alignment = block.data?.alignment || "center"
                  const alignClass = alignment === "left" ? "justify-start" : alignment === "right" ? "justify-end" : "justify-center"
                  const cols = Math.min(images.length, 3)
                  const sizeClass = { small: "max-w-xs", medium: "max-w-xl", large: "max-w-3xl", full: "w-full" }[block.data?.displaySize as string] || "w-full"
                  return (
                    <figure key={block.id || i} className={`${sizeClass} ${alignment === "left" ? "mr-auto" : alignment === "right" ? "ml-auto" : "mx-auto"} my-4`}>
                      <div className={`flex flex-wrap gap-3 ${alignClass}`}>
                        {images.map((img: any, j: number) => (
                          <div key={j} className={`overflow-hidden rounded-2xl border border-white/[0.05] relative ${cols === 1 ? "w-full aspect-video" : cols === 2 ? "flex-1 min-w-[45%] aspect-square" : "flex-1 min-w-[30%] aspect-square"}`}>
                            <img src={img.url} alt={img.caption || ""} className="w-full h-full object-cover" loading="lazy" />
                            {img.caption && <figcaption className="absolute bottom-0 inset-x-0 bg-black/60 text-center text-xs text-white/90 py-2 px-3 backdrop-blur-sm">{img.caption}</figcaption>}
                          </div>
                        ))}
                      </div>
                    </figure>
                  )
                }
                if (block.type === "math") {
                  const latex = block.data?.latex || ""
                  const mathStr = latex.trim().startsWith("$$") ? latex : `$$${latex}$$`
                  return (
                    <div key={block.id || i} className="bg-black/20 border border-white/[0.06] rounded-xl p-4">
                      <div className="prose prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {mathStr}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )
                }
                return null
              })}
            </div>
          )}
        </div>
      )}


      {/* Videos */}
      {topic.videos && topic.videos.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-red-400" /> Video Lectures
            <span className="text-xs font-normal text-white/30 ml-1">({topic.videos.length})</span>
          </h2>
          <div className="space-y-4">
            {topic.videos.map((v: VideoItem) => {
              const videoId = getYouTubeId(v.youtubeUrl)
              return (
                <div key={v.id} className="px-4 md:px-8">
                  <div className="rounded-2xl overflow-hidden border border-white/[0.08]">
                    {v.title && (
                      <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06] flex items-center gap-2">
                        <YoutubeLogo className="w-4 h-4 text-red-400" />
                        <span className="text-white/70 text-sm font-medium">{v.title}</span>
                      </div>
                    )}
                    {videoId ? (
                      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={v.title || "Video"}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          loading="lazy"
                          className="absolute inset-0 w-full h-full border-t border-white/[0.08]"
                        />
                      </div>
                    ) : (
                      <div className="p-4 flex items-center gap-3 bg-red-400/[0.03]">
                        <YoutubeLogo className="w-6 h-6 text-red-400/60" />
                        <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-red-400/80 hover:text-red-400 transition-colors">{v.youtubeUrl}</a>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Problems */}
      {topic.problems && topic.problems.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Exam className="w-5 h-5 text-primary" /> Practice Problems
            <span className="text-xs font-normal text-white/30 ml-1">({topic.problems.length})</span>
          </h2>
          <div className="space-y-2">
            {topic.problems.map((p: Problem) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.04] hover:border-white/15 transition-all group"
              >
                <span className="text-white/80 font-medium text-sm group-hover:text-white transition-colors">{p.title}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${DIFFICULTY_COLORS[p.difficulty]}`}>{p.difficulty}</span>
                  <ArrowSquareOut className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Resources */}
      {topic.resources && topic.resources.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-secondary" /> Resources
            <span className="text-xs font-normal text-white/30 ml-1">({topic.resources.length})</span>
          </h2>
          <div className="space-y-2">
            {topic.resources.map((r: Resource) => {
              const Icon = RESOURCE_ICONS[r.type] || LinkIcon
              return (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.04] hover:border-white/15 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-secondary/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-medium group-hover:text-white transition-colors truncate">{r.title}</p>
                    <p className="text-white/30 text-xs truncate capitalize">{r.type}</p>
                  </div>
                  <ArrowSquareOut className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
                </a>
              )
            })}
          </div>
        </section>
      )}

      {/* Subtopics preview if none selected deeper */}
      {topic.subtopics && topic.subtopics.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-4">Subtopics in this section</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[...topic.subtopics].sort((a, b) => a.order - b.order).map((sub) => (
              <div key={sub.id} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <h4 className="text-white/80 font-semibold text-sm mb-1">{sub.title}</h4>
                {sub.description && <p className="text-white/40 text-xs line-clamp-2">{sub.description}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                  {sub.problems?.length > 0 && <span>{sub.problems.length} problems</span>}
                  {sub.videos?.length > 0 && <span>{sub.videos.length} videos</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ─── Find topic by ID (recursive) ────────────────────────────────────────────
function findTopic(topics: Topic[], id: string): Topic | null {
  for (const t of topics) {
    if (t.id === id) return t
    const found = findTopic(t.subtopics || [], id)
    if (found) return found
  }
  return null
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
  return (
    <div className="px-3 py-3 border-b border-white/[0.06]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Progress</span>
        <span className="text-xs font-bold text-white/50">{completed}/{total}</span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div className="h-full bg-linear-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-white/25 mt-1">{pct}% complete</p>
    </div>
  )
}

// ─── Client Track Page ────────────────────────────────────────────────────────
export default function TrackDetailClient({ track }: { track: any }) {
  const allTopicIds = React.useMemo(() => flattenIds(track.topics || []), [track.topics])
  const STORAGE_KEY = `track-progress-${track.slug}`

  const [completedIds, setCompletedIds] = React.useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set()
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch { return new Set() }
  })
  const [selectedId, setSelectedId] = React.useState<string | null>(() => {
    const sorted = [...(track.topics || [])].sort((a, b) => a.order - b.order)
    return sorted[0]?.id || null
  })

  const toggleComplete = (id: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      return next
    })
  }

  const selectedTopic = selectedId ? findTopic(track.topics || [], selectedId) : null
  const sortedTopics = [...(track.topics || [])].sort((a, b) => a.order - b.order)

  return (
    <SidebarProvider defaultOpen={true}>
      <Navbar />

      <Sidebar className="border-r border-white/[0.06] bg-background">
        <SidebarHeader className="pt-[100px] px-4 pb-4 border-b border-white/[0.06]">
          <Link href="/tracks" className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-xs mb-3 group">
            <CaretLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> All Tracks
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 shrink-0">
              <Image src={track.image} alt={track.title} fill className="rounded-xl object-cover border border-white/10" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm leading-tight">{track.title}</h2>
              {track.isFree && <span className="text-[9px] font-bold uppercase text-green-400">Free Track</span>}
            </div>
          </div>
        </SidebarHeader>

        {/* Progress */}
        <ProgressBar completed={completedIds.size} total={allTopicIds.length} />

        <SidebarContent className="py-3 px-2 space-y-0.5">
          {sortedTopics.map(topic => (
            <TreeItem
              key={topic.id}
              topic={topic}
              selectedId={selectedId}
              completedIds={completedIds}
              onSelect={(id) => setSelectedId(id)}
            />
          ))}
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="flex-1 bg-background relative min-w-0">
        <div className="sticky top-20 z-10 px-6 py-3 border-b border-white/[0.06] bg-background/95 backdrop-blur flex items-center">
           <SidebarTrigger className="text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white w-10 h-10 cursor-pointer" />
           <span className="ml-3 text-sm font-semibold truncate md:hidden">{track.title}</span>
        </div>
        
        <main className="w-full pt-28 pb-20">
          {selectedTopic ? (
            <div className="px-4 md:px-8 w-full">
              <TopicContent topic={selectedTopic} completedIds={completedIds} onToggleComplete={toggleComplete} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center px-6 w-full">
              <div className="w-16 h-16 rounded-2xl overflow-hidden mb-6 border border-white/10 relative">
                <Image src={track.image} alt={track.title} fill className="object-cover" />
              </div>
              <h1 className="text-3xl font-black text-white mb-3">{track.title}</h1>
              <p className="text-white/50 max-w-md mb-6">{track.description}</p>
              {sortedTopics.length === 0 && (
                <p className="text-white/30 text-sm">This track has no topics yet. Check back soon.</p>
              )}
              {sortedTopics.length > 0 && (
                <button onClick={() => setSelectedId(sortedTopics[0].id)} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
                  Start Learning →
                </button>
              )}
            </div>
          )}
        </main>
        
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  )
}
