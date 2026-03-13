import { useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Pencil,
  Save,
  Trash2,
  X
} from 'lucide-react'
import { ApiClientError, isSchemaError } from '@/features/todos/todo.api'
import {
  useDeleteTodoMutation,
  useUpdateTodoMutation
} from '@/features/todos/todo.query'
import { updateTodoInputSchema, type Todo } from '@/features/todos/todo.schema'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

export function TodoItem({ todo }: { todo: Todo }) {
  const updateTodoMutation = useUpdateTodoMutation()
  const deleteTodoMutation = useDeleteTodoMutation()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editTitle, setEditTitle] = useState<string>('')
  const [editError, setEditError] = useState<string | null>(null)
  const canSaveEdit = editTitle.trim().length > 0

  function getMutationIssue(error: unknown) {
    if (error instanceof ApiClientError) {
      return error.issues?.['title']?.[0] ?? error.message
    }
    if (isSchemaError(error)) {
      return (
        error.issues[0]?.message ?? 'The API returned an unexpected payload.'
      )
    }
    if (error instanceof Error) {
      return error.message
    }
    return null
  }

  const mutationIssue =
    getMutationIssue(updateTodoMutation.error) ??
    getMutationIssue(deleteTodoMutation.error)

  function startEditing() {
    setIsEditing(true)
    setEditTitle(todo.title)
    setEditError(null)
  }

  function cancelEditing() {
    setIsEditing(false)
    setEditTitle('')
    setEditError(null)
  }

  function handleUpdate() {
    const parsed = updateTodoInputSchema.safeParse({ title: editTitle })

    if (!parsed.success) {
      setEditError(
        parsed.error.flatten().fieldErrors.title?.[0] ?? 'Invalid todo title.'
      )
      return
    }

    setEditError(null)

    updateTodoMutation.mutate(
      { id: todo.id, input: parsed.data },
      { onSuccess: () => cancelEditing() }
    )
  }

  function toggleCompleted() {
    updateTodoMutation.mutate({
      id: todo.id,
      input: { completed: !todo.completed }
    })
  }

  function handleDelete() {
    deleteTodoMutation.mutate(
      { id: todo.id },
      {
        onSuccess: () => {
          if (isEditing) {
            cancelEditing()
          }
        }
      }
    )
  }

  return (
    <Card className="border-border/70 bg-background/75 shadow-none">
      <CardContent className="flex items-start gap-4 px-4 py-4">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          {todo.completed ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <ArrowRight className="size-4" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{todo.title}</p>
            <Badge
              variant={todo.completed ? 'secondary' : 'outline'}
              className="rounded-full"
            >
              {todo.completed ? 'Completed' : 'Open'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Added {formatCreatedAt(todo.createdAt)}
          </p>
          {mutationIssue ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Action failed</AlertTitle>
              <AlertDescription>{mutationIssue}</AlertDescription>
            </Alert>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            aria-label={
              todo.completed ? 'Mark todo as open' : 'Mark todo as completed'
            }
            disabled={
              updateTodoMutation.isPending || deleteTodoMutation.isPending
            }
            onClick={toggleCompleted}
            size="sm"
            type="button"
            variant="outline"
          >
            {todo.completed ? 'Reopen' : 'Complete'}
          </Button>
          <Button
            aria-label={`Edit ${todo.title}`}
            disabled={deleteTodoMutation.isPending}
            onClick={startEditing}
            size="icon"
            type="button"
            variant="outline"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            aria-label={`Delete ${todo.title}`}
            disabled={deleteTodoMutation.isPending}
            onClick={handleDelete}
            size="icon"
            type="button"
            variant="outline"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
      {isEditing ? (
        <CardContent className="border-t border-border/70 px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor={`edit-${todo.id}`}
              >
                Edit title
              </label>
              <Input
                id={`edit-${todo.id}`}
                value={editTitle}
                onChange={(event) => {
                  setEditTitle(event.target.value)
                  if (editError && event.target.value.trim().length > 0) {
                    setEditError(null)
                  }
                }}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                disabled={updateTodoMutation.isPending || !canSaveEdit}
                onClick={handleUpdate}
                type="button"
              >
                <Save className="size-4" />
                Save
              </Button>
              <Button onClick={cancelEditing} type="button" variant="ghost">
                <X className="size-4" />
                Cancel
              </Button>
            </div>
          </div>
          {editError ? (
            <Alert className="mt-3" variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Update failed validation</AlertTitle>
              <AlertDescription>{editError}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  )
}
