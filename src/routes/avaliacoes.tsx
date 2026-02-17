import { useState, useCallback, useMemo, useRef } from "react"
import { useLoaderData, useSearchParams, Link } from "react-router"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, Save, CheckCircle2, Plus, ArrowLeft, Eye, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StudentCombobox } from "@/components/student-combobox"
import { ChecklistItem } from "@/components/checklist-item"
import { checklistSections, TOTAL_ITEMS } from "@/lib/checklist-data"
import type { Student, EvaluationItemState, PonderationListItem } from "@/lib/types"

interface AvaliacoesLoaderData {
  students: Student[]
  preselectedStudentId: string | null
  ponderations: PonderationListItem[]
}

export async function avaliacoesLoader({ request }: { request: Request }): Promise<AvaliacoesLoaderData> {
  const url = new URL(request.url)
  const studentId = url.searchParams.get("studentId")

  const [studentsRes, ponderationsRes] = await Promise.all([
    fetch("/api/students?limit=100", { credentials: "include" }),
    fetch("/api/ponderations", { credentials: "include" }),
  ])

  if (!studentsRes.ok) throw new Error("Failed to load students")
  const { data: students } = await studentsRes.json()

  let ponderations: PonderationListItem[] = []
  if (ponderationsRes.ok) {
    const { data } = await ponderationsRes.json()
    ponderations = data
  }

  return { students, preselectedStudentId: studentId, ponderations }
}

function buildInitialItems(): EvaluationItemState[] {
  return checklistSections.flatMap((section) =>
    section.items.map((item) => ({
      sectionId: section.id,
      itemId: item.id,
      answer: null,
      observation: "",
    })),
  )
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

function PonderationsList({
  ponderations,
  onNewEvaluation,
}: {
  ponderations: PonderationListItem[]
  onNewEvaluation: () => void
}) {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Avaliações Realizadas</h2>
        <Button onClick={onNewEvaluation}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Avaliação
        </Button>
      </div>

      {ponderations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">Nenhuma avaliação realizada ainda.</p>
          <Button variant="outline" className="mt-4" onClick={onNewEvaluation}>
            <Plus className="mr-2 h-4 w-4" />
            Criar primeira avaliação
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {ponderations.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.studentName}</TableCell>
                  <TableCell>
                    {new Date(p.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>{p.scorePercent}%</TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[p.statusGeneral] ?? "outline"}>
                      {statusLabels[p.statusGeneral] ?? p.statusGeneral}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/ponderacoes/${p.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const url = `${window.location.origin}/ponderacoes/${p.id}`
                          navigator.clipboard.writeText(url).then(
                            () => toast.success("Link copiado!"),
                            () => toast.error("Erro ao copiar link"),
                          )
                        }}
                        title="Copiar link público"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function ChecklistForm({
  students,
  preselectedStudentId,
  onBack,
}: {
  students: Student[]
  preselectedStudentId: string | null
  onBack: () => void
}) {
  const [searchParams] = useSearchParams()

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    preselectedStudentId ?? searchParams.get("studentId"),
  )
  const [items, setItems] = useState<EvaluationItemState[]>(buildInitialItems)
  const [evaluationId, setEvaluationId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [openSections, setOpenSections] = useState<string[]>([checklistSections[0].id])
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const updateItem = useCallback((sectionId: string, itemId: string, patch: Partial<EvaluationItemState>) => {
    setItems((prev) =>
      prev.map((i) =>
        i.sectionId === sectionId && i.itemId === itemId ? { ...i, ...patch } : i,
      ),
    )
  }, [])

  const progress = useMemo(() => {
    const answered = items.filter((i) => i.answer !== null).length
    const totalPercent = Math.round((answered / TOTAL_ITEMS) * 100)

    const bySections = checklistSections.map((section) => {
      const sectionItems = items.filter((i) => i.sectionId === section.id)
      const sectionAnswered = sectionItems.filter((i) => i.answer !== null).length
      const pendingObservations = sectionItems.filter(
        (i) => i.answer === false && i.observation.trim() === "",
      ).length
      return {
        id: section.id,
        answered: sectionAnswered,
        total: sectionItems.length,
        percent: Math.round((sectionAnswered / sectionItems.length) * 100),
        pendingObservations,
      }
    })

    return { answered, totalPercent, bySections }
  }, [items])

  async function handleSaveDraft() {
    if (!selectedStudentId) {
      toast.error("Selecione um aluno antes de salvar")
      return
    }
    setSaving(true)
    try {
      const payload = { studentId: selectedStudentId, items }
      let res: Response

      if (evaluationId) {
        res = await fetch(`/api/evaluations/${evaluationId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ items }),
        })
      } else {
        res = await fetch("/api/evaluations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Erro ao salvar rascunho")
        return
      }

      const data = await res.json()
      if (!evaluationId) {
        setEvaluationId(data.id)
      }
      toast.success("Rascunho salvo")
    } catch {
      toast.error("Erro ao conectar com o servidor")
    } finally {
      setSaving(false)
    }
  }

  async function handleFinalize() {
    if (!selectedStudentId) {
      toast.error("Selecione um aluno")
      return
    }

    const unanswered = items.filter((i) => i.answer === null)
    if (unanswered.length > 0) {
      const sectionIds = [...new Set(unanswered.map((i) => i.sectionId))]
      const names = sectionIds
        .map((sid) => checklistSections.find((s) => s.id === sid)?.title)
        .join(", ")
      toast.error(`Itens não respondidos em: ${names}`)
      return
    }

    const missingObs = items.filter(
      (i) => i.answer === false && i.observation.trim() === "",
    )
    if (missingObs.length > 0) {
      const sectionIds = [...new Set(missingObs.map((i) => i.sectionId))]
      const names = sectionIds
        .map((sid) => checklistSections.find((s) => s.id === sid)?.title)
        .join(", ")
      toast.error(`Observações pendentes em: ${names}`)
      return
    }

    setFinalizing(true)
    try {
      let currentEvalId = evaluationId
      if (!currentEvalId) {
        const saveRes = await fetch("/api/evaluations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ studentId: selectedStudentId, items }),
        })
        if (!saveRes.ok) {
          toast.error("Erro ao salvar avaliação")
          return
        }
        const saved = await saveRes.json()
        currentEvalId = saved.id
        setEvaluationId(saved.id)
      } else {
        await fetch(`/api/evaluations/${currentEvalId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ items }),
        })
      }

      const res = await fetch(`/api/evaluations/${currentEvalId}/finalize`, {
        method: "POST",
        credentials: "include",
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Erro ao finalizar")
        return
      }

      const result = await res.json()
      toast.success(
        `Avaliação finalizada! Score: ${result.ponderation.scorePercent}% (${result.ponderation.positivos} positivos, ${result.ponderation.negativos} negativos)`,
      )

      onBack()
    } catch {
      toast.error("Erro ao conectar com o servidor")
    } finally {
      setFinalizing(false)
    }
  }

  function navigateSection(currentId: string, direction: "prev" | "next") {
    const idx = checklistSections.findIndex((s) => s.id === currentId)
    const targetIdx = direction === "next" ? idx + 1 : idx - 1
    if (targetIdx < 0 || targetIdx >= checklistSections.length) return

    const targetId = checklistSections[targetIdx].id
    setOpenSections([targetId])

    requestAnimationFrame(() => {
      const el = sectionRefs.current[targetId]
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para lista
      </Button>

      {/* Student selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Aluno</label>
        <StudentCombobox
          students={students}
          value={selectedStudentId}
          onChange={setSelectedStudentId}
        />
      </div>

      {/* Progress bar */}
      <div className="space-y-2 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progresso geral</span>
          <span className="text-muted-foreground">
            {progress.answered}/{TOTAL_ITEMS} itens ({progress.totalPercent}%)
          </span>
        </div>
        <Progress value={progress.totalPercent} className="h-2" />
      </div>

      {/* Accordion sections */}
      <Accordion
        type="multiple"
        value={openSections}
        onValueChange={setOpenSections}
        className="space-y-2"
      >
        {checklistSections.map((section, sIdx) => {
          const sectionProgress = progress.bySections[sIdx]
          const sectionItems = items.filter((i) => i.sectionId === section.id)

          return (
            <AccordionItem
              key={section.id}
              value={section.id}
              ref={(el) => { sectionRefs.current[section.id] = el }}
              className="rounded-lg border border-border px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{section.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {sectionProgress.answered}/{sectionProgress.total}
                  </span>
                  {sectionProgress.pendingObservations > 0 && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      {sectionProgress.pendingObservations} pendência{sectionProgress.pendingObservations > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-4 text-sm text-muted-foreground">{section.description}</p>
                <div className="space-y-3">
                  {section.items.map((item) => {
                    const state = sectionItems.find((i) => i.itemId === item.id)!
                    return (
                      <ChecklistItem
                        key={item.id}
                        item={item}
                        answer={state.answer}
                        observation={state.observation}
                        onAnswerChange={(answer) =>
                          updateItem(section.id, item.id, { answer })
                        }
                        onObservationChange={(observation) =>
                          updateItem(section.id, item.id, { observation })
                        }
                      />
                    )
                  })}
                </div>
                {/* Section navigation */}
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={sIdx === 0}
                    onClick={() => navigateSection(section.id, "prev")}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={sIdx === checklistSections.length - 1}
                    onClick={() => navigateSection(section.id, "next")}
                  >
                    Próximo
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      {/* Action buttons */}
      <div className="flex items-center gap-3 rounded-lg border border-border p-4">
        <Button variant="outline" onClick={handleSaveDraft} disabled={saving || finalizing}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Rascunho"}
        </Button>
        <Button onClick={handleFinalize} disabled={saving || finalizing}>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {finalizing ? "Finalizando..." : "Finalizar Avaliação"}
        </Button>
      </div>
    </div>
  )
}

export function AvaliacoesPage() {
  const { students, preselectedStudentId, ponderations } = useLoaderData() as AvaliacoesLoaderData
  const [mode, setMode] = useState<"list" | "form">(
    preselectedStudentId ? "form" : "list",
  )
  const [listData, setListData] = useState<PonderationListItem[]>(ponderations)

  function handleBackToList() {
    // Re-fetch ponderations to get the latest data
    fetch("/api/ponderations", { credentials: "include" })
      .then((res) => res.json())
      .then(({ data }) => setListData(data))
      .catch(() => {})
    setMode("list")
  }

  if (mode === "form") {
    return (
      <ChecklistForm
        students={students}
        preselectedStudentId={preselectedStudentId}
        onBack={handleBackToList}
      />
    )
  }

  return (
    <PonderationsList
      ponderations={listData}
      onNewEvaluation={() => setMode("form")}
    />
  )
}
