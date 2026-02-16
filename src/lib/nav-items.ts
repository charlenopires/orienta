import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  History,
} from "lucide-react"

export const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/alunos", label: "Alunos", icon: Users },
  { to: "/avaliacoes", label: "Avaliações", icon: ClipboardCheck },
  { to: "/historico", label: "Histórico", icon: History },
] as const
