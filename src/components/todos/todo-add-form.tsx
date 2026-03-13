import { useState } from 'react'
import { AlertCircle, Plus, ShieldCheck } from 'lucide-react'
import { ApiClientError, isSchemaError } from '@/features/todos/todo.api'
import { useCreateTodoMutation } from '@/features/todos/todo.query'
import { createTodoInputSchema } from '@/features/todos/todo.schema'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function TodoAddForm() {
  const createTodoMutation = useCreateTodoMutation()
  const [title, setTitle] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const canSubmit = title.trim().length > 0

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

  const mutationIssue = getMutationIssue(createTodoMutation.error)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    const parsed = createTodoInputSchema.safeParse({ title })

    if (!parsed.success) {
      setFieldError(
        parsed.error.flatten().fieldErrors.title?.[0] ?? 'Invalid todo title.'
      )
      return
    }

    setFieldError(null)

    createTodoMutation.mutate(parsed.data, {
      onSuccess: () => {
        setTitle('')
      }
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="todo-title">
            New todo
          </label>
          <Input
            id="todo-title"
            name="title"
            placeholder="Add the next thing this starter should prove"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value)
              if (fieldError && event.target.value.trim().length > 0) {
                setFieldError(null)
              }
            }}
          />
        </div>
        <Button
          className="mt-auto min-w-32"
          disabled={createTodoMutation.isPending || !canSubmit}
          type="submit"
        >
          {createTodoMutation.isPending ? (
            'Adding...'
          ) : (
            <>
              <Plus className="size-4" />
              Add todo
            </>
          )}
        </Button>
      </div>

      {fieldError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Input failed validation</AlertTitle>
          <AlertDescription>{fieldError}</AlertDescription>
        </Alert>
      ) : null}

      {mutationIssue && !fieldError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Mutation failed</AlertTitle>
          <AlertDescription>{mutationIssue}</AlertDescription>
        </Alert>
      ) : null}

      <Alert className="border-border/70 bg-muted/50">
        <ShieldCheck className="size-4 text-primary" />
        <AlertTitle>Validated end to end</AlertTitle>
        <AlertDescription>
          The form validates with Zod before submit. The API route validates the
          same payload again before mutating server state.
        </AlertDescription>
      </Alert>
    </form>
  )
}
