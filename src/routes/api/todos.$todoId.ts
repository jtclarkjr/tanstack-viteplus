import { eq } from 'drizzle-orm'
import { createFileRoute } from '@tanstack/react-router'
import {
  deleteTodoResponseSchema,
  getTodoResponseSchema,
  updateTodoInputSchema,
  updateTodoResponseSchema
} from '@/features/todos/todo.schema'
import {
  handleApiError,
  notFound,
  parseInput,
  parseJsonBody
} from '@/lib/server/api-error'
import { db } from '@/lib/server/db'
import { todo } from '@/lib/server/schema'

const toTodo = (row: typeof todo.$inferSelect) => ({
  ...row,
  createdAt: row.createdAt.toISOString()
})

type TodoRouteContext = {
  params: {
    todoId: string
  }
  request: Request
}

export const getTodoHandler = async ({ params, request }: TodoRouteContext) => {
  try {
    const rows = await db.select().from(todo).where(eq(todo.id, params.todoId))

    if (!rows[0]) {
      throw notFound('Todo not found.', {
        code: 'todo_not_found',
        details: { todoId: params.todoId }
      })
    }

    return Response.json(getTodoResponseSchema.parse({ item: toTodo(rows[0]) }))
  } catch (error) {
    return handleApiError(error, request)
  }
}

export const updateTodoHandler = async ({
  params,
  request
}: TodoRouteContext) => {
  try {
    const payload = await parseJsonBody(request)
    const input = parseInput(updateTodoInputSchema, payload)
    const rows = await db
      .update(todo)
      .set(input)
      .where(eq(todo.id, params.todoId))
      .returning()

    if (!rows[0]) {
      throw notFound('Todo not found.', {
        code: 'todo_not_found',
        details: { todoId: params.todoId }
      })
    }

    return Response.json(
      updateTodoResponseSchema.parse({ item: toTodo(rows[0]) })
    )
  } catch (error) {
    return handleApiError(error, request)
  }
}

export const deleteTodoHandler = async ({
  params,
  request
}: TodoRouteContext) => {
  try {
    const rows = await db
      .delete(todo)
      .where(eq(todo.id, params.todoId))
      .returning()

    if (!rows[0]) {
      throw notFound('Todo not found.', {
        code: 'todo_not_found',
        details: { todoId: params.todoId }
      })
    }

    return Response.json(
      deleteTodoResponseSchema.parse({ item: toTodo(rows[0]) })
    )
  } catch (error) {
    return handleApiError(error, request)
  }
}

export const Route = createFileRoute('/api/todos/$todoId')({
  server: {
    handlers: {
      GET: getTodoHandler,
      PATCH: updateTodoHandler,
      DELETE: deleteTodoHandler
    }
  }
})
