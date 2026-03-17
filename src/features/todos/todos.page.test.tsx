import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter
} from '@tanstack/react-router'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider } from '@/providers/theme-provider'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { TodosPage } from '@/features/todos/todos.page'

const fetchMock = vi.fn<typeof fetch>()

vi.stubGlobal('fetch', fetchMock)

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity
      },
      mutations: {
        retry: false,
        gcTime: Infinity
      }
    }
  })
}

const createTestRouter = () => {
  const rootRoute = createRootRoute()
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: TodosPage
  })
  const todoDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/todos/$todoId',
    component: () => null
  })

  rootRoute.addChildren([indexRoute, todoDetailRoute])

  return createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] })
  })
}

const renderPage = () => {
  const queryClient = createTestQueryClient()
  const router = createTestRouter()

  render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  )

  return { queryClient }
}

describe('TodosPage', () => {
  afterEach(() => {
    fetchMock.mockReset()
  })

  it('renders seeded todos and refreshes the list after a successful create', async () => {
    const todos = [
      {
        id: 'todo-router',
        title: 'Inspect the generated route tree before changing layouts',
        completed: false,
        createdAt: '2026-03-13T09:00:00.000Z'
      },
      {
        id: 'todo-query',
        title: 'Keep server data behind React Query hooks',
        completed: true,
        createdAt: '2026-03-13T09:01:00.000Z'
      }
    ]

    fetchMock.mockImplementation(async (input, init) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.pathname
            : input.url

      if (url === '/api/todos' && (!init?.method || init.method === 'GET')) {
        return new Response(JSON.stringify({ items: todos }), {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        })
      }

      if (url === '/api/todos' && init?.method === 'POST') {
        const body = JSON.parse(
          typeof init.body === 'string' ? init.body : '{}'
        )
        const created = {
          id: 'todo-new',
          title: body.title,
          completed: false,
          createdAt: '2026-03-13T10:00:00.000Z'
        }

        todos.unshift(created)

        return new Response(JSON.stringify({ item: created }), {
          status: 201,
          headers: {
            'content-type': 'application/json'
          }
        })
      }

      throw new Error(`Unhandled fetch ${String(init?.method ?? 'GET')} ${url}`)
    })

    renderPage()

    await screen.findByText(
      'Inspect the generated route tree before changing layouts'
    )
    expect(
      screen.getByText('Keep server data behind React Query hooks')
    ).toBeTruthy()

    fireEvent.change(screen.getByLabelText('New todo'), {
      target: { value: 'Document the Zod response contract' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add todo' }))

    await screen.findByText('Document the Zod response contract')
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })
  })

  it('shows client-side validation and skips create when the form is submitted empty', async () => {
    const todos = [
      {
        id: 'todo-router',
        title: 'Inspect the generated route tree before changing layouts',
        completed: false,
        createdAt: '2026-03-13T09:00:00.000Z'
      }
    ]

    fetchMock.mockImplementation(async (input, init) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.pathname
            : input.url

      if (url === '/api/todos' && (!init?.method || init.method === 'GET')) {
        return new Response(JSON.stringify({ items: todos }), {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        })
      }

      throw new Error(`Unhandled fetch ${String(init?.method ?? 'GET')} ${url}`)
    })

    renderPage()

    await screen.findByText(
      'Inspect the generated route tree before changing layouts'
    )

    const createForm = screen.getByLabelText('New todo').closest('form')

    if (!createForm) {
      throw new Error('Expected create form to be rendered')
    }

    fireEvent.submit(createForm)

    await screen.findByText('Give the todo a title.')
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  it('updates and deletes todos from the list', async () => {
    const todos = [
      {
        id: 'todo-router',
        title: 'Inspect the generated route tree before changing layouts',
        completed: false,
        createdAt: '2026-03-13T09:00:00.000Z'
      },
      {
        id: 'todo-query',
        title: 'Keep server data behind React Query hooks',
        completed: true,
        createdAt: '2026-03-13T09:01:00.000Z'
      }
    ]

    fetchMock.mockImplementation(async (input, init) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.pathname
            : input.url
      const method = init?.method ?? 'GET'

      if (url === '/api/todos' && method === 'GET') {
        return new Response(JSON.stringify({ items: todos }), {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        })
      }

      if (url === '/api/todos/todo-router' && method === 'PATCH') {
        const body = JSON.parse(
          typeof init?.body === 'string' ? init.body : '{}'
        )
        const todo = todos.find((item) => item.id === 'todo-router')

        if (!todo) {
          throw new Error('Todo not found')
        }

        Object.assign(todo, body)

        return new Response(JSON.stringify({ item: todo }), {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        })
      }

      if (url === '/api/todos/todo-query' && method === 'DELETE') {
        const index = todos.findIndex((item) => item.id === 'todo-query')
        const [removed] = todos.splice(index, 1)

        return new Response(JSON.stringify({ item: removed }), {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        })
      }

      throw new Error(`Unhandled fetch ${String(method)} ${url}`)
    })

    renderPage()

    await screen.findByText(
      'Inspect the generated route tree before changing layouts'
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Edit Inspect the generated route tree before changing layouts'
      })
    )
    fireEvent.change(screen.getByLabelText('Edit title'), {
      target: { value: 'Inspect the generated route tree after CRUD changes' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await screen.findByText(
      'Inspect the generated route tree after CRUD changes'
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Delete Keep server data behind React Query hooks'
      })
    )

    await waitFor(() => {
      expect(
        screen.queryByText('Keep server data behind React Query hooks')
      ).toBeNull()
    })
  })

  it('shows client-side validation and skips update when the edit form is submitted empty', async () => {
    const todos = [
      {
        id: 'todo-router',
        title: 'Inspect the generated route tree before changing layouts',
        completed: false,
        createdAt: '2026-03-13T09:00:00.000Z'
      }
    ]

    fetchMock.mockImplementation(async (input, init) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.pathname
            : input.url
      const method = init?.method ?? 'GET'

      if (url === '/api/todos' && method === 'GET') {
        return new Response(JSON.stringify({ items: todos }), {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        })
      }

      throw new Error(`Unhandled fetch ${String(method)} ${url}`)
    })

    renderPage()

    await screen.findByText(
      'Inspect the generated route tree before changing layouts'
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Edit Inspect the generated route tree before changing layouts'
      })
    )

    const editInput = screen.getByLabelText('Edit title')
    const editForm = editInput.closest('form')

    if (!editForm) {
      throw new Error('Expected edit form to be rendered')
    }

    fireEvent.change(editInput, {
      target: { value: '' }
    })
    fireEvent.submit(editForm)

    await screen.findByText('Give the todo a title.')
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })
})
