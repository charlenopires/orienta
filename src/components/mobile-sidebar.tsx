import { useState } from "react"
import { useLocation } from "react-router"
import { Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { SidebarNav } from "@/components/sidebar"

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <Sheet open={open} onOpenChange={setOpen} key={location.pathname}>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Abrir menu</span>
      </button>
      <SheetContent side="left" className="w-64 bg-card p-0">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="text-lg font-bold text-primary">
            Orienta
          </SheetTitle>
        </SheetHeader>
        <SidebarNav onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
