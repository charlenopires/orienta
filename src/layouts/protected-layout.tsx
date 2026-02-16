import { Outlet, useLoaderData } from "react-router"
import type { AuthUser } from "@/lib/auth"

export function ProtectedLayout() {
  const user = useLoaderData() as AuthUser

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex h-14 items-center justify-between border-b border-border px-6">
        <span className="text-lg font-semibold text-primary">Orienta</span>
        <span className="text-sm text-muted-foreground">{user.name}</span>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
