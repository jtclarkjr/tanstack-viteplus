import { createFileRoute } from '@tanstack/react-router'
import {
  createTodoInputSchema,
  createTodoResponseSchema,
  listTodosResponseSchema
} from '@/features/todos/todo.schema'
import {
  handleApiError,
  parseInput,
  parseJsonBody
} from '@/lib/server/api-error'
import { supabase } from '@/lib/server/supabase'

const toTodo = (row: {
  id: string
  title: string
  completed: boolean
  created_at: string
}) => ({
  id: row.id,
  title: row.title,
  completed: row.completed,
  createdAt: row.created_at
})

export const listTodosHandler = async ({ request }: { request: Request }) => {
  try {
    const { data, error } = await supabase
      .from('todo')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error

    return Response.json(
      listTodosResponseSchema.parse({ items: (data ?? []).map(toTodo) })
    )
  } catch (error) {
    return handleApiError(error, request)
  }
}

export const createTodoHandler = async ({ request }: { request: Request }) => {
  try {
    const payload = await parseJsonBody(request)
    const input = parseInput(createTodoInputSchema, payload)

    const { data, error } = await supabase
      .from('todo')
      .insert({ title: input.title })
      .select()
      .single()
    if (error || !data) throw error ?? new Error('Failed to create todo')

    return Response.json(
      createTodoResponseSchema.parse({ item: toTodo(data) }),
      {
        status: 201
      }
    )
  } catch (error) {
    return handleApiError(error, request)
  }
}

export const Route = createFileRoute('/api/todos')({
  server: {
    handlers: {
      GET: listTodosHandler,
      POST: createTodoHandler
    }
  }
})
