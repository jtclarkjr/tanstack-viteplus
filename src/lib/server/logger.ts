import { AppError } from '@/lib/server/api-error'

export type ServerErrorLogEvent = {
  source: 'api'
  expected: boolean
  name: string
  message: string
  status: number
  method: string
  path: string
  code?: string
  issues?: Record<string, string[]>
  details?: Record<string, unknown>
  stack?: string
}

export interface ErrorLogger {
  log: (event: ServerErrorLogEvent) => void
}

export const consoleErrorLogger: ErrorLogger = {
  log(event) {
    const writer = event.expected ? console.warn : console.error
    writer('[api-error]', event)
  }
}

export function logServerError(params: {
  error: AppError
  request: Request
  unexpected: boolean
  logger?: ErrorLogger
}) {
  const { error, request, unexpected, logger = consoleErrorLogger } = params
  const url = new URL(request.url)
  const cause = (error as Error & { cause?: unknown }).cause
  const causeStack = cause instanceof Error ? cause.stack : undefined

  logger.log({
    source: 'api',
    expected: !unexpected,
    name: error.name,
    message: error.message,
    status: error.status,
    method: request.method,
    path: url.pathname,
    ...(error.code ? { code: error.code } : null),
    ...(error.issues ? { issues: error.issues } : null),
    ...(error.details ? { details: error.details } : null),
    ...(!unexpected
      ? null
      : {
          stack: causeStack ?? error.stack
        })
  })
}
