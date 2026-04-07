"use client"

import * as React from "react"
import { Plus, PencilSimple, Trash, Image as ImageIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function AdminTracks() {
  const [tracks, setTracks] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  
  // Form state
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [title, setTitle] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [roadmap, setRoadmap] = React.useState("")
  const [isFree, setIsFree] = React.useState(true)
  
  // Image Upload State
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string>("")
  const [uploadingImage, setUploadingImage] = React.useState(false)

  React.useEffect(() => { fetchTracks() }, [])

  const fetchTracks = async () => {
    try {
      const res = await fetch("/api/track")
      const data = await res.json()
      setTracks(data.tracks)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const resetForm = () => {
    setTitle(""); setSlug(""); setDescription(""); setRoadmap(""); setIsFree(true);
    setImageFile(null); setImagePreview(""); setEditingId(null); setIsFormOpen(false);
  }

  const openEdit = (track: any) => {
    setEditingId(track._id); setTitle(track.title); setSlug(track.slug);
    setDescription(track.description); setRoadmap(track.roadmap); setIsFree(track.isFree);
    setImagePreview(track.image); setImageFile(null); setIsFormOpen(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let imageUrl = imagePreview

    // Process image upload to Cloudinary using /api/upload
    if (imageFile) {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append("file", imageFile)
      
      try {
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
        if (uploadRes.ok) {
          const { url } = await uploadRes.json()
          imageUrl = url
        }
      } catch (err) {
        console.error("Image upload failed", err)
      } finally {
        setUploadingImage(false)
      }
    }

    const payload = { title, slug, description, image: imageUrl, roadmap, isFree }
    
    const url = editingId ? `/api/track/${editingId}` : "/api/track"
    const method = editingId ? "PUT" : "POST"

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    resetForm()
    fetchTracks()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this track?")) return
    await fetch(`/api/track/${id}`, { method: "DELETE" })
    fetchTracks()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.05] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tracks & Roadmaps</h1>
          <p className="text-white/50 mt-1">Manage learning tracks and their curriculum roadmaps.</p>
        </div>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6">
            <Plus className="w-5 h-5 mr-2" /> New Track
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">{editingId ? "Edit Track" : "Create New Track"}</h2>
            <Button variant="ghost" className="text-white/50" onClick={resetForm}>Cancel</Button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input required value={title} onChange={e => {
                  setTitle(e.target.value); 
                  if(!editingId) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }} placeholder="Track Title" className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
                <Input required value={slug} onChange={e => setSlug(e.target.value)} placeholder="URL Slug (e.g. web-dev)" className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
                <Textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description..." className="w-full h-24 bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none resize-none" />
                <Label className="flex items-center gap-3 text-white cursor-pointer bg-background border border-white/10 px-4 py-3 rounded-xl">
                  <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} className="w-5 h-5 accent-primary" />
                  <span className="font-medium">Free Track (Available to all)</span>
                </Label>
              </div>

              <div className="space-y-4">
                <div className="h-40 w-full bg-background border border-white/10 border-dashed rounded-xl flex items-center justify-center relative overflow-hidden group">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-white/50 flex flex-col items-center">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-sm">Upload Track Icon/Banner</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" required={!editingId && !imagePreview} />
                </div>
                
                <Textarea required value={roadmap} onChange={e => setRoadmap(e.target.value)} placeholder="Markdown Roadmap (Use headings, bullets, code)..." className="w-full h-[calc(100%-11rem)] bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none font-mono text-sm leading-relaxed" />
              </div>
            </div>

            <Button disabled={uploadingImage} type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 font-bold text-lg">
              {uploadingImage ? "Uploading Image..." : "Save Track"}
            </Button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : tracks.length === 0 ? (
        <div className="text-center py-20 text-white/50">No tracks found. Create one above!</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map(track => (
            <div key={track._id} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden group">
              <div className="aspect-video relative overflow-hidden bg-black/50">
                <img src={track.image} alt={track.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                {track.isFree && <span className="absolute top-4 right-4 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">Free</span>}
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-white mb-2">{track.title}</h3>
                <p className="text-sm text-white/60 mb-6 line-clamp-2">{track.description}</p>
                
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => openEdit(track)} className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 text-white border-0">
                    <PencilSimple className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(track._id)} className="px-4 rounded-xl">
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
