"use client"

import * as React from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TipTapLink from "@tiptap/extension-link"
import TipTapImage from "@tiptap/extension-image"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { createLowlight } from "lowlight"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Plus, Trash, Image as ImageIcon, TextT, Code, YoutubeLogo,
  Link as LinkIcon, ArrowsOutCardinal, PencilSimple, Eye,
  FloppyDisk, CheckCircle, X, CaretLeft, DotsSixVertical,
  Columns, BookOpen, MathOperations
} from "@phosphor-icons/react"

const lowlight = createLowlight()

// ─── Types ──────────────────────────────────────────────────────────────────
type BlockType = "text" | "image" | "mixed" | "code" | "embed" | "math"
interface ContentBlock { id: string; type: BlockType; order: number; data: any }

function nanoidSimple() { return Math.random().toString(36).slice(2, 10) }

// ─── Rich Text (TipTap) Editor ──────────────────────────────────────────────
function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      TipTapLink.configure({ openOnClick: false }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: value || "",
    onUpdate({ editor }) { onChange(editor.getHTML()) },
    immediatelyRender: false,
  })

  if (!editor) return null

  const btn = (action: () => boolean, label: string, active?: boolean) => (
    <button
      type="button"
      onClick={() => { action(); editor.commands.focus() }}
      className={`px-2 py-1 text-xs rounded transition-colors ${active ? "bg-primary text-white" : "bg-white/5 hover:bg-white/10 text-white/70"}`}
    >{label}</button>
  )

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b border-white/10 bg-white/[0.02]">
        {btn(() => editor.chain().focus().toggleBold().run(), "B", editor.isActive("bold"))}
        {btn(() => editor.chain().focus().toggleItalic().run(), "I", editor.isActive("italic"))}
        {btn(() => editor.chain().focus().toggleStrike().run(), "S", editor.isActive("strike"))}
        {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), "H2", editor.isActive("heading", { level: 2 }))}
        {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), "H3", editor.isActive("heading", { level: 3 }))}
        {btn(() => editor.chain().focus().toggleBulletList().run(), "• List", editor.isActive("bulletList"))}
        {btn(() => editor.chain().focus().toggleOrderedList().run(), "1. List", editor.isActive("orderedList"))}
        {btn(() => editor.chain().focus().toggleBlockquote().run(), '" Quote', editor.isActive("blockquote"))}
        {btn(() => editor.chain().focus().toggleCodeBlock().run(), "</> Code", editor.isActive("codeBlock"))}
        {btn(() => editor.chain().focus().setHardBreak().run(), "↵ Break")}
      </div>
      <EditorContent
        editor={editor}
        className="min-h-[120px] max-h-[400px] overflow-y-auto p-4 text-white/80 text-sm focus:outline-none prose prose-invert prose-sm max-w-none [&_.ProseMirror]:outline-none"
      />
    </div>
  )
}

// ─── Sortable Block Wrapper ──────────────────────────────────────────────────
function SortableBlock({ block, children, onDelete }: { block: ContentBlock; children: React.ReactNode; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  return (
    <div ref={setNodeRef} style={style} className="group relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 hover:border-white/10 transition-all">
      <div className="flex items-center gap-2 mb-3">
        <button {...attributes} {...listeners} type="button" className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/60 transition-colors p-1">
          <DotsSixVertical className="w-5 h-5" />
        </button>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2 py-0.5 bg-white/5 rounded">{block.type}</span>
        <button type="button" onClick={onDelete} className="ml-auto p-1.5 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
          <Trash className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  )
}

// ─── Block Editors ───────────────────────────────────────────────────────────
function TextBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return <RichTextEditor value={data.html || ""} onChange={(html) => onChange({ html })} />
}

function ImageBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const [uploading, setUploading] = React.useState(false)
  const images: any[] = data.images || []
  const upload = async (file: File) => {
    setUploading(true)
    const fd = new FormData(); fd.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const { url } = await res.json()
      onChange({ ...data, images: [...images, { url, caption: "", alt: "" }] })
    } finally { setUploading(false) }
  }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {images.map((img: any, i: number) => (
          <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
            <img src={img.url} className="w-full h-28 object-cover" alt="" />
            <div className="p-2 space-y-1">
              <Input size={12} placeholder="Caption" value={img.caption} onChange={(e) => { const next = [...images]; next[i] = { ...img, caption: e.target.value }; onChange({ ...data, images: next }) }} className="text-xs bg-transparent border-white/10 text-white/70 h-7" />
              <button type="button" onClick={() => { const next = images.filter((_: any, j: number) => j !== i); onChange({ ...data, images: next }) }} className="text-red-400/70 text-xs hover:text-red-400">Remove</button>
            </div>
          </div>
        ))}
        <label className={`border border-dashed border-white/10 rounded-xl h-28 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors text-white/30 ${uploading ? "animate-pulse" : ""}`}>
          <span className="text-xs">{uploading ? "Uploading…" : "+ Add Image"}</span>
          <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Align:</span>
        {(["left","center","right"] as const).map(a => (
          <button key={a} type="button" onClick={() => onChange({ ...data, alignment: a })} className={`text-xs px-2 py-1 rounded ${data.alignment === a ? "bg-primary text-white" : "bg-white/5 text-white/50"}`}>{a}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Size:</span>
        {([
          { value: "small",  label: "Small (25%)"  },
          { value: "medium", label: "Medium (50%)" },
          { value: "large",  label: "Large (75%)"  },
          { value: "full",   label: "Full Width"   },
        ] as const).map(({ value, label }) => (
          <button key={value} type="button" onClick={() => onChange({ ...data, displaySize: value })}
            className={`text-xs px-2 py-1 rounded ${(data.displaySize ?? "full") === value ? "bg-primary text-white" : "bg-white/5 text-white/50"}`}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function MixedBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const [uploading, setUploading] = React.useState(false)
  const upload = async (file: File) => {
    setUploading(true)
    const fd = new FormData(); fd.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const { url } = await res.json()
      onChange({ ...data, imageUrl: url })
    } finally { setUploading(false) }
  }
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="border border-dashed border-white/10 rounded-xl h-32 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors overflow-hidden">
          {data.imageUrl ? <img src={data.imageUrl} className="w-full h-full object-cover" alt="" /> : <span className="text-xs text-white/30">{uploading ? "Uploading…" : "+ Image"}</span>}
          <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
        <Input placeholder="Image caption (optional)" value={data.imageCaption || ""} onChange={(e) => onChange({ ...data, imageCaption: e.target.value })} className="text-xs bg-white/5 border-white/10 text-white/70 h-7" />
        <div className="flex gap-2">
          {(["left","right"] as const).map(pos => (
            <button key={pos} type="button" onClick={() => onChange({ ...data, imagePosition: pos })} className={`text-xs px-3 py-1 rounded ${data.imagePosition === pos ? "bg-primary text-white" : "bg-white/5 text-white/50"}`}>Image {pos}</button>
          ))}
        </div>
      </div>
      <RichTextEditor value={data.html || ""} onChange={(html) => onChange({ ...data, html })} />
    </div>
  )
}

function CodeBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input placeholder="Language (js, python, ts…)" value={data.language || ""} onChange={(e) => onChange({ ...data, language: e.target.value })} className="bg-white/5 border-white/10 text-white h-8 text-sm w-40" />
        <Input placeholder="Filename (optional)" value={data.filename || ""} onChange={(e) => onChange({ ...data, filename: e.target.value })} className="bg-white/5 border-white/10 text-white h-8 text-sm flex-1" />
      </div>
      <Textarea
        rows={8}
        placeholder="Paste your code here…"
        value={data.code || ""}
        onChange={(e) => onChange({ ...data, code: e.target.value })}
        className="font-mono text-xs bg-black/30 border-white/10 text-green-400 resize-y"
      />
    </div>
  )
}

function EmbedBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const isYt = (url: string) => /youtube\.com|youtu\.be/.test(url)
  return (
    <div className="space-y-2">
      <Input
        placeholder="YouTube URL or any link…"
        value={data.url || ""}
        onChange={(e) => onChange({ ...data, url: e.target.value, type: isYt(e.target.value) ? "youtube" : "link" })}
        className="bg-white/5 border-white/10 text-white"
      />
      <Input placeholder="Title / caption (optional)" value={data.title || ""} onChange={(e) => onChange({ ...data, title: e.target.value })} className="bg-white/5 border-white/10 text-white/70 text-sm" />
      {data.url && isYt(data.url) && (
        <div className="aspect-video bg-black/30 rounded-xl flex items-center justify-center border border-white/10">
          <YoutubeLogo className="w-10 h-10 text-red-500/70" />
          <span className="ml-2 text-white/40 text-xs">YouTube preview on frontend</span>
        </div>
      )}
    </div>
  )
}

function MathBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">LaTeX / KaTeX Formula</div>
      <Textarea
        rows={5}
        placeholder={`Enter LaTeX math:\n\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\n\nFor display math use $$…$$ syntax.\nFor inline math use $…$ syntax.`}
        value={data.latex || ""}
        onChange={(e) => onChange({ latex: e.target.value })}
        className="font-mono text-xs bg-black/30 border-white/10 text-amber-200 resize-y"
      />
      {data.latex && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-2">LaTeX Source (renders on frontend with KaTeX)</p>
          <code className="text-amber-200/80 text-xs font-mono break-all">{data.latex}</code>
        </div>
      )}
      <p className="text-[10px] text-white/25">Use <code className="text-white/40">$$…$$</code> for display math or <code className="text-white/40">$…$</code> for inline math.</p>
    </div>
  )
}

// ─── Blog Card ───────────────────────────────────────────────────────────────
function BlogCard({ blog, onEdit, onDelete }: { blog: any; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden group flex flex-col">
      <div className="h-28 relative overflow-hidden">
        <img src={blog.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span className={`absolute top-2 right-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${blog.status === "published" ? "bg-green-500/20 text-green-400 border border-green-500/20" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20"}`}>
          {blog.status}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">{blog.title}</h3>
        <p className="text-white/30 text-xs font-mono mb-3">/{blog.slug}</p>
        <div className="flex gap-1.5 flex-wrap mb-4">
          {(blog.tags || []).slice(0, 3).map((t: string) => <span key={t} className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-white/5 rounded text-white/40">{t}</span>)}
        </div>
        <div className="flex gap-2 mt-auto">
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

// ─── Block Preview ───────────────────────────────────────────────────────────
function BlockPreview({ block }: { block: ContentBlock }) {
  if (block.type === "text") return <div className="prose prose-sm prose-invert max-w-none text-white/70" dangerouslySetInnerHTML={{ __html: block.data.html || "<em class='text-white/30'>Empty text block</em>" }} />
  if (block.type === "image") return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(block.data.images?.length || 1, 3)}, 1fr)` }}>
      {(block.data.images || []).map((img: any, i: number) => (
        <div key={i}><img src={img.url} className="w-full rounded-lg object-cover h-32" alt={img.alt} />{img.caption && <p className="text-center text-xs text-white/40 mt-1">{img.caption}</p>}</div>
      ))}
    </div>
  )
  if (block.type === "mixed") return (
    <div className={`flex gap-4 ${block.data.imagePosition === "right" ? "flex-row-reverse" : "flex-row"}`}>
      {block.data.imageUrl && <img src={block.data.imageUrl} className="w-1/3 rounded-lg object-cover" alt="" />}
      <div className="flex-1 prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: block.data.html || "" }} />
    </div>
  )
  if (block.type === "code") return (
    <div className="bg-black/40 rounded-lg p-3 border border-white/10">
      {block.data.filename && <div className="text-xs text-white/40 mb-2 font-mono">{block.data.filename}</div>}
      {block.data.language && <div className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-2">{block.data.language}</div>}
      <pre className="font-mono text-xs text-green-400 overflow-x-auto whitespace-pre">{block.data.code}</pre>
    </div>
  )
  if (block.type === "embed") return (
    <div className="bg-black/20 rounded-lg p-3 border border-white/10 flex items-center gap-3">
      <YoutubeLogo className="w-8 h-8 text-red-400" />
      <div><p className="text-white/60 text-sm">{block.data.title || block.data.url}</p><p className="text-white/30 text-xs">{block.data.url}</p></div>
    </div>
  )
  if (block.type === "math") return (
    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3">
      <MathOperations className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      <code className="text-amber-200/80 text-xs font-mono break-all">{block.data.latex || <em className="text-white/30 not-italic">Empty math block</em>}</code>
    </div>
  )
  return null
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminBlogs() {
  const [blogs, setBlogs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editingBlog, setEditingBlog] = React.useState<any | null>(null)
  const [isNew, setIsNew] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [showPreview, setShowPreview] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)

  // Form state
  const [title, setTitle] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [coverImage, setCoverImage] = React.useState("")
  const [tags, setTags] = React.useState("")
  const [status, setStatus] = React.useState<"draft" | "published">("draft")
  const [blocks, setBlocks] = React.useState<ContentBlock[]>([])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  React.useEffect(() => { fetchBlogs() }, [])

  const fetchBlogs = async () => {
    setLoading(true)
    const res = await fetch("/api/blog")
    const data = await res.json()
    if (Array.isArray(data)) setBlogs(data)
    setLoading(false)
  }

  const openNew = () => {
    setEditingBlog(null); setIsNew(true)
    setTitle(""); setSlug(""); setCoverImage(""); setTags(""); setStatus("draft"); setBlocks([])
  }

  const openEdit = (blog: any) => {
    setEditingBlog(blog); setIsNew(false)
    setTitle(blog.title); setSlug(blog.slug); setCoverImage(blog.coverImage)
    setTags((blog.tags || []).join(", ")); setStatus(blog.status || "draft"); setBlocks(blog.blocks || [])
  }

  const closeEditor = () => { setEditingBlog(null); setIsNew(false); setShowPreview(false) }

  const uploadCover = async (file: File) => {
    setUploading(true)
    const fd = new FormData(); fd.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const { url } = await res.json()
      setCoverImage(url)
    } finally { setUploading(false) }
  }

  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: nanoidSimple(), type, order: blocks.length,
      data: type === "text" ? { html: "" }
        : type === "image" ? { images: [], alignment: "center", size: "medium" }
        : type === "mixed" ? { imageUrl: "", html: "", imagePosition: "left", imageCaption: "" }
        : type === "code" ? { code: "", language: "javascript", filename: "" }
        : type === "math" ? { latex: "" }
        : { url: "", type: "link", title: "", caption: "" }
    }
    setBlocks(prev => [...prev, newBlock])
  }

  const updateBlock = (id: string, data: any) =>
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, data } : b))
  const removeBlock = (id: string) => setBlocks(prev => prev.filter(b => b.id !== id))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIdx = blocks.findIndex(b => b.id === active.id)
      const newIdx = blocks.findIndex(b => b.id === over.id)
      const reordered = arrayMove(blocks, oldIdx, newIdx).map((b, i) => ({ ...b, order: i }))
      setBlocks(reordered)
    }
  }

  const handleSave = async (saveStatus?: "draft" | "published") => {
    if (!title || !slug || !coverImage) { alert("Title, slug, and cover image are required."); return }
    setSaving(true)
    const payload = {
      title, slug, coverImage,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      status: saveStatus || status,
      blocks: blocks.map((b, i) => ({ ...b, order: i }))
    }
    const id = editingBlog?._id
    const res = await fetch(id ? `/api/blog/${id}` : "/api/blog", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    setSaving(false)
    if (res.ok) { fetchBlogs(); closeEditor() }
    else alert("Failed to save. Check if slug is unique.")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return
    await fetch(`/api/blog/${id}`, { method: "DELETE" })
    fetchBlogs()
  }

  const isEditing = editingBlog !== null || isNew

  // ── Editor View ──
  if (isEditing) return (
    <div className="flex flex-col gap-0 h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <button type="button" onClick={closeEditor} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
          <CaretLeft className="w-4 h-4" /> Back to posts
        </button>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setShowPreview(p => !p)} className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-colors ${showPreview ? "border-primary text-primary bg-primary/10" : "border-white/10 text-white/50 hover:text-white"}`}>
            <Eye className="w-4 h-4" /> Preview
          </button>
          <Button variant="outline" onClick={() => handleSave("draft")} disabled={saving} className="border-white/10 text-white/70 hover:text-white h-9 text-sm">
            <FloppyDisk className="w-4 h-4 mr-2" /> Save Draft
          </Button>
          <Button onClick={() => handleSave("published")} disabled={saving} className="bg-primary hover:bg-primary/90 text-white h-9 text-sm">
            <CheckCircle className="w-4 h-4 mr-2" /> {saving ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? "grid-cols-2" : "grid-cols-1"}`}>
        {/* Editor Column */}
        <div className="space-y-5 min-w-0">
          {/* Meta */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <h2 className="text-white font-bold text-sm uppercase tracking-widest text-white/40 mb-2">Post Settings</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-white/50 text-xs mb-1 block">Title *</Label>
                <Input value={title} onChange={(e) => { setTitle(e.target.value); if (isNew) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")) }} placeholder="Post title…" className="bg-white/5 border-white/10 text-white" />
              </div>
              <div>
                <Label className="text-white/50 text-xs mb-1 block">Slug *</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-slug" className="bg-white/5 border-white/10 text-white font-mono text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-white/50 text-xs mb-1 block">Tags (comma separated)</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="aws, cloud, tutorial" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-white/50 text-xs mb-2 block">Cover Image *</Label>
              <label className={`relative block w-full h-36 border border-dashed border-white/10 rounded-xl overflow-hidden cursor-pointer hover:bg-white/5 transition-colors group ${uploading ? "animate-pulse" : ""}`}>
                {coverImage
                  ? <img src={coverImage} className="w-full h-full object-cover" alt="Cover" />
                  : <div className="flex flex-col items-center justify-center h-full gap-2 text-white/30"><ImageIcon className="w-8 h-8" /><span className="text-xs">{uploading ? "Uploading…" : "Click to upload cover"}</span></div>
                }
                <input type="file" hidden accept="image/*" onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} />
              </label>
            </div>
          </div>

          {/* Block Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-sm">Content Blocks</h2>
              <span className="text-white/30 text-xs">{blocks.length} block{blocks.length !== 1 ? "s" : ""}</span>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                {blocks.map(block => (
                  <SortableBlock key={block.id} block={block} onDelete={() => removeBlock(block.id)}>
                    {block.type === "text" && <TextBlockEditor data={block.data} onChange={(d) => updateBlock(block.id, d)} />}
                    {block.type === "image" && <ImageBlockEditor data={block.data} onChange={(d) => updateBlock(block.id, d)} />}
                    {block.type === "mixed" && <MixedBlockEditor data={block.data} onChange={(d) => updateBlock(block.id, d)} />}
                    {block.type === "code" && <CodeBlockEditor data={block.data} onChange={(d) => updateBlock(block.id, d)} />}
                    {block.type === "embed" && <EmbedBlockEditor data={block.data} onChange={(d) => updateBlock(block.id, d)} />}
                    {block.type === "math" && <MathBlockEditor data={block.data} onChange={(d) => updateBlock(block.id, d)} />}
                  </SortableBlock>
                ))}
              </SortableContext>
            </DndContext>

            {/* Add Block Buttons */}
            <div className="border border-dashed border-white/[0.06] rounded-2xl p-4">
              <p className="text-white/30 text-xs text-center mb-3">Add a block</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {([
                  { type: "text", icon: TextT, label: "Text" },
                  { type: "image", icon: ImageIcon, label: "Image" },
                  { type: "mixed", icon: Columns, label: "Mixed" },
                  { type: "code", icon: Code, label: "Code" },
                  { type: "embed", icon: YoutubeLogo, label: "Embed" },
                  { type: "math", icon: MathOperations, label: "Math" },
                ] as const).map(({ type, icon: Icon, label }) => (
                  <button key={type} type="button" onClick={() => addBlock(type as BlockType)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-white/60 hover:text-white transition-all text-sm">
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Column */}
        {showPreview && (
          <div className="min-w-0 border border-white/[0.06] rounded-2xl overflow-hidden bg-background">
            <div className="border-b border-white/[0.06] p-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-white/40" />
              <span className="text-white/40 text-xs font-medium">Live Preview</span>
            </div>
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {coverImage && <img src={coverImage} className="w-full h-48 object-cover rounded-xl mb-6" alt="Cover" />}
              <h1 className="text-2xl font-black text-white mb-3">{title || <em className="text-white/30">Post title…</em>}</h1>
              <div className="flex gap-1.5 mb-6 flex-wrap">
                {tags.split(",").filter(Boolean).map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary rounded-full">{t.trim()}</span>)}
              </div>
              <div className="space-y-4">
                {blocks.map(block => <BlockPreview key={block.id} block={block} />)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // ── List View ──
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Blog Management</h1>
          <p className="text-white/50 mt-1">Write and publish technical articles and tutorials.</p>
        </div>
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6">
          <Plus className="w-5 h-5 mr-2" /> New Post
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-3xl">
          <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 mb-4">No blog posts yet</p>
          <Button onClick={openNew} variant="outline" className="border-white/10 text-white/60 hover:text-white">Create your first post</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {blogs.map(blog => (
            <BlogCard key={blog._id} blog={blog} onEdit={() => openEdit(blog)} onDelete={() => handleDelete(blog._id)} />
          ))}
        </div>
      )}
    </div>
  )
}
