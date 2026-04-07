"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { loginAction } from "./actions"
import { Input } from "@/components/ui/input"

export default function AdminLogin() {
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await loginAction(formData)
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        router.push("/admin")
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <Card className="w-full max-w-md bg-card/40 border-white/[0.05] p-6 shadow-2xl">
        <CardHeader className="text-center pb-8 border-b border-white/[0.05] mb-8 flex flex-col items-center">
          <img src="/logo.svg" alt="Logo" className="h-20 w-auto object-contain mb-4 drop-shadow-lg" />
          <CardTitle className="text-3xl font-bold text-white tracking-tight">Admin Portal</CardTitle>
          <p className="text-sm text-white/50 mt-2">Enter your credentials to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <Input
                type="email"
                name="email"
                required
                placeholder="Admin Email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                autoFocus
              />
              <Input
                type="password"
                name="password"
                required
                placeholder="Password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
              {error && <p className="text-destructive text-sm font-medium">{error}</p>}
            </div>
            <Button disabled={loading} type="submit" size="lg" className="w-full bg-primary text-white hover:bg-primary/90 font-bold h-12 rounded-xl disabled:opacity-50">
              {loading ? "Authenticating..." : "Authenticate"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
