import type {
  CreateTodoInput,
  Todo,
  UpdateTodoInput
} from '@/features/todos/todo.schema'

const seededAt = new Date('2026-03-13T09:00:00.000Z')

let todos: Todo[] = [
  {
    id: 'todo-router',
    title: 'Inspect the generated route tree before changing layouts',
    completed: false,
    createdAt: seededAt.toISOString()
  },
  {
    id: 'todo-query',
    title: 'Keep server data behind React Query hooks',
    completed: true,
    createdAt: new Date(seededAt.getTime() + 60_000).toISOString()
  },
  {
    id: 'todo-zod',
    title: 'Validate request and response payloads with shared Zod schemas',
    completed: false,
    createdAt: new Date(seededAt.getTime() + 120_000).toISOString()
  }
]

export function getTodo(id: string): Todo | null {
  return todos.find((todo) => todo.id === id) ?? null
}

export function listTodos(): Todo[] {
  return todos.toSorted((left, right) =>
    right.createdAt.localeCompare(left.createdAt)
  )
}

export function createTodo(input: CreateTodoInput): Todo {
  const todo: Todo = {
    id: `todo-${crypto.randomUUID()}`,
    title: input.title,
    completed: false,
    createdAt: new Date().toISOString()
  }

  todos = [todo, ...todos]

  return todo
}

export function updateTodo(id: string, input: UpdateTodoInput): Todo | null {
  const index = todos.findIndex((todo) => todo.id === id)

  if (index === -1) {
    return null
  }

  const updated: Todo = {
    ...todos[index],
    ...(input.title !== undefined ? { title: input.title } : null),
    ...(input.completed !== undefined ? { completed: input.completed } : null)
  }

  todos = todos.map((todo, todoIndex) => (todoIndex === index ? updated : todo))

  return updated
}

export function deleteTodo(id: string): Todo | null {
  const existing = todos.find((todo) => todo.id === id)

  if (!existing) {
    return null
  }

  todos = todos.filter((todo) => todo.id !== id)

  return existing
}
