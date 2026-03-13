import { useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  DatabaseZap,
  Pencil,
  Plus,
  Save,
  Server,
  ShieldCheck,
  Trash2,
  X
} from 'lucide-react'
import { ApiClientError, isSchemaError } from '@/features/todos/todo.api'
import {
  useCreateTodoMutation,
  useDeleteTodoMutation,
  useTodosQuery,
  useUpdateTodoMutation
} from '@/features/todos/todo.query'
import {
  createTodoInputSchema,
  updateTodoInputSchema
} from '@/features/todos/todo.schema'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

export function TodosPage() {
  const todosQuery = useTodosQuery()
  const createTodoMutation = useCreateTodoMutation()
  const updateTodoMutation = useUpdateTodoMutation()
  const deleteTodoMutation = useDeleteTodoMutation()
  const [title, setTitle] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const canSubmit = title.trim().length > 0
  const canSaveEdit = editTitle.trim().length > 0

  function getMutationIssue(error: unknown) {
    return error instanceof ApiClientError
      ? (error.issues?.['title']?.[0] ?? error.message)
      : isSchemaError(error)
        ? (error.issues[0]?.message ??
          'The API returned an unexpected payload.')
        : error instanceof Error
          ? error.message
          : null
  }

  const mutationIssue =
    getMutationIssue(createTodoMutation.error) ??
    getMutationIssue(updateTodoMutation.error) ??
    getMutationIssue(deleteTodoMutation.error)

  const items = todosQuery.data?.items ?? []

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

  function startEditingTodo(id: string, currentTitle: string) {
    setEditingTodoId(id)
    setEditTitle(currentTitle)
    setEditError(null)
  }

  function cancelEditingTodo() {
    setEditingTodoId(null)
    setEditTitle('')
    setEditError(null)
  }

  function handleUpdateTodo(todoId: string) {
    const parsed = updateTodoInputSchema.safeParse({ title: editTitle })

    if (!parsed.success) {
      setEditError(
        parsed.error.flatten().fieldErrors.title?.[0] ?? 'Invalid todo title.'
      )
      return
    }

    setEditError(null)

    updateTodoMutation.mutate(
      {
        id: todoId,
        input: parsed.data
      },
      {
        onSuccess: () => {
          cancelEditingTodo()
        }
      }
    )
  }

  function toggleTodoCompleted(todoId: string, completed: boolean) {
    updateTodoMutation.mutate({
      id: todoId,
      input: { completed }
    })
  }

  function handleDeleteTodo(todoId: string) {
    deleteTodoMutation.mutate(
      { id: todoId },
      {
        onSuccess: () => {
          if (editingTodoId === todoId) {
            cancelEditingTodo()
          }
        }
      }
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 shadow-sm backdrop-blur">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute -right-16 top-8 size-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-12 bottom-0 size-56 rounded-full bg-accent/70 blur-3xl" />
        <div className="relative grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.8fr)] lg:px-10 lg:py-10">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="rounded-full bg-background/70 px-3 py-1"
              >
                TanStack Start + VitePlus
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                shadcn/ui
              </Badge>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                React Query, shared Zod contracts, and shadcn/ui in one starter.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                This boilerplate keeps the app small, but it ships a complete
                pattern: validated internal API routes, typed client parsing,
                React Query invalidation, and a Tailwind + shadcn UI baseline
                you can extend immediately.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="bg-background/70">
                <CardContent className="flex items-center gap-3 px-4 py-4">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <DatabaseZap className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">pnpm workflow</p>
                    <p className="text-sm text-muted-foreground">
                      `vp dev`, `vp check`, `vp test`
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-background/70">
                <CardContent className="flex items-center gap-3 px-4 py-4">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Shared schemas</p>
                    <p className="text-sm text-muted-foreground">
                      Requests and responses validated
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-background/70">
                <CardContent className="flex items-center gap-3 px-4 py-4">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Server className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Internal API</p>
                    <p className="text-sm text-muted-foreground">
                      `GET` and `POST /api/todos`
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="self-start border-border/70 bg-background/80 shadow-sm">
            <CardHeader>
              <Badge variant="outline" className="mb-2 w-fit rounded-full">
                Core starter pattern
              </Badge>
              <CardTitle className="text-lg">What this page proves</CardTitle>
              <CardDescription>
                The UI consumes the same contracts your server returns, then
                refreshes from the source of truth after every write.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3 rounded-xl bg-muted/60 p-3">
                <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                <span>
                  Client-side Zod validation before the mutation fires
                </span>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-muted/60 p-3">
                <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                <span>
                  Server-side request and response validation in the route
                </span>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-muted/60 p-3">
                <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                <span>
                  React Query invalidation instead of local optimistic
                  bookkeeping
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.9fr)]">
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
                  The form validates with Zod before submit. The API route
                  validates the same payload again before mutating server state.
                </AlertDescription>
              </Alert>
            </form>

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
                    <Card
                      key={todo.id}
                      className="border-border/70 bg-background/75 shadow-none"
                    >
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
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <Button
                            aria-label={
                              todo.completed
                                ? 'Mark todo as open'
                                : 'Mark todo as completed'
                            }
                            disabled={
                              updateTodoMutation.isPending ||
                              deleteTodoMutation.isPending
                            }
                            onClick={() =>
                              toggleTodoCompleted(todo.id, !todo.completed)
                            }
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            {todo.completed ? 'Reopen' : 'Complete'}
                          </Button>
                          <Button
                            aria-label={`Edit ${todo.title}`}
                            disabled={deleteTodoMutation.isPending}
                            onClick={() =>
                              startEditingTodo(todo.id, todo.title)
                            }
                            size="icon"
                            type="button"
                            variant="outline"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            aria-label={`Delete ${todo.title}`}
                            disabled={deleteTodoMutation.isPending}
                            onClick={() => handleDeleteTodo(todo.id)}
                            size="icon"
                            type="button"
                            variant="outline"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </CardContent>
                      {editingTodoId === todo.id ? (
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
                                  if (
                                    editError &&
                                    event.target.value.trim().length > 0
                                  ) {
                                    setEditError(null)
                                  }
                                }}
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <Button
                                disabled={
                                  updateTodoMutation.isPending || !canSaveEdit
                                }
                                onClick={() => handleUpdateTodo(todo.id)}
                                type="button"
                              >
                                <Save className="size-4" />
                                Save
                              </Button>
                              <Button
                                onClick={cancelEditingTodo}
                                type="button"
                                variant="ghost"
                              >
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
                  ))}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-border/70 bg-card/85 shadow-sm">
            <CardHeader>
              <Badge variant="outline" className="mb-2 w-fit rounded-full">
                Files to copy
              </Badge>
              <CardTitle className="text-xl">Starter pattern</CardTitle>
              <CardDescription>
                These files show the full server-schema-client-query loop for a
                new resource.
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
                Swap the in-memory store for a real database later without
                changing the client contract shape.
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
                <p className="font-medium text-foreground">
                  Runtime API contracts
                </p>
                <p>
                  Shared request and response schemas live next to the feature.
                </p>
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
      </section>
    </main>
  )
}
