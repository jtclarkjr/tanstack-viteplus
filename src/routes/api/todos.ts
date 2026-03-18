import { desc } from 'drizzle-orm'
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
import { db } from '@/lib/server/db'
import { todo } from '@/lib/server/schema'

const toTodo = (row: typeof todo.$inferSelect) => ({
  ...row,
  createdAt: row.createdAt.toISOString()
})

export const listTodosHandler = async ({ request }: { request: Request }) => {
  try {
    const rows = await db.select().from(todo).orderBy(desc(todo.createdAt))

    return Response.json(
      listTodosResponseSchema.parse({ items: rows.map(toTodo) })
    )
  } catch (error) {
    return handleApiError(error, request)
  }
}

export const createTodoHandler = async ({ request }: { request: Request }) => {
  try {
    const payload = await parseJsonBody(request)
    const input = parseInput(createTodoInputSchema, payload)
    const rows = await db
      .insert(todo)
      .values({ title: input.title })
      .returning()

    return Response.json(
      createTodoResponseSchema.parse({ item: toTodo(rows[0]) }),
      { status: 201 }
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
