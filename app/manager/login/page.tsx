"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { managerLoginAction } from "./actions"

export default function ManagerLogin() {
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await managerLoginAction(formData)
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        // Redirection handled naturally here, the router.push will trigger the middleware evaluation
        router.push("/manager/participants")
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070A] px-6">
      <Card className="w-full max-w-md bg-[#1A222D] border border-white/10 p-6 shadow-2xl rounded-3xl relative overflow-hidden">
        {/* Subtle accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9900] to-amber-500" />

        <CardHeader className="text-center pb-8 border-b border-white/5 mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#FF9900]/10 rounded-2xl flex items-center justify-center mb-4 border border-[#FF9900]/20">
             <img src="/logo.svg" alt="Logo" className="w-8 h-8 object-contain drop-shadow-md" />
          </div>
          <CardTitle className="text-3xl font-black text-white tracking-tight">Event Desk</CardTitle>
          <p className="text-sm text-[#FF9900] font-bold mt-2 uppercase tracking-widest">Manager Portal</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <input
                type="email"
                name="email"
                required
                placeholder="Manager Email"
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#FF9900]/50 focus:ring-1 focus:ring-[#FF9900]/50 transition duration-300"
                autoFocus
              />
              <input
                type="password"
                name="password"
                required
                placeholder="Password"
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#FF9900]/50 focus:ring-1 focus:ring-[#FF9900]/50 transition duration-300"
              />
              {error && (
                 <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium p-3 rounded-lg text-center">
                   {error}
                 </div>
              )}
            </div>
            <Button disabled={loading} type="submit" size="lg" className="w-full bg-[#FF9900] text-black hover:bg-[#FF9900]/90 font-bold h-14 rounded-xl disabled:opacity-70 transition duration-300">
              {loading ? "Authenticating..." : "Access Desk"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
