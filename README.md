# TanStack Start and Vite+ Boilerplate

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

**Note:** Vite+ is still in beta and is fully open sourced.

- TanStack Start with file-based routing (see
  [docs/ROUTING.md](docs/ROUTING.md))
- React Query for client-side reads and writes
- Zod as the shared runtime contract for request and response payloads
- Tailwind CSS v4 + shadcn/ui for the UI layer
- Bun as the package manager of record through Vite+
- Vite+ as the day-to-day workflow wrapper

## Quick start: run the demo on the host

You need Docker and the Vite+ `vp` CLI. Install `vp` once from the
[Vite+ site](https://vite.plus/):

```bash
curl -fsSL https://vite.plus | bash
```

Install the project dependencies and initialize Vite+'s managed agent and hook
files:

```bash
vp install
vp config
```

Create the local environment file:

```bash
cp .env.example .env
```

Before starting the app, make sure these three values are set in `.env`:

```dotenv
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
BETTER_AUTH_SECRET=replace-with-a-random-secret-at-least-32-characters-long
BETTER_AUTH_URL=http://localhost:3000
```

The OAuth client IDs and secrets in `.env.example` are optional. `.env` is
gitignored; use different secrets and URLs outside local development.

Start PostgreSQL, create the tables, and insert the demo todos:

```bash
docker compose up postgres -d
vp run db:push
vp run db:seed
```

Start the app:

```bash
vp dev
```

Open [http://localhost:3000](http://localhost:3000). The todo API is available
at [http://localhost:3000/api/todos](http://localhost:3000/api/todos).

Vite+ may print a note that `vp dev` is a built-in command and suggest
`vpr dev` for the package script. That note is informational: `vp dev` is the
intended command in this repository.

Run the one-shot validation workflow with:

```bash
vp test run
vp check
vp build
```

### Common setup problems

- `Cannot read properties of undefined (reading 'select')` from `/api/todos`
  means `DATABASE_URL` was not loaded. Create `.env`, confirm the value above,
  and restart `vp dev`.
- `ECONNREFUSED` on port `5432` means PostgreSQL is not reachable. Run
  `docker compose up postgres -d`, then confirm it is running with
  `docker compose ps`.
- `relation "todo" does not exist` means the database is running but has not
  been initialized. Run `vp run db:push` followed by `vp run db:seed`.
- A Better Auth base URL warning means `BETTER_AUTH_URL` is absent. Set it to
  `http://localhost:3000` for this demo and restart the dev server.
- An invalid React hook call after dependency updates can indicate a mixed or
  stale `node_modules` tree. This repo uses Bun through Vite+; run
  `vp install --force` and avoid installing with npm, pnpm, or Bun directly.

Stop the local database without deleting its data with:

```bash
docker compose stop postgres
```

## Everyday commands

Use Vite+ commands directly with `vp` when running on the host. For dependency
isolation, prefer the Docker sandbox workflow below.

```bash
vp dev
vp build
vp preview
vp check
vp test run
```

If `package.json` or the lockfile changes, refresh dependencies with
`vp install`. The `.tanstack/` and `.output/` directories are generated lazily
by normal `vp dev` and `vp build` commands.

To generate and apply committed Drizzle migrations instead of pushing the
development schema directly:

```bash
vp run db:generate
vp run db:migrate
```

## Graphify

See [`docs/GRAPHIFY.md`](docs/GRAPHIFY.md) for optional local knowledge-graph
setup. Graphify is installed separately with `pip install graphifyy`, then
refreshed with `vp run graphify:update`.

## Supabase alternative

The **`supabase`** branch replaces Drizzle ORM and BetterAuth with
`@supabase/supabase-js` for both database access and authentication. If you
prefer a single Supabase client over a separate ORM and auth library, check out
that branch:

```bash
git checkout supabase
vp install
```

See [docs/LOCAL_SUPABASE_SETUP.md](docs/LOCAL_SUPABASE_SETUP.md) for local
Supabase setup instructions.

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
vp create @tanstack/start -- boilerplate-tanstack-start-viteplus --package-manager bun --add-ons tanstack-query --no-examples --no-git -f
```

After scaffolding, Tailwind and shadcn/ui were initialized on top of the
generated app so the starter ships with a real component baseline instead of ad
hoc CSS alone.

## Docker and Compose

This repo includes a sandboxed local dev container flow, a Storybook container
flow, and a production-like container flow.

Prefer the Docker flow when working with untrusted or newly updated npm
packages. The dev and Storybook services keep `node_modules` in a Docker volume,
mount the source checkout read-only, disable dependency lifecycle scripts during
install, keep the app/Postgres network internal to Docker, and publish only
localhost ports back to the host.

Development with Docker Compose:

```bash
vp run docker:dev
```

That installs dependencies into the Docker `app_node_modules` volume, starts
Postgres, and runs `vp dev` inside the container on `127.0.0.1:3000`.

Dependency-backed checks can run without outbound network access after the
Docker dependency volume has been populated:

```bash
docker compose --profile dev run --rm sandbox vp check
docker compose --profile dev run --rm sandbox vp test
```

Refresh the sandboxed dependency volume after lockfile changes:

```bash
docker compose --profile dev run --rm dev-deps
```

The first dependency install still needs registry network access, but
`bunfig.toml` and the Compose command both keep lifecycle scripts disabled.
After dependencies are installed, use the `sandbox` service for commands that do
not need the network. This does not make npm packages trustworthy, but it
reduces the chance that package code can write to the host checkout, persist in
host `node_modules`, or exfiltrate over the network during normal checks and
tests.

Storybook with Docker Compose:

```bash
vp run docker:storybook
```

That runs Storybook inside the container on `127.0.0.1:6006` with the same
read-only source mount and dependency volume as the app dev profile.

Production-like build and runtime:

```bash
vp run docker:prod
```

That builds the app with `vp build`, then runs the generated Nitro Node server
from `.output/server/index.mjs`.

Compose uses one file with profiles:

- `dev-deps` under the `dev` and `storybook` profiles
- `app-dev` under the `dev` profile
- `app-storybook` under the `storybook` profile
- `sandbox` under the `dev` profile
- `app-prod` under the `prod` profile

Relevant runtime environment variables:

```bash
HOST=0.0.0.0
PORT=3000
NODE_ENV=production
```

The production container does not use `vp dev` or `vp preview`; it serves the
Nitro `node-server` output directly.

### Optimizing Docker build times with a pre-built base image

The `base` stage in the Dockerfile installs `curl`, Bun, and Vite+. Locally
these layers are cached, but cloud platforms without Docker layer caching will
re-run them on every deploy.

To skip this work, build the base image once using `Dockerfile.base` and push it
to your container registry:

```bash
docker build -f Dockerfile.base -t <your-registry>/node-viteplus:latest .
docker push <your-registry>/node-viteplus:latest
```

Then replace the entire `base` stage in the `Dockerfile` with:

```dockerfile
FROM <your-registry>/node-viteplus:latest AS base
```

Rebuild and push the base image whenever you need a newer Node.js or Vite+
version.

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
vp dlx shadcn@latest add <component>
```

## Testing

Tests cover the two critical layers:

- schema and API client validation behavior
- UI query and mutation flow with mocked `fetch`

Run them with:

```bash
vp test
```
