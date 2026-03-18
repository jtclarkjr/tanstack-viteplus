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

type TodoRouteContext = {
  params: {
    todoId: string
  }
  request: Request
}

export const getTodoHandler = async ({ params, request }: TodoRouteContext) => {
  try {
    const { data, error } = await supabase
      .from('todo')
      .select('*')
      .eq('id', params.todoId)
      .single()

    if (error || !data) {
      throw notFound('Todo not found.', {
        code: 'todo_not_found',
        details: { todoId: params.todoId }
      })
    }

    return Response.json(getTodoResponseSchema.parse({ item: toTodo(data) }))
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

    const { data, error } = await supabase
      .from('todo')
      .update(input)
      .eq('id', params.todoId)
      .select()
      .single()

    if (error || !data) {
      throw notFound('Todo not found.', {
        code: 'todo_not_found',
        details: { todoId: params.todoId }
      })
    }

    return Response.json(updateTodoResponseSchema.parse({ item: toTodo(data) }))
  } catch (error) {
    return handleApiError(error, request)
  }
}

export const deleteTodoHandler = async ({
  params,
  request
}: TodoRouteContext) => {
  try {
    const { data, error } = await supabase
      .from('todo')
      .delete()
      .eq('id', params.todoId)
      .select()
      .single()

    if (error || !data) {
      throw notFound('Todo not found.', {
        code: 'todo_not_found',
        details: { todoId: params.todoId }
      })
    }

    return Response.json(deleteTodoResponseSchema.parse({ item: toTodo(data) }))
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
