import { createBrowserRouter } from "react-router"
import { requireAuth } from "@/lib/auth"
import { ProtectedLayout } from "@/layouts/protected-layout"
import { PublicLayout } from "@/layouts/public-layout"
import { LoginPage } from "@/routes/login"
import { DashboardPage, dashboardLoader } from "@/routes/dashboard"
import { AlunosPage, alunosLoader } from "@/routes/alunos"
import { AvaliacoesPage, avaliacoesLoader } from "@/routes/avaliacoes"
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
      {
        path: "dashboard",
        element: <DashboardPage />,
        loader: dashboardLoader,
        handle: { title: "Dashboard" },
      },
      {
        path: "alunos",
        element: <AlunosPage />,
        loader: alunosLoader,
        handle: { title: "Alunos" },
      },
      {
        path: "avaliacoes",
        element: <AvaliacoesPage />,
        loader: avaliacoesLoader,
        handle: { title: "Avaliações" },
      },
      {
        path: "historico",
        element: <HistoricoPage />,
        handle: { title: "Histórico" },
      },
    ],
  },
])
