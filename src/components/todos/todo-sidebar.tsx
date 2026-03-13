import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export function TodoSidebar() {
  return (
    <div className="grid gap-6">
      <Card className="border-border/70 bg-card/85 shadow-sm">
        <CardHeader>
          <Badge variant="outline" className="mb-2 w-fit rounded-full">
            Files to copy
          </Badge>
          <CardTitle className="text-xl">Starter pattern</CardTitle>
          <CardDescription>
            These files show the full server-schema-client-query loop for a new
            resource.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {[
            'src/features/todos/todo.schema.ts',
            'src/routes/api/todos.ts',
            'src/features/todos/todo.api.ts',
            'src/features/todos/todo.query.ts',
            'src/features/todos/todos.page.tsx'
          ].map((path) => (
            <div
              key={path}
              className="rounded-xl border border-border/70 bg-background/70 px-3 py-2"
            >
              <code>{path}</code>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/85 shadow-sm">
        <CardHeader>
          <Badge variant="outline" className="mb-2 w-fit rounded-full">
            Already wired
          </Badge>
          <CardTitle className="text-xl">Starter guarantees</CardTitle>
          <CardDescription>
            Swap the in-memory store for a real database later without changing
            the client contract shape.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="rounded-xl border border-border/70 bg-background/70 p-3">
            <p className="font-medium text-foreground">
              pnpm + VitePlus workflow
            </p>
            <p>
              Use <code>vp dev</code>, <code>vp check</code>, and{' '}
              <code>vp test</code>.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/70 p-3">
            <p className="font-medium text-foreground">Runtime API contracts</p>
            <p>Shared request and response schemas live next to the feature.</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/70 p-3">
            <p className="font-medium text-foreground">
              React Query invalidation
            </p>
            <p>
              The create mutation refreshes the list from the server without
              manual syncing.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
