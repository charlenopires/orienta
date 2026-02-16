import { useParams } from "react-router"

export function PortalPage() {
  const { token } = useParams()

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Portal do Aluno</h1>
      <p className="mt-2 text-muted-foreground">
        Token: <code className="rounded bg-muted px-2 py-1 text-sm">{token}</code>
      </p>
    </div>
  )
}
