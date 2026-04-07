"use client"

import * as React from "react"
import Link from "next/link"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import {
  CaretLeft, CaretDown, CaretRight, CheckCircle, Circle, YoutubeLogo,
  ArrowSquareOut, BookOpen, Video, Link as LinkIcon, Exam, Article,
  GithubLogo, List, X
} from "@phosphor-icons/react"

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
    <div className="max-w-3xl mx-auto space-y-8">
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

      {/* Notes */}
      {topic.notes && (
        <div className="bg-primary/[0.06] border border-primary/20 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Notes
          </h3>
          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{topic.notes}</p>
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
                <div key={v.id} className="rounded-2xl overflow-hidden border border-white/[0.08]">
                  {v.title && (
                    <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06] flex items-center gap-2">
                      <YoutubeLogo className="w-4 h-4 text-red-400" />
                      <span className="text-white/70 text-sm font-medium">{v.title}</span>
                    </div>
                  )}
                  {videoId ? (
                    <div className="relative aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={v.title || "Video"}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="p-4 flex items-center gap-3 bg-red-400/[0.03]">
                      <YoutubeLogo className="w-6 h-6 text-red-400/60" />
                      <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-red-400/80 hover:text-red-400 transition-colors">{v.youtubeUrl}</a>
                    </div>
                  )}
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
        <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
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
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex flex-1 pt-20">
        {/* Mobile Sidebar Toggle */}
        <button
          type="button"
          onClick={() => setSidebarOpen(o => !o)}
          className="fixed bottom-6 right-6 z-50 lg:hidden w-12 h-12 rounded-full bg-primary shadow-xl shadow-primary/30 flex items-center justify-center text-white"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
        </button>

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-background border-r border-white/[0.06] pt-20 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {/* Track Header */}
          <div className="px-4 py-4 border-b border-white/[0.06]">
            <Link href="/tracks" className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-xs mb-3 group">
              <CaretLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> All Tracks
            </Link>
            <div className="flex items-center gap-3">
              <img src={track.image} alt={track.title} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
              <div>
                <h2 className="text-white font-bold text-sm leading-tight">{track.title}</h2>
                {track.isFree && <span className="text-[9px] font-bold uppercase text-green-400">Free Track</span>}
              </div>
            </div>
          </div>

          {/* Progress */}
          <ProgressBar completed={completedIds.size} total={allTopicIds.length} />

          {/* Topic Tree */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
            {sortedTopics.map(topic => (
              <TreeItem
                key={topic.id}
                topic={topic}
                selectedId={selectedId}
                completedIds={completedIds}
                onSelect={(id) => { setSelectedId(id); setSidebarOpen(false) }}
              />
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {selectedTopic ? (
            <div className="px-6 md:px-12 py-10 max-w-4xl mx-auto">
              <TopicContent topic={selectedTopic} completedIds={completedIds} onToggleComplete={toggleComplete} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-24 text-center px-6">
              <div className="w-16 h-16 rounded-2xl overflow-hidden mb-6 border border-white/10">
                <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
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
      </div>

      <Footer />
    </div>
  )
}
