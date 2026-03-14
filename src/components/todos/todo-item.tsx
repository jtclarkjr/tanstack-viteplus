import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
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
import { createTodoInputSchema, type Todo } from '@/features/todos/todo.schema'
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

function validateTodoTitle(value: string) {
  const parsed = createTodoInputSchema.shape.title.safeParse(value)

  return parsed.success
    ? undefined
    : (parsed.error.issues[0]?.message ?? 'Invalid todo title.')
}

export function TodoItem({ todo }: { todo: Todo }) {
  const updateTodoMutation = useUpdateTodoMutation()
  const deleteTodoMutation = useDeleteTodoMutation()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const editForm = useForm({
    defaultValues: {
      title: todo.title
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await updateTodoMutation.mutateAsync({
          id: todo.id,
          input: {
            title: value.title.trim()
          }
        })
        setIsEditing(false)
        formApi.reset({ title: todo.title })
      } catch {}
    }
  })

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
    editForm.reset({ title: todo.title })
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
    editForm.reset({ title: todo.title })
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
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault()
              void editForm.handleSubmit()
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <editForm.Field
                name="title"
                validators={{
                  onChange: ({ value }) => validateTodoTitle(value),
                  onSubmit: ({ value }) => validateTodoTitle(value)
                }}
              >
                {(field) => {
                  const editError = field.state.meta.errors[0]
                  const shouldShowEditError =
                    Boolean(editError) &&
                    (field.state.meta.isTouched ||
                      editForm.state.submissionAttempts > 0)

                  return (
                    <>
                      <div className="flex-1 space-y-2">
                        <label
                          className="text-sm font-medium"
                          htmlFor={`edit-${todo.id}`}
                        >
                          Edit title
                        </label>
                        <Input
                          id={`edit-${todo.id}`}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => {
                            field.handleChange(event.target.value)
                          }}
                          aria-invalid={shouldShowEditError}
                        />
                      </div>
                      <editForm.Subscribe
                        selector={(state) => ({
                          isSubmitting: state.isSubmitting,
                          isValid: state.isValid,
                          title: state.values.title
                        })}
                      >
                        {(state) => (
                          <div className="flex items-end gap-2">
                            <Button
                              disabled={
                                updateTodoMutation.isPending ||
                                state.isSubmitting ||
                                !state.isValid ||
                                state.title.trim().length === 0
                              }
                              type="submit"
                            >
                              <Save className="size-4" />
                              Save
                            </Button>
                            <Button
                              onClick={cancelEditing}
                              type="button"
                              variant="ghost"
                            >
                              <X className="size-4" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </editForm.Subscribe>
                      {shouldShowEditError ? (
                        <Alert className="sm:col-span-2" variant="destructive">
                          <AlertCircle className="size-4" />
                          <AlertTitle>Update failed validation</AlertTitle>
                          <AlertDescription>
                            {String(editError)}
                          </AlertDescription>
                        </Alert>
                      ) : null}
                    </>
                  )
                }}
              </editForm.Field>
            </div>
          </form>
        </CardContent>
      ) : null}
    </Card>
  )
}
