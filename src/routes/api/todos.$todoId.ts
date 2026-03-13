import { createFileRoute } from '@tanstack/react-router'
import { deleteTodo, updateTodo } from '@/features/todos/todo.store'
import {
  deleteTodoResponseSchema,
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
      PATCH: updateTodoHandler,
      DELETE: deleteTodoHandler
    }
  }
})
