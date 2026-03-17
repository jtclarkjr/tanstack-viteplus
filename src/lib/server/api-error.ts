import { ZodType } from 'zod'
import { logServerError, type ErrorLogger } from '@/lib/server/logger'

export type ApiErrorIssues = Record<string, string[]>

type AppErrorOptions = {
  status: number
  message: string
  code?: string
  issues?: ApiErrorIssues
  cause?: unknown
  details?: Record<string, unknown>
}

export class AppError extends Error {
  status: number
  code?: string
  issues?: ApiErrorIssues
  details?: Record<string, unknown>

  constructor({
    status,
    message,
    code,
    issues,
    cause,
    details
  }: AppErrorOptions) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.issues = issues
    this.details = details

    if (cause !== undefined) {
      ;(this as Error & { cause?: unknown }).cause = cause
    }
  }
}

export const badRequest = (
  message: string,
  options: Omit<Partial<AppErrorOptions>, 'status' | 'message'> = {}
) => {
  return new AppError({
    status: 400,
    message,
    ...options
  })
}

export const validationError = (
  message: string,
  issues?: ApiErrorIssues,
  options: Omit<Partial<AppErrorOptions>, 'status' | 'message' | 'issues'> = {}
) => {
  return new AppError({
    status: 400,
    message,
    issues,
    ...options
  })
}

export const notFound = (
  message: string,
  options: Omit<Partial<AppErrorOptions>, 'status' | 'message'> = {}
) => {
  return new AppError({
    status: 404,
    message,
    ...options
  })
}

export const internalServerError = (
  message = 'Something went wrong on the server.',
  options: Omit<Partial<AppErrorOptions>, 'status' | 'message'> = {}
) => {
  return new AppError({
    status: 500,
    message,
    ...options
  })
}

export const serializeApiError = (error: AppError) => {
  return {
    message: error.message,
    ...(error.issues ? { issues: error.issues } : null)
  }
}

export const buildValidationIssues = (
  fieldErrors: Record<string, string[] | undefined>
) => {
  return Object.fromEntries(
    Object.entries(fieldErrors).filter((entry): entry is [string, string[]] =>
      Boolean(entry[1]?.length)
    )
  )
}

export const parseJsonBody = async (request: Request): Promise<unknown> => {
  try {
    return await request.json()
  } catch (error) {
    throw badRequest('Request body must be valid JSON.', {
      code: 'invalid_json',
      cause: error
    })
  }
}

export const parseInput = <TSchema extends ZodType>(
  schema: TSchema,
  payload: unknown,
  message = 'Request body failed validation.'
) => {
  const parsed = schema.safeParse(payload)

  if (!parsed.success) {
    throw validationError(
      message,
      buildValidationIssues(parsed.error.flatten().fieldErrors),
      {
        code: 'validation_error',
        cause: parsed.error
      }
    )
  }

  return parsed.data
}

export const normalizeError = (
  error: unknown
): {
  error: AppError
  unexpected: boolean
} => {
  if (error instanceof AppError) {
    return { error, unexpected: false }
  }

  return {
    error: internalServerError('Something went wrong on the server.', {
      code: 'internal_server_error',
      cause: error
    }),
    unexpected: true
  }
}

export const handleApiError = (
  error: unknown,
  request: Request,
  options?: {
    logger?: ErrorLogger
  }
) => {
  const normalized = normalizeError(error)

  logServerError({
    error: normalized.error,
    request,
    unexpected: normalized.unexpected,
    logger: options?.logger
  })

  return Response.json(serializeApiError(normalized.error), {
    status: normalized.error.status
  })
}
