"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash, Image as ImageIcon } from "@phosphor-icons/react"

export default function AdminTeam() {
  const [members, setMembers] = React.useState<any[]>([])
  const [isCreating, setIsCreating] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: "", role: "", github: "", linkedin: "", twitter: "", image: ""
  })
  const [uploading, setUploading] = React.useState(false)

  React.useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    const res = await fetch("/api/team")
    const data = await res.json()
    if (Array.isArray(data)) setMembers(data)
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
      setFormData(prev => ({ ...prev, image: data.url }))
    } catch (error) {
      alert("Image upload failed. Is Cloudinary configured?")
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
        image: formData.image,
        socials: {
          github: formData.github,
          linkedin: formData.linkedin,
          twitter: formData.twitter
        }
      }
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error("Creation failed")
      setIsCreating(false)
      fetchMembers()
      setFormData({ name: "", role: "", github: "", linkedin: "", twitter: "", image: "" })
    } catch (error) {
      alert("Failed to create member.")
    }
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
        <Button onClick={() => setIsCreating(!isCreating)} className="bg-primary hover:bg-primary/90 text-white">
          <Plus weight="bold" className="mr-2" /> {isCreating ? "Cancel" : "Add Member"}
        </Button>
      </div>

      {isCreating && (
        <Card className="bg-card/40 border-white/[0.05] p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
              <input required placeholder="Role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <input placeholder="GitHub URL" value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
              <input placeholder="LinkedIn URL" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
              <input placeholder="Twitter URL" value={formData.twitter} onChange={e => setFormData({...formData, twitter: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 cursor-pointer text-white/80 transition-colors">
                <ImageIcon /> {uploading ? "Uploading..." : "Upload Profile Pic"}
                <input type="file" hidden accept="image/*" onChange={handleUpload} disabled={uploading} />
              </label>
              {formData.image && <img src={formData.image} alt="Preview" className="h-12 w-12 object-cover rounded-full border border-white/10" />}
            </div>
            <Button type="submit" className="bg-secondary text-black hover:bg-secondary/90 font-bold mt-2">Save Member</Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {members.map((member) => (
          <Card key={member._id} className="bg-card/20 border-white/[0.05] overflow-hidden group">
            <div className="h-56 w-full relative">
              <img src={member.image} className="w-full h-full object-cover" alt={member.name} />
              <div className="absolute top-2 right-2">
                <button onClick={() => handleDelete(member._id)} className="p-2 bg-black/50 hover:bg-destructive/80 text-white rounded-lg backdrop-blur-md transition-colors">
                  <Trash weight="duotone" />
                </button>
              </div>
            </div>
            <CardContent className="p-4 text-center">
              <h3 className="font-bold text-white text-lg truncate">{member.name}</h3>
              <p className="text-secondary text-sm font-medium">{member.role}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
