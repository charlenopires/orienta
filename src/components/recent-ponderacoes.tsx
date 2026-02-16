import { CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PonderacaoResumo } from "@/lib/types"

interface RecentPonderacoesProps {
  ponderacoes: PonderacaoResumo[]
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function RecentPonderacoes({ ponderacoes }: RecentPonderacoesProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Últimas Ponderações</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {ponderacoes.map((p) => {
            const total = p.positivos + p.negativos
            const pct = total > 0 ? Math.round((p.positivos / total) * 100) : 0
            return (
              <div key={p.id} className="flex items-center justify-between px-6 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.alunoNome}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(p.data)}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {p.positivos}
                  </span>
                  <span className="flex items-center gap-1 text-destructive">
                    <XCircle className="h-3.5 w-3.5" />
                    {p.negativos}
                  </span>
                  <span className="w-10 text-right text-muted-foreground">{pct}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
