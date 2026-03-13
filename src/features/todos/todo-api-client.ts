import { ZodError } from "zod";
import {
  apiErrorSchema,
  createTodoInputSchema,
  createTodoResponseSchema,
  listTodosResponseSchema,
  type ApiError,
  type CreateTodoInput,
  type CreateTodoResponse,
  type ListTodosResponse,
} from "@/features/todos/todo-schema";

export class ApiClientError extends Error {
  status: number;
  issues?: ApiError["issues"];

  constructor(message: string, status: number, issues?: ApiError["issues"]) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.issues = issues;
  }
}

async function parseResponse<T>(
  response: Response,
  parse: (payload: unknown) => T,
  fallbackMessage: string,
): Promise<T> {
  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    throw new ApiClientError("Expected a JSON response from the API.", response.status);
  }

  if (!response.ok) {
    const apiError = apiErrorSchema.safeParse(payload);

    if (apiError.success) {
      throw new ApiClientError(apiError.data.message, response.status, apiError.data.issues);
    }

    throw new ApiClientError(fallbackMessage, response.status);
  }

  return parse(payload);
}

export async function listTodos(): Promise<ListTodosResponse> {
  const response = await fetch("/api/todos", {
    headers: {
      accept: "application/json",
    },
  });

  return parseResponse(
    response,
    (payload) => listTodosResponseSchema.parse(payload),
    "Failed to load todos.",
  );
}

export async function createTodo(input: CreateTodoInput): Promise<CreateTodoResponse> {
  const payload = createTodoInputSchema.parse(input);

  const response = await fetch("/api/todos", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(
    response,
    (value) => createTodoResponseSchema.parse(value),
    "Failed to create a todo.",
  );
}

export function isSchemaError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}
