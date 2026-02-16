import { createBrowserRouter } from "react-router"
import { requireAuth } from "@/lib/auth"
import { ProtectedLayout } from "@/layouts/protected-layout"
import { PublicLayout } from "@/layouts/public-layout"
import { LoginPage } from "@/routes/login"
import { DashboardPage } from "@/routes/dashboard"
import { AlunosPage } from "@/routes/alunos"
import { AvaliacoesPage } from "@/routes/avaliacoes"
import { HistoricoPage } from "@/routes/historico"
import { PortalPage } from "@/routes/portal"

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: "aluno/:token", element: <PortalPage /> },
    ],
  },
  {
    element: <ProtectedLayout />,
    loader: requireAuth,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "alunos", element: <AlunosPage /> },
      { path: "avaliacoes", element: <AvaliacoesPage /> },
      { path: "historico", element: <HistoricoPage /> },
    ],
  },
])
