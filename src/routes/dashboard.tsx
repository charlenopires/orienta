import { Link, useLoaderData } from "react-router"
import { Users, ClipboardCheck, FileText, TrendingUp, Plus, UserPlus } from "lucide-react"
import type { DashboardStats } from "@/lib/types"
import { StatCard } from "@/components/stat-card"
import { RecentPonderacoes } from "@/components/recent-ponderacoes"
import { Button } from "@/components/ui/button"

export async function dashboardLoader(): Promise<DashboardStats> {
  const res = await fetch("/api/dashboard/stats", { credentials: "include" })
  if (!res.ok) throw new Error("Failed to load dashboard stats")
  return res.json()
}

export function DashboardPage() {
  const stats = useLoaderData() as DashboardStats

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/avaliacoes">
            <Plus className="mr-2 h-4 w-4" />
            Nova Avaliação
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/alunos">
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Aluno
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total de Alunos"
          value={stats.totalAlunos}
          icon={Users}
        />
        <StatCard
          label="Avaliações Realizadas"
          value={stats.avaliacoesRealizadas}
          icon={ClipboardCheck}
        />
        <StatCard
          label="Ponderações no Mês"
          value={stats.ponderacoesMes}
          icon={FileText}
        />
        <StatCard
          label="Conformidade Média"
          value={stats.mediaConformidade}
          suffix="%"
          icon={TrendingUp}
        />
      </div>
      <RecentPonderacoes ponderacoes={stats.ultimasPonderacoes} />
    </div>
  )
}
