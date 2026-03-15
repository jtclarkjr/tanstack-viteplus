# TanStack Start + VitePlus Boilerplate

This starter keeps the app small while showing the full pattern for a validated
internal API:

Vite+ in this repo is not just a faster frontend tool wrapper. It is designed to
be AI-agent friendly: it keeps commands unified, syncs agent-facing Markdown and
hook files with `vp config`, and provides a workflow where coding agents can
work against the same project conventions and generated repo metadata. In that
sense, Vite+ is an ecosystem for agent coding as much as it is a bundled web
toolchain.

Make it a habit to reach for `vp` commands first instead of calling the package
manager directly or defaulting to `package.json` scripts. In this repo, `vp` is
the primary interface for install, dev, build, lint, format, and test workflows;
package scripts are mainly for project-specific cases such as Docker
entrypoints.

- TanStack Start with file-based routing (see
  [docs/ROUTING.md](docs/ROUTING.md))
- React Query for client-side reads and writes
- Zod as the shared runtime contract for request and response payloads
- Tailwind CSS v4 + shadcn/ui for the UI layer
- pnpm as the package manager of record (Only npm, pnpm, and yarn are compatible
  with Vite+)
- Vite+ as the day-to-day workflow wrapper (Required and can be installed from
  [here](https://viteplus.dev))

## Commands

```bash
vp dev
vp build
vp preview
vp check
vp test
```

Container-specific scripts:

```bash
pnpm run dev:docker
pnpm run storybook:docker
pnpm run start
```

If you change `package.json`, refresh dependencies with:

```bash
vp install
```

## First-time setup

For a fresh clone, dependency install and repo initialization are separate:

```bash
vp install
vp config
```

- `vp install` installs dependencies only.
- `vp config` initializes the Vite+ managed agent and hook files, including
  `.vite-hooks/` and the linked agent instruction files in the repo.

Some framework output folders are created lazily on first use rather than at
install time:

- `.tanstack/` is created by the TanStack Start toolchain during app
  runs/builds.
- `.output/` is created when you build or otherwise produce Nitro server output.

If those folders are missing in a fresh checkout, run one of the normal app
commands such as:

```bash
vp dev
# or
vp build
```

## Agent files

Generate or refresh the agent instruction files for this repo with:

```bash
vp config
```

In this project, that command is used for Vite+ agent integration and hook
setup. It refreshes the managed content and keeps the agent-facing files in
sync. By default, Vite+ installs hooks under `.vite-hooks`. Run
`vp config --help` for available options such as `--hooks-dir`.

## How this was scaffolded

Vite+ currently resolves `vp create @tanstack/start` through the TanStack Start
generator package, so the working scaffold command for this repo was:

```bash
vp create @tanstack/start -- boilerplate-tanstack-start-viteplus --package-manager pnpm --add-ons tanstack-query --no-examples --no-git -f
```

After scaffolding, Tailwind and shadcn/ui were initialized on top of the
generated app so the starter ships with a real component baseline instead of ad
hoc CSS alone.

## Docker and Compose

This repo includes both a local dev container flow and a production-like
container flow.

Development with Docker Compose:

```bash
docker compose --profile dev up --build
```

That runs `vp dev` inside the container on `0.0.0.0:3000` with the repo mounted
into `/app`.

Storybook with Docker Compose:

```bash
docker compose --profile storybook up --build
```

That runs Storybook inside the container on `0.0.0.0:6006` with the same source
mount and dependency volume as the app dev profile.

Production-like build and runtime:

```bash
docker compose --profile prod up --build
```

That builds the app with `vp build`, then runs the generated Nitro Node server
from `.output/server/index.mjs`.

Compose now uses one file with profiles:

- `app-dev` under the `dev` profile
- `app-storybook` under the `storybook` profile
- `app-prod` under the `prod` profile

Relevant runtime environment variables:

```bash
HOST=0.0.0.0
PORT=3000
NODE_ENV=production
```

The production container does not use `vp dev` or `vp preview`; it serves the
Nitro `node-server` output directly.

## Project shape

The todo feature is the reference implementation for adding new resources:

- `src/routes/api/todos.ts`: internal JSON API route
- `src/features/todos/todo.schema.ts`: shared Zod schemas and inferred types
- `src/features/todos/todo.store.ts`: in-memory server data store
- `src/features/todos/todo.api.ts`: typed fetch wrapper with runtime parsing
- `src/features/todos/todo.query.ts`: React Query options and mutation
  invalidation
- `src/features/todos/todos.page.tsx`: UI that exercises the whole flow
- `src/components/ui/*`: shadcn/ui primitives used by the starter
- `components.json`: shadcn/ui project configuration

## What the example proves

1. TanStack Form validates browser input with `createTodoInputSchema`
2. The API route validates the same payload again on the server
3. The API route validates its own JSON response shape before returning it
4. The client parses the response with the same Zod schemas before exposing it
   to React Query

That gives you runtime guarantees for `GET /api/todos` and `POST /api/todos`,
not just compile-time TypeScript hints.

## Adding another resource

Copy the same pattern when you need a second domain object:

1. Create a schema module with request and response contracts
2. Add a Start API route in `src/routes/api/*`
3. Add a typed client wrapper that parses responses with Zod
4. Expose query options and mutations from a small React Query module
5. Build a route or component that consumes those hooks

## UI baseline

This starter uses shadcn/ui with the current `start` template and the generated
`radix-nova` style. The starter currently includes:

- `button`
- `input`
- `card`
- `badge`
- `alert`

Add more shadcn components with:

```bash
pnpm dlx shadcn@latest add <component>
```

## Testing

Tests cover the two critical layers:

- schema and API client validation behavior
- UI query and mutation flow with mocked `fetch`

Run them with:

```bash
vp test
```
