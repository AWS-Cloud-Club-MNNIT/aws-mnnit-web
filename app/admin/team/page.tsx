"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash, Image as ImageIcon, PencilSimple, X } from "@phosphor-icons/react"
import Cropper from "react-easy-crop"
import { getCroppedImg } from "@/lib/cropImage"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminTeam() {
  const [members, setMembers] = React.useState<any[]>([])
  const [isCreating, setIsCreating] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({
    name: "", role: "", github: "", linkedin: "", twitter: "", instagram: "", image: "", category: "", priority: 1, specialNote: ""
  })
  const [uploading, setUploading] = React.useState(false)

  // Cropper states
  const [imageSrc, setImageSrc] = React.useState<string | null>(null)
  const [crop, setCrop] = React.useState({ x: 0, y: 0 })
  const [zoom, setZoom] = React.useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<any>(null)

  React.useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    const res = await fetch("/api/team")
    const data = await res.json()
    if (Array.isArray(data)) setMembers(data)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const imageDataUrl = URL.createObjectURL(file)
      setImageSrc(imageDataUrl)
    }
  }

  const onCropComplete = React.useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleUploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    setUploading(true)
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels)
      if (!croppedFile) throw new Error("Could not crop image")

      const body = new FormData()
      body.append("file", croppedFile)

      const res = await fetch("/api/upload", { method: "POST", body })
      if (!res.ok) throw new Error("Upload failed")
      
      const data = await res.json()
      setFormData(prev => ({ ...prev, image: data.url }))
      setImageSrc(null)
    } catch (error) {
      alert("Image processing/upload failed.")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        name: formData.name,
        role: formData.role,
        category: formData.category,
        priority: Number(formData.priority),
        image: formData.image,
        specialNote: formData.specialNote || undefined,
        socials: {
          github: formData.github,
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          instagram: formData.instagram
        }
      }

      const url = editingId ? `/api/team/${editingId}` : "/api/team"
      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error("Operation failed")
      
      resetForm()
      fetchMembers()
    } catch (error) {
      alert("Failed to save member.")
    }
  }
  
  const handleEdit = (member: any) => {
    setEditingId(member._id)
    setFormData({
      name: member.name,
      role: member.role,
      category: member.category,
      priority: member.priority,
      image: member.image,
      specialNote: member.specialNote || "",
      github: member.socials?.github || "",
      linkedin: member.socials?.linkedin || "",
      twitter: member.socials?.twitter || "",
      instagram: member.socials?.instagram || ""
    })
    setIsCreating(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const resetForm = () => {
    setFormData({ name: "", role: "", github: "", linkedin: "", twitter: "", instagram: "", image: "", category: "", priority: 1, specialNote: "" })
    setEditingId(null)
    setIsCreating(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    await fetch(`/api/team/${id}`, { method: "DELETE" })
    fetchMembers()
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
          <p className="text-white/50">Manage core team and community leads.</p>
        </div>
        <Button onClick={() => isCreating ? resetForm() : setIsCreating(true)} className="bg-primary hover:bg-primary/90 text-white">
          <Plus weight="bold" className="mr-2" /> {isCreating ? "Cancel" : "Add Member"}
        </Button>
      </div>

      {isCreating && (
        <Card className="bg-card/40 border-white/[0.05] p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input required placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
              <Input required placeholder="Role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input required placeholder="Category (e.g. Core Team)" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
              <Input required type="number" placeholder="Priority (lower = higher prio)" value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value) || 1})} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Input placeholder="Special Note (Optional)" value={formData.specialNote} onChange={e => setFormData({...formData, specialNote: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input placeholder="GitHub URL" value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
              <Input placeholder="LinkedIn URL" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
              <Input placeholder="Twitter URL" value={formData.twitter} onChange={e => setFormData({...formData, twitter: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
              <Input placeholder="Instagram URL" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <Label className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 cursor-pointer text-white/80 transition-colors">
                  <ImageIcon /> {uploading ? "Uploading..." : "Upload Profile Pic"}
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Label>
                {formData.image && <div className="h-12 w-12 relative border border-white/10 rounded-full overflow-hidden"><Image src={formData.image} alt="Preview" fill className="object-cover" /></div>}
              </div>
              <p className="text-xs text-white/50">Upload a square image (1:1 ratio) for the best fit.</p>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" variant="ghost" onClick={resetForm} className="text-white hover:bg-white/10">Cancel</Button>
              <Button type="submit" disabled={!formData.image} className="bg-secondary text-black hover:bg-secondary/90 font-bold min-w-32">
                {editingId ? 'Update Member' : 'Save Member'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {members.map((member) => (
          <Card key={member._id} className="bg-card/20 border-white/[0.05] overflow-hidden group">
            <div className="h-56 w-full relative">
              <Image src={member.image} fill className="object-cover" alt={member.name} />
              <div className="absolute top-2 right-2 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(member)} className="p-2 bg-black/60 hover:bg-white/20 text-white rounded-lg backdrop-blur-md transition-colors border border-white/10">
                  <PencilSimple weight="duotone" />
                </button>
                <button onClick={() => handleDelete(member._id)} className="p-2 bg-black/60 hover:bg-destructive/80 text-white rounded-lg backdrop-blur-md transition-colors border border-white/10">
                  <Trash weight="duotone" />
                </button>
              </div>
            </div>
            <CardContent className="p-4 text-center">
              <h3 className="font-bold text-white text-lg truncate">{member.name}</h3>
              <p className="text-secondary text-sm font-medium mb-2">{member.role}</p>
              <div className="flex items-center justify-center gap-2 text-xs text-white/60">
                <span className="bg-white/10 px-2 py-1 rounded">{member.category || "No Category"}</span>
                <span className="bg-white/10 px-2 py-1 rounded">Pri: {member.priority || "N/A"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Cropper Modal */}
      {imageSrc && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl bg-[#1A222D] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col pt-16">
            <button 
              onClick={() => setImageSrc(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors"
            >
              <X weight="bold" />
            </button>
            <div className="px-6 pb-2 text-center">
              <h3 className="font-bold text-lg text-white">Crop Profile Photo</h3>
              <p className="text-white/50 text-sm">Drag to position. Scroll to zoom. Guaranteed 1:1 aspect square ratio.</p>
            </div>
            
            <div className="relative w-full h-[500px] bg-black/50 border-y border-white/5">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="p-6 flex justify-end gap-3 bg-[#1A222D]">
              <Button type="button" variant="ghost" onClick={() => setImageSrc(null)} className="text-white hover:bg-white/10">Cancel</Button>
              <Button onClick={handleUploadCroppedImage} disabled={uploading} className="bg-secondary text-black hover:bg-secondary/90 font-bold min-w-32">
                {uploading ? "Uploading..." : "Crop & Upload"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
