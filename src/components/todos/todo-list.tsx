import { AlertCircle, ArrowRight } from 'lucide-react'
import { useTodosQuery } from '@/features/todos/todo.query'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { TodoAddForm } from '@/components/todos/todo-add-form'
import { TodoItem } from '@/components/todos/todo-item'

export function TodoList() {
  const todosQuery = useTodosQuery()
  const items = todosQuery.data?.items ?? []

  return (
    <Card className="border-border/70 bg-card/85 shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <Badge variant="outline" className="rounded-full">
              Live example
            </Badge>
            <CardTitle className="text-2xl">Todos</CardTitle>
            <CardDescription>
              Fetched from <code>GET /api/todos</code> and updated via{' '}
              <code>POST</code>, <code>PATCH</code>, and <code>DELETE</code>{' '}
              routes.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {items.length} item{items.length === 1 ? '' : 's'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <TodoAddForm />

        <div className="space-y-4">
          {todosQuery.isPending ? (
            <Alert className="border-border/70 bg-muted/50">
              <ArrowRight className="size-4 text-primary" />
              <AlertTitle>Loading todos</AlertTitle>
              <AlertDescription>
                Loading todos from the starter API…
              </AlertDescription>
            </Alert>
          ) : null}

          {todosQuery.isError ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Query failed</AlertTitle>
              <AlertDescription>
                {todosQuery.error instanceof Error
                  ? todosQuery.error.message
                  : 'Something went wrong while loading todos.'}
              </AlertDescription>
            </Alert>
          ) : null}

          {todosQuery.isSuccess && items.length === 0 ? (
            <Card className="border-dashed bg-muted/40">
              <CardContent className="px-4 py-6 text-sm text-muted-foreground">
                The API returned an empty list. Add the first todo above.
              </CardContent>
            </Card>
          ) : null}

          {todosQuery.isSuccess && items.length > 0 ? (
            <div className="grid gap-3">
              {items.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
