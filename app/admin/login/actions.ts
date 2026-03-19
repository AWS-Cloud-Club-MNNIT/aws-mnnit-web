"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const email = formData.get("email")
  const password = formData.get("password")
  
  const validEmail = process.env.ADMIN_EMAIL || "awscloudclubmnnit@gmail.com"
  const validPassword = process.env.ADMIN_PASSWORD || "awsmnnit"

  if (email === validEmail && password === validPassword) {
    const cookieStore = await cookies()
    cookieStore.set("admin_token", password as string, { 
      path: "/", 
      secure: process.env.NODE_ENV === "production", 
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax"
    })
    return { success: true }
  }
  
  return { error: "Invalid email or password." }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_token")
  redirect("/admin/login")
}
