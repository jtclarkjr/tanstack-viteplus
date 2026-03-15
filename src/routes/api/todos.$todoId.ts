import { createFileRoute } from '@tanstack/react-router'
import {
  deleteTodo,
  getTodo,
  updateTodo
} from '@/features/todos/mock/todo.repository'
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

type TodoRouteContext = {
  params: {
    todoId: string
  }
  request: Request
}

export async function getTodoHandler({ params, request }: TodoRouteContext) {
  try {
    const item = getTodo(params.todoId)

    if (!item) {
      throw notFound('Todo not found.', {
        code: 'todo_not_found',
        details: { todoId: params.todoId }
      })
    }

    return Response.json(getTodoResponseSchema.parse({ item }))
  } catch (error) {
    return handleApiError(error, request)
  }
}

export async function updateTodoHandler({ params, request }: TodoRouteContext) {
  try {
    const payload = await parseJsonBody(request)
    const input = parseInput(updateTodoInputSchema, payload)
    const item = updateTodo(params.todoId, input)

    if (!item) {
      throw notFound('Todo not found.', {
        code: 'todo_not_found',
        details: { todoId: params.todoId }
      })
    }

    return Response.json(updateTodoResponseSchema.parse({ item }))
  } catch (error) {
    return handleApiError(error, request)
  }
}

export async function deleteTodoHandler({ params, request }: TodoRouteContext) {
  try {
    const item = deleteTodo(params.todoId)

    if (!item) {
      throw notFound('Todo not found.', {
        code: 'todo_not_found',
        details: { todoId: params.todoId }
      })
    }

    return Response.json(deleteTodoResponseSchema.parse({ item }))
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
