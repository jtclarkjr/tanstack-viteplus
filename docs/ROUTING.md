# TanStack Start Routing and SSR

This project uses TanStack Start with file-based routing. Routes live in
`src/routes/` and are automatically collected into a generated route tree
(`src/routeTree.gen.ts`) that the router consumes in `src/router.tsx`.

## File Conventions

| File                           | Purpose                                                            |
| ------------------------------ | ------------------------------------------------------------------ |
| `src/routes/__root.tsx`        | Root layout wrapping every page (`<html>`, providers, devtools)    |
| `src/routes/index.tsx`         | The `/` route                                                      |
| `src/routes/about.tsx`         | The `/about` route                                                 |
| `src/routes/todos.$todoId.tsx` | Dynamic route `/todos/:todoId` (dot = path separator, `$` = param) |
| `src/routes/api/todos.ts`      | API route at `/api/todos` (server-only handlers)                   |

### Naming Rules

- **Flat routes** use dots as path separators: `src/routes/settings.profile.tsx`
  maps to `/settings/profile`.
- **Directory routes** use folders: `src/routes/settings/profile.tsx` also maps
  to `/settings/profile`.
- **Dynamic segments** are prefixed with `$`: `todos.$todoId.tsx` matches
  `/todos/123`.
- **Layout routes** use a double underscore prefix or `_layout.tsx` for pathless
  layout wrappers.
- **`__root.tsx`** is always the root layout and is required.

## Route Definitions

Every route file exports a `Route` created with `createFileRoute()`:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage
})

function AboutPage() {
  return <h1>About</h1>
}
```

The route path string passed to `createFileRoute()` must match the file's
location in `src/routes/`. The route tree generator validates this
automatically.

## SSR Model

TanStack Start uses **SSR with hydration** — not React Server Components.

- The server renders the full React tree to HTML on the initial request.
- The client receives the HTML, loads the JS bundle, and React **hydrates** the
  existing markup.
- After hydration, the app behaves as a client-side SPA with client-side
  navigation.

There is no `"use client"` directive. **All components are client components**
by default. There is no server/client component boundary in the component tree.

## Server-Only Code

Server logic is placed in explicit, designated locations — not in the component
tree:

### API Route Handlers

Files under `src/routes/api/` define server-only HTTP handlers:

```ts
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/todos')({
  server: {
    handlers: {
      GET: listTodosHandler,
      POST: createTodoHandler
    }
  }
})
```

These handlers receive a `Request` and return a `Response`, running exclusively
on the server.

### Server Functions (`createServerFn`)

For RPC-style server calls from components, TanStack Start provides
`createServerFn()`. These are thin server endpoints that can be called directly
from client code without manually writing fetch logic.

### Route Loaders

Routes can define a `loader` that runs on the server before rendering:

```tsx
export const Route = createFileRoute('/todos')({
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData(todosQueryOptions())
  },
  component: TodosPage
})
```

Loaders fetch data server-side so the page renders with data already available.

## Project Structure

```
src/
  routes/
    __root.tsx          # Root layout (html, head, body, providers)
    index.tsx           # / page
    api/
      todos.ts          # GET/POST /api/todos
      todos.$todoId.ts  # GET/PUT/DELETE /api/todos/:todoId
  router.tsx            # Router creation and configuration
  routeTree.gen.ts      # Auto-generated route tree (do not edit)
  features/             # Feature modules (page components, schemas, hooks)
  components/           # Shared UI components
```
