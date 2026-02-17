import { useLoaderData } from "react-router"
import { CheckCircle2, XCircle, Lightbulb, Loader2, GraduationCap, BookOpen, CalendarDays, ClipboardCheck, ThumbsUp, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { PonderationDetail } from "@/lib/types"

export async function ponderacaoDetalheLoader({ params }: { params: { id: string } }): Promise<PonderationDetail> {
  const res = await fetch(`/api/public/ponderations/${params.id}`)
  if (!res.ok) throw new Error("Failed to load ponderation")
  return res.json()
}

const statusLabels: Record<string, string> = {
  bom: "Bom",
  atencao: "Atenção",
  critico: "Crítico",
}

const statusColors: Record<string, string> = {
  bom: "text-green-400 bg-green-500/10 border-green-500/30",
  atencao: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  critico: "text-red-400 bg-red-500/10 border-red-500/30",
}

const statusAccent: Record<string, string> = {
  bom: "from-green-500 to-emerald-600",
  atencao: "from-amber-500 to-orange-600",
  critico: "from-red-500 to-rose-600",
}

const scoreStrokeColor: Record<string, string> = {
  bom: "stroke-green-500",
  atencao: "stroke-amber-500",
  critico: "stroke-red-500",
}

function ScoreRing({ percent, status }: { percent: number; status: string }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="relative flex h-[88px] w-[88px] items-center justify-center shrink-0">
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 88 88">
        <circle
          cx="44" cy="44" r={radius}
          fill="none" strokeWidth="6"
          className="stroke-muted/40"
        />
        <circle
          cx="44" cy="44" r={radius}
          fill="none" strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${scoreStrokeColor[status] ?? "stroke-primary"} transition-all duration-700`}
        />
      </svg>
      <div className="text-center">
        <span className="text-2xl font-bold leading-none">{percent}</span>
        <span className="text-[10px] text-muted-foreground block -mt-0.5">%</span>
      </div>
    </div>
  )
}

export function PonderacaoDetalhePage() {
  const data = useLoaderData() as PonderationDetail

  const totalItems = data.sections.reduce((sum, s) => sum + s.items.length, 0)
  const totalSim = data.sections.reduce((sum, s) => sum + s.items.filter((i) => i.answer).length, 0)
  const totalNao = totalItems - totalSim

  const formattedDate = new Date(data.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 space-y-6">
      {/* Hero Header */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className={`h-1.5 bg-gradient-to-r ${statusAccent[data.statusGeneral] ?? "from-primary to-primary"}`} />
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
            {/* Left: Student info */}
            <div className="space-y-3 min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 shrink-0">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold truncate">{data.studentName}</h1>
                  <p className="text-sm text-muted-foreground truncate">{data.studentCourse}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-y-1.5 gap-x-5 text-sm text-muted-foreground">
                {data.studentProjectTopic && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                    <span className="truncate">{data.studentProjectTopic}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Right: Score ring + status */}
            <div className="flex items-center gap-4 sm:gap-5 self-center sm:self-start">
              <ScoreRing percent={data.scorePercent} status={data.statusGeneral} />
              <div className="flex flex-col items-start gap-1.5">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${statusColors[data.statusGeneral] ?? "text-muted-foreground bg-muted/30 border-border"}`}>
                  {statusLabels[data.statusGeneral] ?? data.statusGeneral}
                </span>
                <span className="text-[11px] text-muted-foreground">Status geral</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted/25 p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <ClipboardCheck className="h-3.5 w-3.5 text-primary/70" />
              </div>
              <p className="text-lg font-bold leading-none">{totalItems}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Itens avaliados</p>
            </div>
            <div className="rounded-lg bg-green-500/8 p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <ThumbsUp className="h-3.5 w-3.5 text-green-500/70" />
              </div>
              <p className="text-lg font-bold leading-none text-green-400">{totalSim}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Conformes</p>
            </div>
            <div className="rounded-lg bg-red-500/8 p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400/70" />
              </div>
              <p className="text-lg font-bold leading-none text-red-400">{totalNao}</p>
              <p className="text-[11px] text-muted-foreground mt-1">A melhorar</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section heading */}
      <h2 className="text-base font-semibold flex items-center gap-2">
        Detalhamento por Seção
        <span className="text-xs font-normal text-muted-foreground">
          ({data.sections.length} seções)
        </span>
      </h2>

      {/* Sections */}
      <Accordion type="multiple" defaultValue={
        data.sections
          .filter((s) => s.items.some((i) => !i.answer))
          .map((s) => s.sectionId)
      }>
        {data.sections.map((section) => {
          const simCount = section.items.filter((i) => i.answer).length
          const naoCount = section.items.filter((i) => !i.answer).length
          const allSim = naoCount === 0

          return (
            <AccordionItem
              key={section.sectionId}
              value={section.sectionId}
              className="rounded-lg border border-border px-4 mb-2"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{section.sectionTitle}</span>
                  <span className="text-xs text-muted-foreground">
                    {simCount} sim / {naoCount} não
                  </span>
                  {allSim && (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-green-600">
                      Tudo OK
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item.id} className="rounded-md border border-border p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        {item.answer ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                        )}
                        <p className="text-sm leading-relaxed">{item.question}</p>
                      </div>

                      {!item.answer && item.observation && (
                        <div className="ml-7 rounded bg-muted/50 p-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Observação do orientador:</p>
                          <p className="text-sm">{item.observation}</p>
                        </div>
                      )}

                      {!item.answer && item.aiTip && (
                        <Card className="ml-7 py-3">
                          <CardHeader className="pb-2 pt-0">
                            <CardTitle className="flex items-center gap-2 text-sm">
                              <Lightbulb className="h-4 w-4 text-yellow-500" />
                              Dica da IA
                              {item.aiTip.isFallback && (
                                <Badge variant="outline" className="text-[10px]">fallback</Badge>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div>
                              <p className="font-medium text-xs text-muted-foreground">Diagnóstico</p>
                              <p>{item.aiTip.diagnosis}</p>
                            </div>
                            <div>
                              <p className="font-medium text-xs text-muted-foreground">Como corrigir</p>
                              <p>{item.aiTip.howToFix}</p>
                            </div>
                            {item.aiTip.practicalExample && (
                              <div>
                                <p className="font-medium text-xs text-muted-foreground">Exemplo prático</p>
                                <p className="whitespace-pre-wrap rounded bg-muted p-2 text-xs">
                                  {item.aiTip.practicalExample}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {!item.answer && !item.aiTip && (
                        <div className="ml-7 flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Dica em processamento...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
