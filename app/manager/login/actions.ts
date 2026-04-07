"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function managerLoginAction(formData: FormData) {
  const email = formData.get("email")
  const password = formData.get("password")
  
  const validEmail = process.env.MANAGER_EMAIL || "scdmanager@mnnit.ac.in"
  const validPassword = process.env.MANAGER_PASSWORD || "scdmanagermnnit@2026"

  if (email === validEmail && password === validPassword) {
    const cookieStore = await cookies()
    cookieStore.set("manager_token", password as string, { 
      path: "/", 
      secure: process.env.NODE_ENV === "production", 
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax"
    })
    return { success: true }
  }
  
  return { error: "Invalid manager credentials." }
}

export async function managerLogoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("manager_token")
  redirect("/manager/login")
}
