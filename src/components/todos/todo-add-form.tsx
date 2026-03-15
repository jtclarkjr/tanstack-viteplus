import { useForm } from '@tanstack/react-form'
import { AlertCircle, Plus, ShieldCheck } from 'lucide-react'
import { z } from 'zod'
import { ApiClientError, isSchemaError } from '@/features/todos/todo.api'
import { useCreateTodoMutation } from '@/features/todos/todo.query'
import { createTodoInputSchema } from '@/features/todos/todo.schema'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function TodoAddForm() {
  const createTodoMutation = useCreateTodoMutation()
  const titleSchema = createTodoInputSchema.shape.title
  const form = useForm({
    defaultValues: {
      title: ''
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await createTodoMutation.mutateAsync({
          title: value.title.trim()
        })
        formApi.reset({ title: '' })
      } catch {}
    }
  })

  function getMutationIssue(error: unknown) {
    if (error instanceof ApiClientError) {
      return error.issues?.['title']?.[0] ?? error.message
    }
    if (isSchemaError(error)) {
      const flattened = z.flattenError(error)

      return (
        flattened.formErrors[0] ??
        Object.values(flattened.fieldErrors).flat()[0] ??
        'The API returned an unexpected payload.'
      )
    }
    if (error instanceof Error) {
      return error.message
    }
    return null
  }

  const mutationIssue = getMutationIssue(createTodoMutation.error)

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <form.Field
          name="title"
          validators={{
            onChange: titleSchema,
            onSubmit: titleSchema
          }}
        >
          {(field) => {
            const rawError = field.state.meta.errors[0]
            const fieldError =
              typeof rawError === 'object' &&
              rawError !== null &&
              'message' in rawError
                ? rawError.message
                : rawError
            const shouldShowFieldError =
              Boolean(fieldError) &&
              (field.state.meta.isTouched || form.state.submissionAttempts > 0)

            return (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="todo-title">
                    New todo
                  </label>
                  <Input
                    id="todo-title"
                    name={field.name}
                    placeholder="Add the next thing this starter should prove"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.target.value)
                    }}
                    aria-invalid={shouldShowFieldError}
                  />
                </div>
                <form.Subscribe
                  selector={(state) => ({
                    isSubmitting: state.isSubmitting,
                    isValid: state.isValid,
                    title: state.values.title
                  })}
                >
                  {(state) => (
                    <Button
                      className="mt-auto min-w-32"
                      disabled={
                        createTodoMutation.isPending ||
                        state.isSubmitting ||
                        !state.isValid ||
                        state.title.trim().length === 0
                      }
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
                  )}
                </form.Subscribe>

                {shouldShowFieldError ? (
                  <Alert className="sm:col-span-2" variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertTitle>Input failed validation</AlertTitle>
                    <AlertDescription>
                      {z.string().catch('').parse(fieldError)}
                    </AlertDescription>
                  </Alert>
                ) : null}
              </>
            )
          }}
        </form.Field>
      </div>

      {mutationIssue && !form.state.fieldMeta.title?.errors?.length ? (
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
          TanStack Form validates with Zod before submit. The API route
          validates the same payload again before mutating server state.
        </AlertDescription>
      </Alert>
    </form>
  )
}
