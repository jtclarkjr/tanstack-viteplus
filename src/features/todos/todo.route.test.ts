import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import * as todoStore from '@/features/todos/todo.store'
import { createTodoHandler } from '@/routes/api/todos'
import {
  deleteTodoHandler,
  updateTodoHandler
} from '@/routes/api/todos.$todoId'

describe('todo api route handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a 400 for an invalid JSON body', async () => {
    const response = await createTodoHandler({
      request: new Request('http://localhost/api/todos', {
        method: 'POST',
        body: '{',
        headers: {
          'content-type': 'application/json'
        }
      })
    })

    await expect(response.json()).resolves.toEqual({
      message: 'Request body must be valid JSON.'
    })
    expect(response.status).toBe(400)
  })

  it('returns a 400 for schema validation failure', async () => {
    const response = await createTodoHandler({
      request: new Request('http://localhost/api/todos', {
        method: 'POST',
        body: JSON.stringify({ title: '   ' }),
        headers: {
          'content-type': 'application/json'
        }
      })
    })

    await expect(response.json()).resolves.toEqual({
      message: 'Request body failed validation.',
      issues: {
        title: ['Give the todo a title.']
      }
    })
    expect(response.status).toBe(400)
  })

  it('returns a 404 when updating a missing todo', async () => {
    const response = await updateTodoHandler({
      params: {
        todoId: 'missing'
      },
      request: new Request('http://localhost/api/todos/missing', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated' }),
        headers: {
          'content-type': 'application/json'
        }
      })
    })

    await expect(response.json()).resolves.toEqual({
      message: 'Todo not found.'
    })
    expect(response.status).toBe(404)
  })

  it('returns a 404 when deleting a missing todo', async () => {
    const response = await deleteTodoHandler({
      params: {
        todoId: 'missing'
      },
      request: new Request('http://localhost/api/todos/missing', {
        method: 'DELETE'
      })
    })

    await expect(response.json()).resolves.toEqual({
      message: 'Todo not found.'
    })
    expect(response.status).toBe(404)
  })

  it('returns a generic 500 when the store throws unexpectedly', async () => {
    vi.spyOn(todoStore, 'createTodo').mockImplementation(() => {
      throw new Error('storage unavailable')
    })

    const response = await createTodoHandler({
      request: new Request('http://localhost/api/todos', {
        method: 'POST',
        body: JSON.stringify({ title: 'Ship logging' }),
        headers: {
          'content-type': 'application/json'
        }
      })
    })

    await expect(response.json()).resolves.toEqual({
      message: 'Something went wrong on the server.'
    })
    expect(response.status).toBe(500)
  })
})
