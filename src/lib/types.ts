export type StudentStatus = "active" | "in_review" | "approved" | "inactive"

export interface Student {
  id: string
  name: string
  email: string
  course: string
  projectTopic: string
  period: string
  phone: string | null
  pdfUrl: string | null
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

// AI Tips
export interface AiTip {
  id: string
  diagnosis: string
  howToFix: string
  practicalExample: string | null
  isFallback: boolean
}

// Ponderation detail
export interface PonderationDetailItem {
  id: string
  sectionId: string
  itemId: string
  question: string
  answer: boolean
  observation: string | null
  aiTip: AiTip | null
}

export interface PonderationDetailSection {
  sectionId: string
  sectionTitle: string
  items: PonderationDetailItem[]
}

export interface PonderationDetail {
  id: string
  studentName: string
  studentCourse: string
  studentProjectTopic: string
  scorePercent: number
  statusGeneral: "bom" | "atencao" | "critico"
  createdAt: string
  sections: PonderationDetailSection[]
}

// Ponderation list
export interface PonderationListItem {
  id: string
  studentName: string
  scorePercent: number
  statusGeneral: "bom" | "atencao" | "critico"
  createdAt: string
}

// Student portal
export interface PortalData {
  student: {
    name: string
    course: string
    projectTopic: string
  }
  ponderations: {
    id: string
    scorePercent: number
    statusGeneral: "bom" | "atencao" | "critico"
    createdAt: string
    sections: PonderationDetailSection[]
  }[]
}
