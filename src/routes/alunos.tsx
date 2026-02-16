import { useState, useCallback } from "react"
import { useLoaderData, useRevalidator, useSearchParams } from "react-router"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Link2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StudentFormSheet } from "@/components/student-form-sheet"
import type { Student, StudentListResponse, StudentStatus } from "@/lib/types"

const statusConfig: Record<StudentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Ativo", variant: "default" },
  in_review: { label: "Em Revisão", variant: "secondary" },
  approved: { label: "Aprovado", variant: "outline" },
  inactive: { label: "Inativo", variant: "destructive" },
}

export async function alunosLoader({ request }: { request: Request }): Promise<StudentListResponse> {
  const url = new URL(request.url)
  const search = url.searchParams.get("search") ?? ""
  const apiUrl = `/api/students?search=${encodeURIComponent(search)}&limit=50`
  const res = await fetch(apiUrl, { credentials: "include" })
  if (!res.ok) throw new Error("Failed to load students")
  return res.json()
}

export function AlunosPage() {
  const { data: students } = useLoaderData() as StudentListResponse
  const revalidator = useRevalidator()
  const [searchParams, setSearchParams] = useSearchParams()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [searchValue, setSearchValue] = useState(searchParams.get("search") ?? "")

  const reload = useCallback(() => revalidator.revalidate(), [revalidator])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearchParams(searchValue ? { search: searchValue } : {})
  }

  function handleEdit(student: Student) {
    setEditStudent(student)
    setSheetOpen(true)
  }

  function handleNewStudent() {
    setEditStudent(null)
    setSheetOpen(true)
  }

  async function handleDelete(student: Student) {
    if (!confirm(`Excluir ${student.name}? Esta ação não pode ser desfeita.`)) return

    const res = await fetch(`/api/students/${student.id}`, {
      method: "DELETE",
      credentials: "include",
    })

    if (res.ok) {
      toast.success("Aluno excluído")
      reload()
    } else {
      toast.error("Erro ao excluir aluno")
    }
  }

  function handleCopyLink(token: string) {
    const url = `${window.location.origin}/aluno/${token}`
    navigator.clipboard.writeText(url)
    toast.success("Link copiado!")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou curso..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
        </form>
        <div className="ml-auto">
          <Button onClick={handleNewStudent}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Aluno
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Curso</TableHead>
              <TableHead className="hidden lg:table-cell">Tema</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Nenhum aluno encontrado
                </TableCell>
              </TableRow>
            )}
            {students.map((student) => {
              const status = statusConfig[student.status]
              return (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{student.email}</TableCell>
                  <TableCell className="hidden md:table-cell">{student.course}</TableCell>
                  <TableCell className="hidden lg:table-cell max-w-48 truncate">{student.projectTopic}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopyLink(student.publicToken)}
                        title="Copiar link público"
                      >
                        <Link2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(student)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(student)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <StudentFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        student={editStudent}
        onSuccess={reload}
      />
    </div>
  )
}
