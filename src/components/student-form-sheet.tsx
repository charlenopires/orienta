import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Student } from "@/lib/types"

interface StudentFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: Student | null
  onSuccess: () => void
}

export function StudentFormSheet({ open, onOpenChange, student, onSuccess }: StudentFormSheetProps) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!student

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const payload = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      course: fd.get("course") as string,
      projectTopic: fd.get("projectTopic") as string,
      period: fd.get("period") as string,
      phone: (fd.get("phone") as string) || null,
      notes: (fd.get("notes") as string) || null,
    }

    try {
      const url = isEdit ? `/api/students/${student.id}` : "/api/students"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Erro ao salvar aluno")
        return
      }

      toast.success(isEdit ? "Aluno atualizado" : "Aluno criado")
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error("Erro ao conectar com o servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-card overflow-y-auto">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>{isEdit ? "Editar Aluno" : "Novo Aluno"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" name="name" required defaultValue={student?.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" required defaultValue={student?.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course">Curso *</Label>
            <Input id="course" name="course" required defaultValue={student?.course} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectTopic">Tema do Projeto *</Label>
            <Input id="projectTopic" name="projectTopic" required defaultValue={student?.projectTopic} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="period">Período *</Label>
            <Input id="period" name="period" required defaultValue={student?.period} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" name="phone" defaultValue={student?.phone ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Input id="notes" name="notes" defaultValue={student?.notes ?? ""} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : isEdit ? "Atualizar" : "Criar Aluno"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
