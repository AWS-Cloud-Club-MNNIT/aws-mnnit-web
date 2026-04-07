"use client"

import * as React from "react"
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Plus, Trash, Image as ImageIcon, PencilSimple, CaretLeft, DotsSixVertical,
  FloppyDisk, CheckCircle, CalendarBlank, Users, Money, Question,
  Images, ListDashes, Star, YoutubeLogo, Link as LinkIcon, Globe
} from "@phosphor-icons/react"

function nanoidSimple() { return Math.random().toString(36).slice(2, 10) }

type SectionType = "overview" | "schedule" | "speakers" | "sponsors" | "faqs" | "gallery"

const SECTION_META: Record<SectionType, { label: string; icon: React.ElementType; color: string }> = {
  overview: { label: "Overview", icon: ListDashes, color: "text-blue-400" },
  schedule: { label: "Schedule", icon: CalendarBlank, color: "text-green-400" },
  speakers: { label: "Speakers", icon: Users, color: "text-purple-400" },
  sponsors: { label: "Sponsors", icon: Money, color: "text-yellow-400" },
  faqs: { label: "FAQs", icon: Question, color: "text-orange-400" },
  gallery: { label: "Gallery", icon: Images, color: "text-pink-400" },
}

// ─── Sortable Section Wrapper ─────────────────────────────────────────────────
function SortableSection({ section, children, onDelete }: { section: any; children: React.ReactNode; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  const meta = SECTION_META[section.type as SectionType]
  const Icon = meta.icon
  return (
    <div ref={setNodeRef} style={style} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
        <button {...attributes} {...listeners} type="button" className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/50 transition-colors">
          <DotsSixVertical className="w-5 h-5" />
        </button>
        <Icon className={`w-4 h-4 ${meta.color}`} />
        <span className="text-white font-semibold text-sm flex-1">{meta.label}</span>
        <button type="button" onClick={onDelete} className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
          <Trash className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// ─── Rich Text (Mini) ─────────────────────────────────────────────────────────
function MiniRTE({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    onUpdate({ editor }) { onChange(editor.getHTML()) },
    immediatelyRender: false,
  })
  if (!editor) return null
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <div className="flex gap-1 p-1.5 border-b border-white/10 bg-white/[0.02]">
        {[["B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold")],
          ["I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic")],
          ["H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 })],
          ["• List", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList")],
        ].map(([label, fn, active]: any) => (
          <button key={label as string} type="button" onClick={() => { fn(); editor.commands.focus() }}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${active ? "bg-primary text-white" : "bg-white/5 hover:bg-white/10 text-white/60"}`}>{label}</button>
        ))}
      </div>
      <EditorContent editor={editor} className="min-h-[100px] max-h-[300px] overflow-y-auto p-3 text-white/70 text-sm prose prose-invert prose-sm max-w-none [&_.ProseMirror]:outline-none" />
    </div>
  )
}

// ─── Section Editors ──────────────────────────────────────────────────────────
function OverviewEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return <MiniRTE value={data.html || ""} onChange={(html) => onChange({ html })} />
}

function ScheduleEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const slots: any[] = data.slots || []
  const add = () => onChange({ slots: [...slots, { id: nanoidSimple(), time: "", title: "", speaker: "", room: "", description: "" }] })
  const update = (id: string, patch: any) => onChange({ slots: slots.map(s => s.id === id ? { ...s, ...patch } : s) })
  const remove = (id: string) => onChange({ slots: slots.filter(s => s.id !== id) })
  return (
    <div className="space-y-3">
      {slots.map(s => (
        <div key={s.id} className="grid grid-cols-[80px_1fr_1fr_1fr_32px] gap-2 items-center">
          <Input value={s.time} onChange={(e) => update(s.id, { time: e.target.value })} placeholder="10:00 AM" className="bg-white/5 border-white/10 text-white text-xs h-8" />
          <Input value={s.title} onChange={(e) => update(s.id, { title: e.target.value })} placeholder="Session title" className="bg-white/5 border-white/10 text-white text-xs h-8" />
          <Input value={s.speaker} onChange={(e) => update(s.id, { speaker: e.target.value })} placeholder="Speaker" className="bg-white/5 border-white/10 text-white/60 text-xs h-8" />
          <Input value={s.room} onChange={(e) => update(s.id, { room: e.target.value })} placeholder="Room/Hall" className="bg-white/5 border-white/10 text-white/50 text-xs h-8" />
          <button type="button" onClick={() => remove(s.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash className="w-3.5 h-3.5" /></button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1.5"><Plus className="w-3 h-3" /> Add Time Slot</button>
    </div>
  )
}

function SpeakersEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const speakers: any[] = data.speakers || []
  const [uploading, setUploading] = React.useState<string | null>(null)
  const add = () => onChange({ speakers: [...speakers, { id: nanoidSimple(), name: "", role: "", photo: "", bio: "", social: {} }] })
  const update = (id: string, patch: any) => onChange({ speakers: speakers.map(s => s.id === id ? { ...s, ...patch } : s) })
  const remove = (id: string) => onChange({ speakers: speakers.filter(s => s.id !== id) })
  const uploadPhoto = async (id: string, file: File) => {
    setUploading(id)
    const fd = new FormData(); fd.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const { url } = await res.json()
      update(id, { photo: url })
    } finally { setUploading(null) }
  }
  return (
    <div className="space-y-4">
      {speakers.map(sp => (
        <div key={sp.id} className="border border-white/[0.06] rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-4">
            <label className="w-16 h-16 rounded-full border border-dashed border-white/10 flex-shrink-0 overflow-hidden cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-center bg-white/[0.02]">
              {sp.photo ? <img src={sp.photo} className="w-full h-full object-cover" alt="" /> : (uploading === sp.id ? <span className="text-[8px] text-white/30">…</span> : <Users className="w-5 h-5 text-white/20" />)}
              <input type="file" hidden accept="image/*" onChange={(e) => e.target.files?.[0] && uploadPhoto(sp.id, e.target.files[0])} />
            </label>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Input value={sp.name} onChange={(e) => update(sp.id, { name: e.target.value })} placeholder="Name" className="bg-white/5 border-white/10 text-white text-sm h-9" />
              <Input value={sp.role} onChange={(e) => update(sp.id, { role: e.target.value })} placeholder="Title / Role" className="bg-white/5 border-white/10 text-white/70 text-sm h-9" />
              <Textarea value={sp.bio} onChange={(e) => update(sp.id, { bio: e.target.value })} placeholder="Short bio…" rows={2} className="col-span-2 bg-white/5 border-white/10 text-white/60 text-xs resize-none" />
            </div>
            <button type="button" onClick={() => remove(sp.id)} className="text-white/20 hover:text-red-400 transition-colors pt-1"><Trash className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["twitter", "linkedin", "github", "website"] as const).map(key => (
              <Input key={key} value={sp.social?.[key] || ""} onChange={(e) => update(sp.id, { social: { ...sp.social, [key]: e.target.value } })} placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} URL`} className="bg-white/5 border-white/10 text-white/50 text-xs h-8" />
            ))}
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1.5"><Plus className="w-3 h-3" /> Add Speaker</button>
    </div>
  )
}

function SponsorsEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const sponsors: any[] = data.sponsors || []
  const [uploading, setUploading] = React.useState<string | null>(null)
  const add = () => onChange({ sponsors: [...sponsors, { id: nanoidSimple(), name: "", logo: "", website: "", tier: "gold" }] })
  const update = (id: string, patch: any) => onChange({ sponsors: sponsors.map(s => s.id === id ? { ...s, ...patch } : s) })
  const remove = (id: string) => onChange({ sponsors: sponsors.filter(s => s.id !== id) })
  const uploadLogo = async (id: string, file: File) => {
    setUploading(id)
    const fd = new FormData(); fd.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const { url } = await res.json()
      update(id, { logo: url })
    } finally { setUploading(null) }
  }
  return (
    <div className="space-y-3">
      {sponsors.map(sp => (
        <div key={sp.id} className="flex items-center gap-3">
          <label className="w-14 h-10 border border-dashed border-white/10 rounded-lg overflow-hidden cursor-pointer hover:bg-white/5 flex items-center justify-center bg-white/[0.02] flex-shrink-0">
            {sp.logo ? <img src={sp.logo} className="w-full h-full object-contain p-1" alt="" /> : (uploading === sp.id ? <span className="text-[8px] text-white/30">…</span> : <ImageIcon className="w-4 h-4 text-white/20" />)}
            <input type="file" hidden accept="image/*" onChange={(e) => e.target.files?.[0] && uploadLogo(sp.id, e.target.files[0])} />
          </label>
          <Input value={sp.name} onChange={(e) => update(sp.id, { name: e.target.value })} placeholder="Sponsor name" className="flex-1 bg-white/5 border-white/10 text-white text-sm h-8" />
          <Input value={sp.website} onChange={(e) => update(sp.id, { website: e.target.value })} placeholder="Website URL" className="flex-1 bg-white/5 border-white/10 text-white/60 text-xs h-8" />
          <select value={sp.tier} onChange={(e) => update(sp.id, { tier: e.target.value })} className="bg-white/5 border border-white/10 text-white/60 text-xs rounded-lg px-2 h-8">
            {["platinum","gold","silver","bronze","community"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <button type="button" onClick={() => remove(sp.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash className="w-3.5 h-3.5" /></button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1.5"><Plus className="w-3 h-3" /> Add Sponsor</button>
    </div>
  )
}

function FAQsEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const faqs: any[] = data.faqs || []
  const add = () => onChange({ faqs: [...faqs, { id: nanoidSimple(), question: "", answer: "" }] })
  const update = (id: string, patch: any) => onChange({ faqs: faqs.map(f => f.id === id ? { ...f, ...patch } : f) })
  const remove = (id: string) => onChange({ faqs: faqs.filter(f => f.id !== id) })
  return (
    <div className="space-y-3">
      {faqs.map(f => (
        <div key={f.id} className="border border-white/[0.06] rounded-xl p-3 space-y-2">
          <div className="flex gap-2">
            <Input value={f.question} onChange={(e) => update(f.id, { question: e.target.value })} placeholder="Question" className="flex-1 bg-white/5 border-white/10 text-white text-sm h-8" />
            <button type="button" onClick={() => remove(f.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash className="w-4 h-4" /></button>
          </div>
          <Textarea value={f.answer} onChange={(e) => update(f.id, { answer: e.target.value })} placeholder="Answer…" rows={2} className="bg-white/5 border-white/10 text-white/60 text-xs resize-none" />
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1.5"><Plus className="w-3 h-3" /> Add FAQ</button>
    </div>
  )
}

function GalleryEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const items: any[] = data.items || []
  const [uploading, setUploading] = React.useState(false)
  const addImage = async (file: File) => {
    setUploading(true)
    const fd = new FormData(); fd.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const { url } = await res.json()
      onChange({ items: [...items, { id: nanoidSimple(), url, type: "image", caption: "" }] })
    } finally { setUploading(false) }
  }
  const addVideo = () => onChange({ items: [...items, { id: nanoidSimple(), url: "", type: "video", caption: "" }] })
  const update = (id: string, patch: any) => onChange({ items: items.map(i => i.id === id ? { ...i, ...patch } : i) })
  const remove = (id: string) => onChange({ items: items.filter(i => i.id !== id) })
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {items.map(item => (
          <div key={item.id} className="border border-white/[0.06] rounded-xl overflow-hidden">
            {item.type === "image" && item.url
              ? <img src={item.url} className="w-full h-20 object-cover" alt="" />
              : <div className="w-full h-20 bg-black/30 flex items-center justify-center"><YoutubeLogo className="w-6 h-6 text-red-400/70" /></div>
            }
            <div className="p-1.5">
              {item.type === "video" && <Input value={item.url} onChange={(e) => update(item.id, { url: e.target.value })} placeholder="YouTube URL" className="w-full bg-transparent border-white/10 text-white/50 text-[10px] h-6 mb-1" />}
              <Input value={item.caption} onChange={(e) => update(item.id, { caption: e.target.value })} placeholder="Caption" className="w-full bg-transparent border-white/10 text-white/40 text-[10px] h-6" />
              <button type="button" onClick={() => remove(item.id)} className="text-[9px] text-red-400/60 hover:text-red-400 mt-0.5">Remove</button>
            </div>
          </div>
        ))}
        <label className={`border border-dashed border-white/10 rounded-xl h-24 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors text-white/30 ${uploading ? "animate-pulse" : ""}`}>
          <span className="text-xs">{uploading ? "Uploading…" : "+ Image"}</span>
          <input type="file" accept="image/*" hidden multiple onChange={(e) => { Array.from(e.target.files || []).forEach(f => addImage(f)) }} />
        </label>
      </div>
      <button type="button" onClick={addVideo} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1.5"><YoutubeLogo className="w-3.5 h-3.5" /> Add YouTube Video</button>
    </div>
  )
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event, onEdit, onDelete }: { event: any; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden group">
      <div className="h-32 relative overflow-hidden">
        <img src={event.banner} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-2 right-2 flex gap-1.5">
          {event.featured && <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-full flex items-center gap-1"><Star className="w-2.5 h-2.5" /> Featured</span>}
          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${event.status === "published" ? "bg-green-500/20 text-green-400 border border-green-500/20" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20"}`}>
            {event.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">{event.title}</h3>
        <p className="text-white/30 text-xs mb-1">{new Date(event.date).toLocaleDateString()}</p>
        <p className="text-white/20 text-xs mb-3">{event.sections?.length || 0} sections</p>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={onEdit} className="flex-1 bg-white/5 hover:bg-white/10 text-white border-0 text-xs h-8">
            <PencilSimple className="w-3 h-3 mr-1.5" /> Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete} className="px-2 h-8">
            <Trash className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminEvents() {
  const [events, setEvents] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editingEvent, setEditingEvent] = React.useState<any | null>(null)
  const [isNew, setIsNew] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)

  // Meta
  const [title, setTitle] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [banner, setBanner] = React.useState("")
  const [date, setDate] = React.useState("")
  const [location, setLocation] = React.useState("MNNIT Allahabad")
  const [tags, setTags] = React.useState("")
  const [status, setStatus] = React.useState<"draft" | "published">("draft")
  const [registrationStatus, setRegistrationStatus] = React.useState<"open" | "closed" | "coming_soon">("coming_soon")
  const [featured, setFeatured] = React.useState(false)
  const [sections, setSections] = React.useState<any[]>([])
  const [regLinks, setRegLinks] = React.useState<any[]>([])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  React.useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async () => {
    setLoading(true)
    const res = await fetch("/api/event")
    const data = await res.json()
    if (Array.isArray(data)) setEvents(data)
    setLoading(false)
  }

  const openNew = () => {
    setEditingEvent(null); setIsNew(true)
    setTitle(""); setSlug(""); setBanner(""); setDate(""); setLocation("MNNIT Allahabad")
    setTags(""); setStatus("draft"); setRegistrationStatus("coming_soon"); setFeatured(false)
    setSections([]); setRegLinks([])
  }

  const openEdit = (event: any) => {
    setEditingEvent(event); setIsNew(false)
    setTitle(event.title); setSlug(event.slug); setBanner(event.banner)
    setDate(event.date ? new Date(event.date).toISOString().slice(0, 16) : "")
    setLocation(event.location || "MNNIT Allahabad")
    setTags((event.tags || []).join(", ")); setStatus(event.status || "draft")
    setRegistrationStatus(event.registrationStatus || "coming_soon"); setFeatured(event.featured || false)
    setSections(event.sections || []); setRegLinks(event.registrationLinks || [])
  }

  const closeEditor = () => { setEditingEvent(null); setIsNew(false) }

  const uploadBanner = async (file: File) => {
    setUploading(true)
    const fd = new FormData(); fd.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const { url } = await res.json()
      setBanner(url)
    } finally { setUploading(false) }
  }

  const addSection = (type: SectionType) => {
    const defaultData: Record<SectionType, any> = {
      overview: { html: "" },
      schedule: { slots: [] },
      speakers: { speakers: [] },
      sponsors: { sponsors: [] },
      faqs: { faqs: [] },
      gallery: { items: [] },
    }
    setSections(prev => [...prev, { id: nanoidSimple(), type, order: prev.length, data: defaultData[type] }])
  }

  const updateSection = (id: string, data: any) => setSections(prev => prev.map(s => s.id === id ? { ...s, data } : s))
  const removeSection = (id: string) => setSections(prev => prev.filter(s => s.id !== id))
  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIdx = sections.findIndex(s => s.id === active.id)
      const newIdx = sections.findIndex(s => s.id === over.id)
      setSections(arrayMove(sections, oldIdx, newIdx).map((s, i) => ({ ...s, order: i })))
    }
  }

  const addRegLink = () => setRegLinks(prev => [...prev, { id: nanoidSimple(), label: "", url: "" }])
  const updateRegLink = (id: string, patch: any) => setRegLinks(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l))
  const removeRegLink = (id: string) => setRegLinks(prev => prev.filter(l => l.id !== id))

  const handleSave = async (saveStatus?: "draft" | "published") => {
    if (!title || !slug || !banner || !date) { alert("Title, slug, banner, and date are required."); return }
    setSaving(true)
    const payload = {
      title, slug, banner, date: new Date(date), location,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      status: saveStatus || status, registrationStatus, featured,
      sections: sections.map((s, i) => ({ ...s, order: i })),
      registrationLinks: regLinks,
    }
    const id = editingEvent?._id
    const res = await fetch(id ? `/api/event/${id}` : "/api/event", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    setSaving(false)
    if (res.ok) { fetchEvents(); closeEditor() }
    else alert("Failed to save. Check if slug is unique.")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return
    await fetch(`/api/event/${id}`, { method: "DELETE" })
    fetchEvents()
  }

  const isEditing = editingEvent !== null || isNew

  // ── Editor ──
  if (isEditing) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button type="button" onClick={closeEditor} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
          <CaretLeft className="w-4 h-4" /> Back to events
        </button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave("draft")} disabled={saving} className="border-white/10 text-white/70 hover:text-white h-9 text-sm">
            <FloppyDisk className="w-4 h-4 mr-2" /> Save Draft
          </Button>
          <Button onClick={() => handleSave("published")} disabled={saving} className="bg-primary hover:bg-primary/90 text-white h-9 text-sm">
            <CheckCircle className="w-4 h-4 mr-2" /> {saving ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Meta / Settings */}
        <div className="space-y-4">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/30">Event Settings</h2>
            <Input value={title} onChange={(e) => { setTitle(e.target.value); if (isNew) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")) }} placeholder="Event Title *" className="bg-white/5 border-white/10 text-white" />
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-slug *" className="bg-white/5 border-white/10 text-white font-mono text-sm" />
            <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white/5 border-white/10 text-white text-sm" />
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="bg-white/5 border-white/10 text-white/70 text-sm" />
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" className="bg-white/5 border-white/10 text-white/70 text-sm" />

            <div className="space-y-2 pt-1">
              <div>
                <Label className="text-white/40 text-xs mb-1 block">Status</Label>
                <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full bg-white/5 border border-white/10 text-white/70 rounded-lg px-3 py-2 text-sm">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <Label className="text-white/40 text-xs mb-1 block">Registration Status</Label>
                <select value={registrationStatus} onChange={(e) => setRegistrationStatus(e.target.value as any)} className="w-full bg-white/5 border border-white/10 text-white/70 rounded-lg px-3 py-2 text-sm">
                  <option value="coming_soon">Coming Soon</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer p-2 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-primary w-4 h-4" />
                <span className="text-white/60 text-sm flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-yellow-400" /> Featured event</span>
              </label>
            </div>

            <div>
              <Label className="text-white/40 text-xs mb-2 block">Banner Image *</Label>
              <label className="block w-full h-32 border border-dashed border-white/10 rounded-xl overflow-hidden cursor-pointer hover:bg-white/5 transition-colors">
                {banner
                  ? <img src={banner} className="w-full h-full object-cover" alt="Banner" />
                  : <div className="flex flex-col items-center justify-center h-full gap-2 text-white/30"><ImageIcon className="w-7 h-7" /><span className="text-xs">{uploading ? "Uploading…" : "Upload banner"}</span></div>
                }
                <input type="file" hidden accept="image/*" onChange={(e) => e.target.files?.[0] && uploadBanner(e.target.files[0])} />
              </label>
            </div>
          </div>

          {/* Registration Links */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/30 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Registration Links</h2>
            {regLinks.map(link => (
              <div key={link.id} className="flex gap-2 items-center">
                <Input value={link.label} onChange={(e) => updateRegLink(link.id, { label: e.target.value })} placeholder="Label (e.g. Register on Unstop)" className="w-32 bg-white/5 border-white/10 text-white text-xs h-8" />
                <Input value={link.url} onChange={(e) => updateRegLink(link.id, { url: e.target.value })} placeholder="https://…" className="flex-1 bg-white/5 border-white/10 text-white/60 text-xs h-8" />
                <button type="button" onClick={() => removeRegLink(link.id)} className="text-white/20 hover:text-red-400"><Trash className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            <button type="button" onClick={addRegLink} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1.5"><Plus className="w-3 h-3" /> Add link</button>
          </div>
        </div>

        {/* Sections Builder */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-white font-semibold">Content Sections</h2>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(SECTION_META) as SectionType[]).map(type => {
                const meta = SECTION_META[type]
                const Icon = meta.icon
                return (
                  <button key={type} type="button" onClick={() => addSection(type)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-white/60 hover:text-white transition-all">
                    <Icon className={`w-3.5 h-3.5 ${meta.color}`} /> {meta.label}
                  </button>
                )
              })}
            </div>
          </div>

          {sections.length === 0 ? (
            <div className="border border-dashed border-white/[0.06] rounded-2xl p-10 text-center text-white/30">
              <CalendarBlank className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No sections yet. Use the buttons above to add Overview, Schedule, Speakers, and more.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
              <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {sections.map(section => (
                    <SortableSection key={section.id} section={section} onDelete={() => removeSection(section.id)}>
                      {section.type === "overview" && <OverviewEditor data={section.data} onChange={(d) => updateSection(section.id, d)} />}
                      {section.type === "schedule" && <ScheduleEditor data={section.data} onChange={(d) => updateSection(section.id, d)} />}
                      {section.type === "speakers" && <SpeakersEditor data={section.data} onChange={(d) => updateSection(section.id, d)} />}
                      {section.type === "sponsors" && <SponsorsEditor data={section.data} onChange={(d) => updateSection(section.id, d)} />}
                      {section.type === "faqs" && <FAQsEditor data={section.data} onChange={(d) => updateSection(section.id, d)} />}
                      {section.type === "gallery" && <GalleryEditor data={section.data} onChange={(d) => updateSection(section.id, d)} />}
                    </SortableSection>
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Event Management</h1>
          <p className="text-white/50 mt-1">Create and manage community events with dynamic sections.</p>
        </div>
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6">
          <Plus className="w-5 h-5 mr-2" /> New Event
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-3xl">
          <CalendarBlank className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 mb-4">No events yet</p>
          <Button onClick={openNew} variant="outline" className="border-white/10 text-white/60 hover:text-white">Create your first event</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {events.map(event => (
            <EventCard key={event._id} event={event} onEdit={() => openEdit(event)} onDelete={() => handleDelete(event._id)} />
          ))}
        </div>
      )}
    </div>
  )
}
