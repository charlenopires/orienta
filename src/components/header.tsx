import { Link, useMatches, useNavigate } from "react-router"
import { LogOut } from "lucide-react"
import type { AuthUser } from "@/lib/auth"
import { MobileSidebar } from "@/components/mobile-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface HeaderProps {
  user: AuthUser
}

export function Header({ user }: HeaderProps) {
  const matches = useMatches()
  const navigate = useNavigate()

  const currentMatch = [...matches].reverse().find((m) => (m.handle as { title?: string })?.title)
  const title = (currentMatch?.handle as { title?: string })?.title ?? ""

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <span className="text-lg font-semibold md:hidden text-primary">Orienta</span>
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">Início</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {title && title !== "Dashboard" && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{user.name}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  )
}
