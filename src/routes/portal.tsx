import { useState, useEffect } from "react"
import { useParams } from "react-router"
import { CheckCircle2, XCircle, Lightbulb, Loader2, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { PortalData, PonderationDetailSection } from "@/lib/types"

const statusLabels: Record<string, string> = {
  bom: "Bom",
  atencao: "Atenção",
  critico: "Crítico",
}

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  bom: "default",
  atencao: "secondary",
  critico: "destructive",
}

function SectionAccordion({ sections }: { sections: PonderationDetailSection[] }) {
  const sectionsWithNao = sections.filter((s) => s.items.some((i) => !i.answer))
  const sectionsAllSim = sections.filter((s) => s.items.every((i) => i.answer))

  return (
    <div className="space-y-3">
      {/* Sections with issues - expanded by default, showing ALL items */}
      {sectionsWithNao.length > 0 && (
        <Accordion type="multiple" defaultValue={sectionsWithNao.map((s) => s.sectionId)}>
          {sectionsWithNao.map((section) => {
            const naoCount = section.items.filter((i) => !i.answer).length
            return (
              <AccordionItem
                key={section.sectionId}
                value={section.sectionId}
                className="rounded-lg border border-border px-4 mb-2"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{section.sectionTitle}</span>
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      {naoCount} ponto{naoCount > 1 ? "s" : ""} a melhorar
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {section.items.map((item) =>
                      item.answer ? (
                        <div key={item.id} className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
                          <p className="text-sm leading-relaxed text-green-800 dark:text-green-300">{item.question}</p>
                        </div>
                      ) : (
                        <div key={item.id} className="rounded-md border border-border p-3 space-y-2">
                          <div className="flex items-start gap-2">
                            <XCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                            <p className="text-sm leading-relaxed">{item.question}</p>
                          </div>

                          {item.observation && (
                            <div className="ml-7 rounded bg-muted/50 p-2">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Observação do orientador:</p>
                              <p className="text-sm">{item.observation}</p>
                            </div>
                          )}

                          {item.aiTip && (
                            <Card className="ml-7 py-3">
                              <CardHeader className="pb-2 pt-0">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                                  Dica de melhoria
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

                          {!item.aiTip && (
                            <div className="ml-7 flex items-center gap-2 text-xs text-muted-foreground">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Dica em processamento...
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}

      {/* Sections all OK - compact summary */}
      {sectionsAllSim.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Seções aprovadas ({sectionsAllSim.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sectionsAllSim.map((s) => (
              <Badge key={s.sectionId} variant="outline" className="text-green-700 border-green-300 dark:text-green-400 dark:border-green-800">
                {s.sectionTitle}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function PortalPage() {
  const { token } = useParams()
  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    // Extract the UUID from the slug (last 36 characters = UUID format)
    const uuidMatch = token.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    const actualToken = uuidMatch ? uuidMatch[0] : token

    fetch(`/api/portal/${actualToken}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Erro ao carregar" }))
          throw new Error(err.error ?? "Erro ao carregar dados")
        }
        return res.json()
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Carregando dados...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <h1 className="text-2xl font-bold text-destructive">Erro</h1>
        <p className="mt-2 text-muted-foreground">{error ?? "Dados não encontrados"}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      {/* Student header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">{data.student.name}</h1>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{data.student.course}</span>
          <span>{data.student.projectTopic}</span>
        </div>
      </div>

      {data.ponderations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">Nenhuma avaliação disponível ainda.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Avaliações</h2>
          {data.ponderations.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {new Date(p.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{p.scorePercent}%</span>
                    <Badge variant={statusVariants[p.statusGeneral] ?? "outline"}>
                      {statusLabels[p.statusGeneral] ?? p.statusGeneral}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <SectionAccordion sections={p.sections} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
