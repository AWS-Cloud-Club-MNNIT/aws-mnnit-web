"use client"

import * as React from "react"
import Image from "next/image"
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Plus, Trash, Image as ImageIcon, PencilSimple, CaretDown, CaretRight,
  YoutubeLogo, Link as LinkIcon, Exam, DotsSixVertical, FloppyDisk,
  CheckCircle, CaretLeft, MapTrifold, ArrowSquareOut, Video
} from "@phosphor-icons/react"

function nanoidSimple() { return Math.random().toString(36).slice(2, 10) }

// ─── Types ───────────────────────────────────────────────────────────────────
interface Problem { id: string; title: string; url: string; difficulty: "easy" | "medium" | "hard" }
interface VideoItem { id: string; title: string; youtubeUrl: string }
interface Resource { id: string; title: string; url: string; type: "article" | "doc" | "github" | "other" }
interface Topic {
  id: string; title: string; description: string; notes: string; order: number;
  problems: Problem[]; videos: VideoItem[]; resources: Resource[]; subtopics: Topic[]
}

function emptyTopic(order = 0): Topic {
  return { id: nanoidSimple(), title: "", description: "", notes: "", order, problems: [], videos: [], resources: [], subtopics: [] }
}

// ─── Sortable Topic Row Wrapper ───────────────────────────────────────────────
function SortableTopicItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  return (
    <div ref={setNodeRef} style={style}>
      <div className="absolute left-0 top-0 bottom-0 w-8 flex items-start pt-4 justify-center cursor-grab active:cursor-grabbing text-white/20 hover:text-white/50 transition-colors z-10" {...attributes} {...listeners}>
        <DotsSixVertical className="w-4 h-4" />
      </div>
      {children}
    </div>
  )
}

// ─── Topic Node Editor (Recursive) ───────────────────────────────────────────
function TopicNode({
  topic, depth = 0, onChange, onDelete, onAddSibling,
}: {
  topic: Topic; depth?: number; onChange: (t: Topic) => void; onDelete: () => void; onAddSibling?: () => void
}) {
  const [open, setOpen] = React.useState(depth === 0)
  const [activeTab, setActiveTab] = React.useState<"details" | "content">("details")
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const update = (patch: Partial<Topic>) => onChange({ ...topic, ...patch })

  // Problems
  const addProblem = () => update({ problems: [...topic.problems, { id: nanoidSimple(), title: "", url: "", difficulty: "medium" }] })
  const updateProblem = (id: string, patch: Partial<Problem>) => update({ problems: topic.problems.map(p => p.id === id ? { ...p, ...patch } : p) })
  const deleteProblem = (id: string) => update({ problems: topic.problems.filter(p => p.id !== id) })

  // Videos
  const addVideo = () => update({ videos: [...topic.videos, { id: nanoidSimple(), title: "", youtubeUrl: "" }] })
  const updateVideo = (id: string, patch: Partial<VideoItem>) => update({ videos: topic.videos.map(v => v.id === id ? { ...v, ...patch } : v) })
  const deleteVideo = (id: string) => update({ videos: topic.videos.filter(v => v.id !== id) })

  // Resources
  const addResource = () => update({ resources: [...topic.resources, { id: nanoidSimple(), title: "", url: "", type: "article" }] })
  const updateResource = (id: string, patch: Partial<Resource>) => update({ resources: topic.resources.map(r => r.id === id ? { ...r, ...patch } : r) })
  const deleteResource = (id: string) => update({ resources: topic.resources.filter(r => r.id !== id) })

  // Subtopics
  const addSubtopic = () => update({ subtopics: [...topic.subtopics, emptyTopic(topic.subtopics.length)] })
  const updateSubtopic = (id: string, updated: Topic) => update({ subtopics: topic.subtopics.map(s => s.id === id ? updated : s) })
  const deleteSubtopic = (id: string) => update({ subtopics: topic.subtopics.filter(s => s.id !== id) })
  const handleSubDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIdx = topic.subtopics.findIndex(s => s.id === active.id)
      const newIdx = topic.subtopics.findIndex(s => s.id === over.id)
      const reordered = arrayMove(topic.subtopics, oldIdx, newIdx).map((s, i) => ({ ...s, order: i }))
      update({ subtopics: reordered })
    }
  }

  const indentColor = ["border-primary/40", "border-secondary/40", "border-aws-orange/30", "border-white/10"][Math.min(depth, 3)]

  return (
    <div className={`relative pl-8 ${depth > 0 ? `border-l-2 ${indentColor} ml-4` : ""}`}>
      {/* Topic Header */}
      <div className={`mb-1 ${depth > 0 ? "mt-3" : ""}`}>
        <div className="flex items-center gap-2 group">
          <button type="button" onClick={() => setOpen(o => !o)} className="text-white/50 hover:text-white transition-colors flex-shrink-0">
            {open ? <CaretDown className="w-4 h-4" /> : <CaretRight className="w-4 h-4" />}
          </button>
          <Input
            value={topic.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder={depth === 0 ? "Topic title…" : "Subtopic title…"}
            className={`flex-1 bg-transparent border-white/10 text-white font-semibold h-9 text-sm ${depth === 0 ? "text-base" : ""}`}
          />
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button type="button" onClick={addSubtopic} title="Add subtopic" className="p-1.5 text-white/30 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={onDelete} className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
              <Trash className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Topic Content */}
      {open && (
        <div className="ml-6 space-y-3 mb-4">
          <Textarea
            value={topic.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="Short description of this topic…"
            rows={2}
            className="bg-white/[0.03] border-white/[0.06] text-white/70 text-sm resize-none"
          />

          {/* Tabs */}
          <div className="flex gap-1 border-b border-white/[0.06]">
            {(["details", "content"] as const).map(tab => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                className={`text-xs px-3 py-1.5 -mb-px font-medium transition-colors capitalize ${activeTab === tab ? "border-b-2 border-primary text-primary" : "text-white/40 hover:text-white"}`}>
                {tab === "details" ? "Notes" : "Problems & Videos"}
              </button>
            ))}
          </div>

          {activeTab === "details" && (
            <Textarea
              value={topic.notes}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder="Notes, tips, or extra context for learners…"
              rows={3}
              className="bg-white/[0.03] border-white/[0.06] text-white/60 text-sm resize-none font-mono"
            />
          )}

          {activeTab === "content" && (
            <div className="space-y-4">
              {/* Problems */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-1.5"><Exam className="w-3.5 h-3.5" /> Problems</span>
                  <button type="button" onClick={addProblem} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                </div>
                {topic.problems.map(p => (
                  <div key={p.id} className="flex gap-2 items-center">
                    <Input value={p.title} onChange={(e) => updateProblem(p.id, { title: e.target.value })} placeholder="Problem name" className="flex-1 bg-white/[0.03] border-white/[0.06] text-white text-xs h-8" />
                    <Input value={p.url} onChange={(e) => updateProblem(p.id, { url: e.target.value })} placeholder="https://leetcode.com/…" className="flex-1 bg-white/[0.03] border-white/[0.06] text-white/60 text-xs h-8" />
                    <select value={p.difficulty} onChange={(e) => updateProblem(p.id, { difficulty: e.target.value as any })}
                      className="bg-white/5 border border-white/[0.06] text-xs rounded-lg px-2 h-8 text-white/60">
                      <option value="easy">Easy</option>
                      <option value="medium">Med</option>
                      <option value="hard">Hard</option>
                    </select>
                    <button type="button" onClick={() => deleteProblem(p.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>

              {/* Videos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> YouTube Videos</span>
                  <button type="button" onClick={addVideo} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                </div>
                {topic.videos.map(v => (
                  <div key={v.id} className="flex gap-2 items-center">
                    <Input value={v.title} onChange={(e) => updateVideo(v.id, { title: e.target.value })} placeholder="Video title" className="w-36 bg-white/[0.03] border-white/[0.06] text-white text-xs h-8" />
                    <Input value={v.youtubeUrl} onChange={(e) => updateVideo(v.id, { youtubeUrl: e.target.value })} placeholder="https://youtube.com/watch?v=…" className="flex-1 bg-white/[0.03] border-white/[0.06] text-white/60 text-xs h-8" />
                    <button type="button" onClick={() => deleteVideo(v.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>

              {/* Resources */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> Resources</span>
                  <button type="button" onClick={addResource} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                </div>
                {topic.resources.map(r => (
                  <div key={r.id} className="flex gap-2 items-center">
                    <Input value={r.title} onChange={(e) => updateResource(r.id, { title: e.target.value })} placeholder="Resource name" className="w-36 bg-white/[0.03] border-white/[0.06] text-white text-xs h-8" />
                    <Input value={r.url} onChange={(e) => updateResource(r.id, { url: e.target.value })} placeholder="https://…" className="flex-1 bg-white/[0.03] border-white/[0.06] text-white/60 text-xs h-8" />
                    <select value={r.type} onChange={(e) => updateResource(r.id, { type: e.target.value as any })}
                      className="bg-white/5 border border-white/[0.06] text-xs rounded-lg px-2 h-8 text-white/60">
                      <option value="article">Article</option>
                      <option value="doc">Docs</option>
                      <option value="github">GitHub</option>
                      <option value="other">Other</option>
                    </select>
                    <button type="button" onClick={() => deleteResource(r.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtopics */}
          {topic.subtopics.length > 0 && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSubDragEnd}>
              <SortableContext items={topic.subtopics.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {topic.subtopics.map(sub => (
                  <SortableTopicItem key={sub.id} id={sub.id}>
                    <TopicNode
                      topic={sub}
                      depth={depth + 1}
                      onChange={(updated) => updateSubtopic(sub.id, updated)}
                      onDelete={() => deleteSubtopic(sub.id)}
                    />
                  </SortableTopicItem>
                ))}
              </SortableContext>
            </DndContext>
          )}

          {depth < 3 && (
            <button type="button" onClick={addSubtopic}
              className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors ml-2">
              <Plus className="w-3 h-3" /> Add subtopic
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Track Card ───────────────────────────────────────────────────────────────
function TrackCard({ track, onEdit, onDelete }: { track: any; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden group">
      <div className="aspect-video relative overflow-hidden bg-black/50">
        <Image src={track.image} fill className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" alt={track.title} />
        {track.isFree && <span className="absolute top-3 right-3 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Free</span>}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-white mb-1">{track.title}</h3>
        <p className="text-xs text-white/50 mb-2 line-clamp-2">{track.description}</p>
        <p className="text-xs text-white/25 font-mono mb-4">{track.topics?.length || 0} topics</p>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={onEdit} className="flex-1 bg-white/5 hover:bg-white/10 text-white border-0 text-xs">
            <PencilSimple className="w-3.5 h-3.5 mr-1.5" /> Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete} className="px-3">
            <Trash className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminTracks() {
  const [tracks, setTracks] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editingTrack, setEditingTrack] = React.useState<any | null>(null)
  const [isNew, setIsNew] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [uploadingImage, setUploadingImage] = React.useState(false)

  // Track meta form
  const [title, setTitle] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [image, setImage] = React.useState("")
  const [isFree, setIsFree] = React.useState(true)
  const [topics, setTopics] = React.useState<Topic[]>([])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  React.useEffect(() => { fetchTracks() }, [])

  const fetchTracks = async () => {
    setLoading(true)
    const res = await fetch("/api/track")
    const data = await res.json()
    if (data.tracks) setTracks(data.tracks)
    setLoading(false)
  }

  const openNew = () => {
    setEditingTrack(null); setIsNew(true)
    setTitle(""); setSlug(""); setDescription(""); setImage(""); setIsFree(true); setTopics([])
  }

  const openEdit = (track: any) => {
    setEditingTrack(track); setIsNew(false)
    setTitle(track.title); setSlug(track.slug); setDescription(track.description)
    setImage(track.image); setIsFree(track.isFree); setTopics(track.topics || [])
  }

  const closeEditor = () => { setEditingTrack(null); setIsNew(false) }

  const uploadImage = async (file: File) => {
    setUploadingImage(true)
    const fd = new FormData(); fd.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const { url } = await res.json()
      setImage(url)
    } finally { setUploadingImage(false) }
  }

  const addTopic = () => setTopics(prev => [...prev, emptyTopic(prev.length)])
  const updateTopic = (id: string, updated: Topic) => setTopics(prev => prev.map(t => t.id === id ? updated : t))
  const deleteTopic = (id: string) => setTopics(prev => prev.filter(t => t.id !== id))
  const handleTopicDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIdx = topics.findIndex(t => t.id === active.id)
      const newIdx = topics.findIndex(t => t.id === over.id)
      setTopics(arrayMove(topics, oldIdx, newIdx).map((t, i) => ({ ...t, order: i })))
    }
  }

  const handleSave = async () => {
    if (!title || !slug || !image || !description) {
      alert("Title, slug, description, and image are required.")
      return
    }

    // Basic topic validation
    const validateTopics = (tList: Topic[]): string | null => {
      for (const t of tList) {
        if (!t.title) return `Topic "${t.title || 'Untitled'}" is missing a title`
        if (t.subtopics.length > 0) {
          const subErr = validateTopics(t.subtopics)
          if (subErr) return subErr
        }
      }
      return null
    }

    const topicError = validateTopics(topics)
    if (topicError) {
      alert(topicError)
      return
    }

    setSaving(true)
    const payload = { title, slug, description, image, isFree, topics: topics.map((t, i) => ({ ...t, order: i })) }
    const id = editingTrack?._id

    try {
      const res = await fetch(id ? `/api/track/${id}` : "/api/track", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (res.ok) {
        fetchTracks()
        closeEditor()
      } else {
        alert(data.error || "Failed to save track. Please check if the slug is unique.")
      }
    } catch (err) {
      alert("An error occurred while saving. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this track?")) return
    await fetch(`/api/track/${id}`, { method: "DELETE" })
    fetchTracks()
  }

  const isEditing = editingTrack !== null || isNew

  // ── Editor ──
  if (isEditing) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button type="button" onClick={closeEditor} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
          <CaretLeft className="w-4 h-4" /> Back to tracks
        </button>
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white h-10 px-6">
          <FloppyDisk className="w-4 h-4 mr-2" /> {saving ? "Saving…" : "Save Track"}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Meta Column */}
        <div className="space-y-4">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/30">Track Settings</h2>
            <Input value={title} onChange={(e) => { setTitle(e.target.value); if (isNew) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")) }} placeholder="Track Title *" className="bg-white/5 border-white/10 text-white" />
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-slug *" className="bg-white/5 border-white/10 text-white font-mono text-sm" />
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description…" rows={3} className="bg-white/5 border-white/10 text-white/70 text-sm resize-none" />

            <label className="flex items-center gap-3 cursor-pointer p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="w-4 h-4 accent-primary" />
              <span className="text-white/70 text-sm">Free track (public access)</span>
            </label>

            <div>
              <Label className="text-white/40 text-xs mb-2 block">Cover Image *</Label>
              <label className="block w-full h-36 border border-dashed border-white/10 rounded-xl overflow-hidden cursor-pointer hover:bg-white/5 transition-colors">
                {image
                  ? <Image src={image} fill className="object-cover" alt="" />
                  : <div className="flex flex-col items-center justify-center h-full gap-2 text-white/30"><ImageIcon className="w-7 h-7" /><span className="text-xs">{uploadingImage ? "Uploading…" : "Upload image"}</span></div>
                }
                <input type="file" hidden accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
              </label>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
            <p className="text-xs text-white/30 mb-2 font-medium">{topics.length} root topics · {topics.reduce((a, t) => a + (t.subtopics?.length || 0), 0)} subtopics</p>
            <p className="text-xs text-white/20">Drag topics to reorder. Click <strong className="text-white/40">+ Add subtopic</strong> inside any topic.</p>
          </div>
        </div>

        {/* Topic Tree Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Learning Path / Topics</h2>
            <button type="button" onClick={addTopic} className="flex items-center gap-2 text-sm bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> Add Topic
            </button>
          </div>

          {topics.length === 0 ? (
            <div className="border border-dashed border-white/[0.06] rounded-2xl p-10 text-center text-white/30">
              <MapTrifold className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No topics yet. Click "Add Topic" to start building the learning path.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTopicDragEnd}>
              <SortableContext items={topics.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {topics.map(topic => (
                    <SortableTopicItem key={topic.id} id={topic.id}>
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 pl-10">
                        <TopicNode
                          topic={topic}
                          depth={0}
                          onChange={(updated) => updateTopic(topic.id, updated)}
                          onDelete={() => deleteTopic(topic.id)}
                        />
                      </div>
                    </SortableTopicItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  )

  // ── List ──
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tracks & Roadmaps</h1>
          <p className="text-white/50 mt-1">Manage learning tracks and hierarchical topic trees.</p>
        </div>
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6">
          <Plus className="w-5 h-5 mr-2" /> New Track
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : tracks.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-3xl">
          <MapTrifold className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 mb-4">No tracks yet</p>
          <Button onClick={openNew} variant="outline" className="border-white/10 text-white/60 hover:text-white">Create your first track</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tracks.map(track => (
            <TrackCard key={track._id} track={track} onEdit={() => openEdit(track)} onDelete={() => handleDelete(track._id)} />
          ))}
        </div>
      )}
    </div>
  )
}
