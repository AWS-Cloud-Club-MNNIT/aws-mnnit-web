"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash, Image as ImageIcon, PencilSimple, X, InstagramLogo, LinkedinLogo, XLogo } from "@phosphor-icons/react"
import Cropper from "react-easy-crop"
import { getCroppedImg } from "@/lib/cropImage"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function AdminSponsors() {
  const [sponsors, setSponsors] = React.useState<any[]>([])
  const [isCreating, setIsCreating] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({
    companyName: "", category: "", priority: 10, sponsorType: "", logo: "", specialNote: "", websiteLink: "", instagram: "", linkedin: "", twitter: ""
  })
  const [uploading, setUploading] = React.useState(false)

  // Cropper states
  const [imageSrc, setImageSrc] = React.useState<string | null>(null)
  const [crop, setCrop] = React.useState({ x: 0, y: 0 })
  const [zoom, setZoom] = React.useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<any>(null)

  React.useEffect(() => {
    fetchSponsors()
  }, [])

  const fetchSponsors = async () => {
    const res = await fetch("/api/sponsor")
    const data = await res.json()
    if (Array.isArray(data)) setSponsors(data)
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
      // Get cropped file using canvas utility
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels)
      if (!croppedFile) throw new Error("Could not crop image")

      // Check min size on the crop
      if (croppedAreaPixels.width < 200 || croppedAreaPixels.height < 200) {
        alert("The cropped area is smaller than 200x200 px. Please zoom out or upload a larger image.")
        return
      }

      const body = new FormData()
      body.append("file", croppedFile)

      const res = await fetch("/api/upload", { method: "POST", body })
      if (!res.ok) throw new Error("Upload failed")
      
      const data = await res.json()
      setFormData(prev => ({ ...prev, logo: data.url }))
      setImageSrc(null) // close cropper
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
        ...formData,
        priority: Number(formData.priority)
      }

      const url = editingId ? `/api/sponsor/${editingId}` : "/api/sponsor"
      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error("Operation failed")
      
      setIsCreating(false)
      setEditingId(null)
      fetchSponsors()
      resetForm()
    } catch (error) {
      alert("Failed to save sponsor.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sponsor?")) return
    await fetch(`/api/sponsor/${id}`, { method: "DELETE" })
    fetchSponsors()
  }

  const handleEdit = (sponsor: any) => {
    setEditingId(sponsor._id)
    setFormData({
      companyName: sponsor.companyName,
      category: sponsor.category,
      priority: sponsor.priority,
      sponsorType: sponsor.sponsorType,
      logo: sponsor.logo,
      specialNote: sponsor.specialNote || "",
      websiteLink: sponsor.websiteLink,
      instagram: sponsor.instagram || "",
      linkedin: sponsor.linkedin || "",
      twitter: sponsor.twitter || ""
    })
    setIsCreating(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const resetForm = () => {
    setFormData({ companyName: "", category: "", priority: 10, sponsorType: "", logo: "", specialNote: "", websiteLink: "", instagram: "", linkedin: "", twitter: "" })
    setEditingId(null)
    setIsCreating(false)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Sponsors Management</h1>
          <p className="text-white/50">Manage dynamic sponsors and partners.</p>
        </div>
        <Button onClick={() => isCreating ? resetForm() : setIsCreating(true)} className="bg-primary hover:bg-primary/90 text-white">
          <Plus weight="bold" className="mr-2" /> {isCreating ? "Cancel" : "New Sponsor"}
        </Button>
      </div>

      {isCreating && (
        <Card className="bg-card/40 border-white/[0.05] p-6 shadow-[0_0_30px_rgba(124,58,237,0.15)] ring-1 ring-white/10">
          <h2 className="text-xl font-bold text-white mb-4">{editingId ? 'Edit Sponsor' : 'Add New Sponsor'}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-white/50 uppercase tracking-wider font-bold">Company Name *</Label>
                <Input required placeholder="AWS" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-white/50 uppercase tracking-wider font-bold">Category *</Label>
                <Input required placeholder="e.g. Cloud Partner" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-white/50 uppercase tracking-wider font-bold">Sponsor Type (Section Heading) *</Label>
                <Input required placeholder="e.g. Title Sponser, Gold" value={formData.sponsorType} onChange={e => setFormData({...formData, sponsorType: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-white/50 uppercase tracking-wider font-bold">Priority (Lower = Higher Rank) *</Label>
                <Input required type="number" placeholder="10" value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value) || 0})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-white/50 uppercase tracking-wider font-bold">Website URL *</Label>
              <Input required type="url" placeholder="https://..." value={formData.websiteLink} onChange={e => setFormData({...formData, websiteLink: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
              <div className="space-y-1">
                <Label className="text-xs text-white/50 uppercase tracking-wider font-bold">Instagram URL</Label>
                <Input type="url" placeholder="https://instagram.com/..." value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-white/50 uppercase tracking-wider font-bold">LinkedIn URL</Label>
                <Input type="url" placeholder="https://linkedin.com/in/..." value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-white/50 uppercase tracking-wider font-bold">Twitter/X URL</Label>
                <Input type="url" placeholder="https://x.com/..." value={formData.twitter} onChange={e => setFormData({...formData, twitter: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>

            <div className="space-y-1 mt-1">
              <Label className="text-xs text-white/50 uppercase tracking-wider font-bold">Special Note (Optional)</Label>
              <Textarea rows={2} placeholder="Optional message from/about the sponsor" value={formData.specialNote} onChange={e => setFormData({...formData, specialNote: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-white/50 uppercase tracking-wider font-bold mb-2 block">Company Logo *</Label>
              <div className="flex items-center gap-4">
                <Label className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 cursor-pointer text-white/80 transition-colors">
                  <ImageIcon /> Upload Logo
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Label>
                {formData.logo && <div className="h-16 w-16 relative border border-white/10 bg-white/5 p-1 rounded"><Image src={formData.logo} alt="Preview" fill className="object-contain" /></div>}
              </div>
              <p className="text-xs text-white/40 mt-1 italic">Upload a square logo (recommended: 200 × 200 px).</p>
              {!formData.logo && <p className="text-xs text-red-400 mt-1">Logo is required.</p>}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" variant="ghost" onClick={resetForm} className="text-white hover:bg-white/10">Cancel</Button>
              <Button type="submit" disabled={!formData.logo || uploading} className="bg-secondary text-black hover:bg-secondary/90 font-bold min-w-32">
                {editingId ? 'Update Sponsor' : 'Save Sponsor'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sponsors.map((sponsor) => (
          <Card key={sponsor._id} className="bg-card/20 border-white/[0.05] overflow-hidden group hover:border-[#7C3AED]/40 transition-colors flex flex-col h-full">
            <div className="h-48 w-full relative bg-white/5 flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/60 pointer-events-none z-0" />
              <Image src={sponsor.logo} fill className="max-w-full max-h-full object-contain relative z-10 drop-shadow-lg filter p-6" alt={sponsor.companyName} />
              
              <div className="absolute top-2 right-2 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(sponsor)} className="p-2 bg-black/60 hover:bg-white/20 text-white rounded-lg backdrop-blur-md transition-colors border border-white/10">
                  <PencilSimple weight="duotone" />
                </button>
                <button onClick={() => handleDelete(sponsor._id)} className="p-2 bg-black/60 hover:bg-destructive/80 text-white rounded-lg backdrop-blur-md transition-colors border border-white/10">
                  <Trash weight="duotone" />
                </button>
              </div>
              
              <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                <span className="text-[10px] font-bold px-2 py-1 bg-black/60 backdrop-blur-md text-white rounded border border-white/10 w-fit">
                  Prio: {sponsor.priority}
                </span>
                <span className="text-[10px] font-bold px-2 py-1 bg-[#7C3AED]/80 backdrop-blur-md text-white rounded border border-white/10 w-fit">
                  {sponsor.sponsorType}
                </span>
              </div>
            </div>
            <CardContent className="p-5 flex-1 flex flex-col">
              <div className="mb-3">
                <h3 className="font-bold text-white text-xl truncate">{sponsor.companyName}</h3>
                <p className="text-primary font-medium text-sm">{sponsor.category}</p>
              </div>
              <p className="text-white/40 text-xs truncate flex-1">{sponsor.websiteLink}</p>
              {sponsor.specialNote && (
                <p className="text-white/60 text-xs mt-3 bg-white/5 p-2 rounded-md italic truncate">
                  "{sponsor.specialNote}"
                </p>
              )}
              {(sponsor.instagram || sponsor.linkedin || sponsor.twitter) && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                  {sponsor.instagram && (
                    <a href={sponsor.instagram} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-[#E1306C] transition-colors">
                      <InstagramLogo weight="duotone" className="w-5 h-5" />
                    </a>
                  )}
                  {sponsor.linkedin && (
                    <a href={sponsor.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-[#0A66C2] transition-colors">
                      <LinkedinLogo weight="duotone" className="w-5 h-5" />
                    </a>
                  )}
                  {sponsor.twitter && (
                    <a href={sponsor.twitter} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
                      <XLogo weight="duotone" className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {sponsors.length === 0 && !isCreating && (
          <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            <p className="text-white/40 mb-4">No sponsors added yet.</p>
            <Button onClick={() => setIsCreating(true)} variant="outline" className="border-white/10 text-white hover:bg-white/5">
              <Plus className="mr-2" /> Add First Sponsor
            </Button>
          </div>
        )}
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
              <h3 className="font-bold text-lg text-white">Crop Sponsor Logo</h3>
              <p className="text-white/50 text-sm">Drag to position. Scroll to zoom. Guaranteed 1:1 aspect ratio.</p>
            </div>
            
            <div className="relative w-full h-[500px] bg-black/50 border-y border-white/5">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
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
