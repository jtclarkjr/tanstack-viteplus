import { ZodError } from 'zod'
import {
  apiErrorSchema,
  createTodoInputSchema,
  createTodoResponseSchema,
  deleteTodoResponseSchema,
  getTodoResponseSchema,
  listTodosResponseSchema,
  updateTodoInputSchema,
  updateTodoResponseSchema,
  type ApiError,
  type CreateTodoInput,
  type CreateTodoResponse,
  type DeleteTodoResponse,
  type GetTodoResponse,
  type ListTodosResponse,
  type UpdateTodoInput,
  type UpdateTodoResponse
} from '@/features/todos/todo.schema'

export class ApiClientError extends Error {
  status: number
  issues?: ApiError['issues']

  constructor(message: string, status: number, issues?: ApiError['issues']) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.issues = issues
  }
}

async function parseResponse<T>(
  response: Response,
  parse: (payload: unknown) => T,
  fallbackMessage: string
): Promise<T> {
  let payload: unknown = null

  try {
    payload = await response.json()
  } catch {
    throw new ApiClientError(
      'Expected a JSON response from the API.',
      response.status
    )
  }

  if (!response.ok) {
    const apiError = apiErrorSchema.safeParse(payload)

    if (apiError.success) {
      throw new ApiClientError(
        apiError.data.message,
        response.status,
        apiError.data.issues
      )
    }

    throw new ApiClientError(fallbackMessage, response.status)
  }

  return parse(payload)
}

export async function getTodo(id: string): Promise<GetTodoResponse> {
  const response = await fetch(`/api/todos/${id}`, {
    headers: {
      accept: 'application/json'
    }
  })

  return parseResponse(
    response,
    (payload) => getTodoResponseSchema.parse(payload),
    'Failed to load the todo.'
  )
}

export async function listTodos(): Promise<ListTodosResponse> {
  const response = await fetch('/api/todos', {
    headers: {
      accept: 'application/json'
    }
  })

  return parseResponse(
    response,
    (payload) => listTodosResponseSchema.parse(payload),
    'Failed to load todos.'
  )
}

export async function createTodo(
  input: CreateTodoInput
): Promise<CreateTodoResponse> {
  const payload = createTodoInputSchema.parse(input)

  const response = await fetch('/api/todos', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  return parseResponse(
    response,
    (value) => createTodoResponseSchema.parse(value),
    'Failed to create a todo.'
  )
}

export async function updateTodo(
  id: string,
  input: UpdateTodoInput
): Promise<UpdateTodoResponse> {
  const payload = updateTodoInputSchema.parse(input)

  const response = await fetch(`/api/todos/${id}`, {
    method: 'PATCH',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  return parseResponse(
    response,
    (value) => updateTodoResponseSchema.parse(value),
    'Failed to update the todo.'
  )
}

export async function deleteTodo(id: string): Promise<DeleteTodoResponse> {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'DELETE',
    headers: {
      accept: 'application/json'
    }
  })

  return parseResponse(
    response,
    (value) => deleteTodoResponseSchema.parse(value),
    'Failed to delete the todo.'
  )
}

export function isSchemaError(error: unknown): error is ZodError {
  return error instanceof ZodError
}
