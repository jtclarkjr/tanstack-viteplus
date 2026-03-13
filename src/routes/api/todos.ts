import { createFileRoute } from '@tanstack/react-router'
import { createTodo, listTodos } from '@/features/todos/todo.store'
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

export async function listTodosHandler({ request }: { request: Request }) {
  try {
    return Response.json(listTodosResponseSchema.parse({ items: listTodos() }))
  } catch (error) {
    return handleApiError(error, request)
  }
}

export async function createTodoHandler({ request }: { request: Request }) {
  try {
    const payload = await parseJsonBody(request)
    const input = parseInput(createTodoInputSchema, payload)
    const item = createTodo(input)

    return Response.json(createTodoResponseSchema.parse({ item }), {
      status: 201
    })
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
