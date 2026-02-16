export type StudentStatus = "active" | "in_review" | "approved" | "inactive"

export interface Student {
  id: string
  name: string
  email: string
  course: string
  projectTopic: string
  period: string
  phone: string | null
  notes: string | null
  publicToken: string
  status: StudentStatus
  createdAt: string
  updatedAt: string
}

export interface StudentListResponse {
  data: Student[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface DashboardStats {
  totalAlunos: number
  avaliacoesRealizadas: number
  ponderacoesMes: number
  mediaConformidade: number
  ultimasPonderacoes: PonderacaoResumo[]
}

export interface PonderacaoResumo {
  id: string
  alunoNome: string
  data: string
  positivos: number
  negativos: number
}

// Evaluation types
export interface EvaluationItemState {
  sectionId: string
  itemId: string
  answer: boolean | null
  observation: string
}

export interface Evaluation {
  id: string
  studentId: string
  status: "draft" | "finalized"
  data: EvaluationItemState[] | null
  createdAt: string
  updatedAt: string
}
