import { useLoaderData } from "react-router"
import { CheckCircle2, XCircle, Lightbulb, Loader2 } from "lucide-react"
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

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  bom: "default",
  atencao: "secondary",
  critico: "destructive",
}

export function PonderacaoDetalhePage() {
  const data = useLoaderData() as PonderationDetail

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">{data.studentName}</h1>
          <Badge variant={statusVariants[data.statusGeneral] ?? "outline"}>
            {statusLabels[data.statusGeneral] ?? data.statusGeneral}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <span>{data.studentCourse}</span>
          <span>{data.studentProjectTopic}</span>
          <span>
            {new Date(data.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="font-medium text-foreground">Score: {data.scorePercent}%</span>
        </div>
      </div>

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
