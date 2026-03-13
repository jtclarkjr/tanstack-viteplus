# TanStack Start + VitePlus Boilerplate

This starter keeps the app small while showing the full pattern for a validated internal API:

- TanStack Start with file-based routing
- React Query for client-side reads and writes
- Zod as the shared runtime contract for request and response payloads
- pnpm as the package manager of record
- Vite+ as the day-to-day workflow wrapper (Required and can be installed from [here](https://viteplus.dev))

## Commands

```bash
vp dev
vp build
vp preview
vp check
vp test
```

If you change `package.json`, refresh dependencies with:

```bash
vp install
```

## How this was scaffolded

Vite+ currently resolves `vp create @tanstack/start` through the TanStack Start generator package, so the working scaffold command for this repo was:

```bash
vp create @tanstack/start -- boilerplate-tanstack-start-viteplus --package-manager pnpm --add-ons tanstack-query --no-examples --no-git -f
```

After scaffolding, the stock Tailwind and example UI pieces were removed so the repo can act as a smaller boilerplate.

## Project shape

The todo feature is the reference implementation for adding new resources:

- `src/routes/api/todos.ts`: internal JSON API route
- `src/features/todos/todo-schema.ts`: shared Zod schemas and inferred types
- `src/features/todos/todo-store.ts`: in-memory server data store
- `src/features/todos/todo-api-client.ts`: typed fetch wrapper with runtime parsing
- `src/features/todos/todo-query.ts`: React Query options and mutation invalidation
- `src/features/todos/todos-page.tsx`: UI that exercises the whole flow

## What the example proves

1. The browser validates form input with `createTodoInputSchema`
2. The API route validates the same payload again on the server
3. The API route validates its own JSON response shape before returning it
4. The client parses the response with the same Zod schemas before exposing it to React Query

That gives you runtime guarantees for `GET /api/todos` and `POST /api/todos`, not just compile-time TypeScript hints.

## Adding another resource

Copy the same pattern when you need a second domain object:

1. Create a schema module with request and response contracts
2. Add a Start API route in `src/routes/api/*`
3. Add a typed client wrapper that parses responses with Zod
4. Expose query options and mutations from a small React Query module
5. Build a route or component that consumes those hooks

## Agents

Vite+ currently allows to generate agent markdown files `vp config`

```bash
vp config --help
```

```bash
vp create @tanstack/start -- boilerplate-tanstack-start-viteplus --package-manager pnpm --add-ons tanstack-query --no-examples --no-git -f
```

## Testing

Tests cover the two critical layers:

- schema and API client validation behavior
- UI query and mutation flow with mocked `fetch`

Run them with:

```bash
vp test
```
