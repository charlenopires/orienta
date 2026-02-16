import { Outlet, useLoaderData } from "react-router"
import type { AuthUser } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export function ProtectedLayout() {
  const user = useLoaderData() as AuthUser

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="md:pl-64">
        <Header user={user} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
