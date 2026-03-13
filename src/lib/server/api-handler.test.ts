import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import {
  badRequest,
  buildValidationIssues,
  handleApiError
} from '@/lib/server/api-error'

describe('server api error handling', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('serializes AppError responses with the original status', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const request = new Request('http://localhost/api/todos', {
      method: 'POST'
    })
    const response = handleApiError(
      badRequest('Request body must be valid JSON.', {
        code: 'invalid_json'
      }),
      request
    )

    await expect(response.json()).resolves.toEqual({
      message: 'Request body must be valid JSON.'
    })
    expect(response.status).toBe(400)
    expect(warnSpy).toHaveBeenCalledWith(
      '[api-error]',
      expect.objectContaining({
        expected: true,
        method: 'POST',
        path: '/api/todos',
        status: 400,
        code: 'invalid_json'
      })
    )
  })

  it('converts unknown errors into a generic 500 response and logs them', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const request = new Request('http://localhost/api/todos', {
      method: 'GET'
    })
    const response = handleApiError(new Error('database offline'), request)

    await expect(response.json()).resolves.toEqual({
      message: 'Something went wrong on the server.'
    })
    expect(response.status).toBe(500)
    expect(errorSpy).toHaveBeenCalledWith(
      '[api-error]',
      expect.objectContaining({
        expected: false,
        method: 'GET',
        path: '/api/todos',
        status: 500,
        code: 'internal_server_error'
      })
    )
  })

  it('builds the current issues payload shape from field errors', () => {
    expect(
      buildValidationIssues({
        title: ['Give the todo a title.'],
        completed: undefined
      })
    ).toEqual({
      title: ['Give the todo a title.']
    })
  })
})
