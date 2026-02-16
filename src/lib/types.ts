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
