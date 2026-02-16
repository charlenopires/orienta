import { redirect } from "react-router"

export interface AuthUser {
  id: string
  name: string
  email: string
}

export async function requireAuth(): Promise<AuthUser> {
  const res = await fetch("/api/auth/me", { credentials: "include" })
  if (!res.ok) throw redirect("/")
  return res.json()
}
