"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash, Image as ImageIcon } from "@phosphor-icons/react"

export default function AdminBlogs() {
  const [blogs, setBlogs] = React.useState<any[]>([])
  const [isCreating, setIsCreating] = React.useState(false)
  const [formData, setFormData] = React.useState({
    title: "", slug: "", content: "", tags: "", thumbnail: ""
  })
  const [uploading, setUploading] = React.useState(false)

  React.useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    const res = await fetch("/api/blog")
    const data = await res.json()
    if (Array.isArray(data)) setBlogs(data)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    setUploading(true)
    const file = e.target.files[0]
    const body = new FormData()
    body.append("file", file)

    try {
      const res = await fetch("/api/upload", { method: "POST", body })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      setFormData(prev => ({ ...prev, thumbnail: data.url }))
    } catch (error) {
      alert("Image upload failed.")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      }
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error("Creation failed")
      setIsCreating(false)
      fetchBlogs()
      setFormData({ title: "", slug: "", content: "", tags: "", thumbnail: "" })
    } catch (error) {
      alert("Failed to create blog. Ensure slug is unique.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    await fetch(`/api/blog/${id}`, { method: "DELETE" })
    fetchBlogs()
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Blog Management</h1>
          <p className="text-white/50">Write technical articles and tutorials.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="bg-primary hover:bg-primary/90 text-white">
          <Plus weight="bold" className="mr-2" /> {isCreating ? "Cancel" : "New Post"}
        </Button>
      </div>

      {isCreating && (
        <Card className="bg-card/40 border-white/[0.05] p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="Post Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
              <input required placeholder="URL Slug (my-first-post)" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
            </div>
            
            <textarea required rows={10} placeholder="Markdown Content..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white font-mono text-sm leading-relaxed" />
            
            <div className="grid grid-cols-1 gap-4">
              <input placeholder="Tags (comma separated)" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 cursor-pointer text-white/80 transition-colors">
                <ImageIcon /> {uploading ? "Uploading..." : "Upload Thumbnail"}
                <input type="file" hidden accept="image/*" onChange={handleUpload} disabled={uploading} />
              </label>
              {formData.thumbnail && <img src={formData.thumbnail} alt="Preview" className="h-12 w-auto rounded border border-white/10" />}
            </div>
            <Button type="submit" className="bg-secondary text-black hover:bg-secondary/90 font-bold mt-2">Publish Post</Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Card key={blog._id} className="bg-card/20 border-white/[0.05] overflow-hidden group flex flex-col">
            <div className="h-32 w-full relative">
              <img src={blog.thumbnail} className="w-full h-full object-cover" alt="Banner" />
              <div className="absolute top-2 right-2 flex gap-2">
                <button onClick={() => handleDelete(blog._id)} className="p-2 bg-black/50 hover:bg-destructive/80 text-white rounded-lg backdrop-blur-md transition-colors">
                  <Trash weight="duotone" />
                </button>
              </div>
            </div>
            <CardContent className="p-4 flex flex-col flex-1">
              <h3 className="font-bold text-white text-lg mb-1 line-clamp-2">{blog.title}</h3>
              <p className="text-white/40 text-xs font-mono mb-4">/{blog.slug}</p>
              <div className="flex gap-2 flex-wrap mt-auto">
                {blog.tags.map((t: string) => <span key={t} className="text-[10px] uppercase font-bold px-2 py-1 bg-white/5 rounded text-white/60">{t}</span>)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
