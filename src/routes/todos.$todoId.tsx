import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle2, CircleDashed } from 'lucide-react'
import { todoQueryOptions } from '@/features/todos/todo.query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

const formatCreatedAt = (value: string) => {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

const TodoDetailPage = () => {
  const { item: todo } = Route.useLoaderData()

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link to="/">
          <ArrowLeft className="size-4" />
          Back to todos
        </Link>
      </Button>

      <Card className="border-border/70 bg-card/85 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            {todo.completed ? (
              <CheckCircle2 className="size-5 text-primary" />
            ) : (
              <CircleDashed className="size-5 text-muted-foreground" />
            )}
            <CardTitle className="text-2xl">{todo.title}</CardTitle>
          </div>
          <CardDescription>
            Added {formatCreatedAt(todo.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge
            variant={todo.completed ? 'secondary' : 'outline'}
            className="rounded-full"
          >
            {todo.completed ? 'Completed' : 'Open'}
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/todos/$todoId')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(todoQueryOptions(params.todoId)),
  component: TodoDetailPage
})
