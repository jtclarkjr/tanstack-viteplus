# TanStack Start, Vite+, and Void Boilerplate

The `void` branch runs TanStack Start on Cloudflare Workers with a local D1
database, Drizzle ORM, and Better Auth. Void provides the Workers runtime,
database tooling, and deployment integration; TanStack Start owns routing and
SSR.

Vite+ in this repo is not just a faster frontend tool wrapper. It is designed to
be AI-agent friendly: it keeps commands unified, syncs agent-facing Markdown and
hook files with `vp config`, and provides a workflow where coding agents can
work against the same project conventions and generated repo metadata. In that
sense, Vite+ is an ecosystem for agent coding as much as it is a bundled web
toolchain.

Make it a habit to reach for `vp` commands first instead of calling the package
manager directly or defaulting to `package.json` scripts. In this repo, `vp` is
the primary interface for install, dev, build, lint, format, and test workflows.
Use package scripts for database tasks and Storybook.

**Note:** Vite+ is still in beta and is fully open sourced.

- TanStack Start with file-based routing (see
  [docs/ROUTING.md](docs/ROUTING.md))
- React Query for client-side reads and writes
- Zod as the shared runtime contract for request and response payloads
- Tailwind CSS v4 + shadcn/ui for the UI layer
- Bun as the package manager of record through Vite+
- Vite+ as the day-to-day workflow wrapper
- Void with Cloudflare Workers and D1
- Better Auth with email/password and optional GitHub/Google OAuth

## Quick start: run the demo on the host

You need Node.js 24 and the Vite+ `vp` CLI. Install `vp` once from the
[Vite+ site](https://vite.plus/):

```bash
curl -fsSL https://vite.plus | bash
```

Create the local environment file:

```bash
cp env.template .env
```

Set `BETTER_AUTH_SECRET` in `.env` to a random secret of at least 32 characters
(generate one with `openssl rand -hex 32`) and keep the local base URL:

```dotenv
BETTER_AUTH_SECRET=replace-with-a-random-secret-at-least-32-characters-long
BETTER_AUTH_URL=http://localhost:3000
```

The OAuth client IDs and secrets in `env.template` are optional. `.env` is
gitignored; use different secrets and URLs outside local development. Local D1
runs in the Workers runtime and needs no database server or `DATABASE_URL`.

Install dependencies, generate Void's local types, apply the committed SQLite
migrations, and insert the demo todos:

```bash
vp install
vp exec void prepare
vp run db:migrate
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

Run the validation workflow with:

```bash
vp test run
vp check
vp build
```

### Common setup problems

- A missing `.void/tsconfig.json` means generated types are absent. Run
  `vp exec void prepare` after installing dependencies.
- `no such table: todo` means local D1 has not been initialized. Run
  `vp run db:migrate`, then `vp run db:seed`.
- A Better Auth base URL warning means `BETTER_AUTH_URL` is absent. Set it to
  `http://localhost:3000` for this demo and restart the dev server.
- An invalid React hook call after dependency updates can indicate a mixed or
  stale `node_modules` tree. This repo uses Bun through Vite+; run
  `vp install --force` and avoid installing with npm, pnpm, or Bun directly.

Local D1 data persists under `.void/`. Stop the dev server with Ctrl+C; keep
`.void/` to retain your local data.

## Everyday commands

Run development, checks, and Storybook directly on the host:

```bash
vp dev
vp build
vp preview
vp check
vp test run
vp run storybook
```

If `package.json` or the lockfile changes, refresh dependencies with
`vp install`, then `vp exec void prepare`. The `.void/`, `.tanstack/`,
`.wrangler/`, and `dist/` directories contain generated files. `vp build`
produces a Worker and client assets; `vp preview` serves the build locally in
the Workers runtime.

After editing `db/schema.ts`, generate and review SQLite migrations before
applying them:

```bash
vp run db:generate
vp run db:migrate
```

`vp run db:seed` adds demo todos without resetting the database. Avoid
`vp exec void db seed`: Void's built-in seed command resets local tables.

## Cloudflare deployment

This branch targets Cloudflare Workers. The Cloudflare account and Worker
settings live in `void.config.ts`; commit `void.lock.json` to preserve resource
IDs. Development, Storybook, and preview run on the host.

Declare server environment values in `env.ts` and set production values with
`vp exec void secret put`. Use a separate production `BETTER_AUTH_SECRET` and
set `BETTER_AUTH_URL` to the deployed HTTPS origin. Add OAuth credentials only
for providers you enable. Void does not upload your local `.env`.

Before the first deployment, bootstrap the required secrets:

```bash
openssl rand -hex 32 | vp exec void secret put BETTER_AUTH_SECRET
vp exec void secret put BETTER_AUTH_URL
vp exec void secret list
```

Enter the production HTTPS origin at the URL prompt, such as
`https://<worker>.<account-subdomain>.workers.dev`. The first secret command
creates a private draft Worker if needed. Keep the production auth secret
separate from the local development secret; later deployments reuse it.

When you are ready to publish, run:

```bash
export CLOUDFLARE_WORKERS_SUBDOMAIN=jtclarkjr
vp exec void deploy --platform cloudflare
```

The subdomain above matches the configured Cloudflare account. Export the
matching account subdomain when changing accounts. Void uses it for readiness
when Cloudflare omits deployment URLs and caches it after a successful deploy.
The Worker configuration explicitly enables workers.dev and version previews.

Deployment builds the app, provisions D1, and applies committed migrations.
The generated GitHub workflow deploys pushes to `main`; configure its scoped
`CLOUDFLARE_API_TOKEN` secret and any required readiness settings before using
it. Keep authentication secrets in the Worker secret store. Setup and local
validation do not deploy the app.

## Graphify

See [`docs/GRAPHIFY.md`](docs/GRAPHIFY.md) for optional local knowledge-graph
setup. Graphify is installed separately with `pip install graphifyy`, then
refreshed with `vp run graphify:update`.

## Other branches

The `main` branch uses Drizzle with PostgreSQL and Better Auth. Follow that
branch's setup instructions if you choose it; its database and Node runtime
configuration differ from this branch.

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

## Project shape

The todo feature is the reference implementation for adding new resources:

- `src/routes/api/todos.ts`: internal JSON API route
- `src/features/todos/todo.schema.ts`: shared Zod schemas and inferred types
- `src/features/todos/todo.api.ts`: typed fetch wrapper with runtime parsing
- `src/features/todos/todo.query.ts`: React Query options and mutation
  invalidation
- `src/features/todos/todos.page.tsx`: UI that exercises the whole flow
- `src/components/ui/*`: shadcn/ui primitives used by the starter
- `components.json`: shadcn/ui project configuration
- `db/schema.ts`: SQLite tables for todos and Better Auth
- `db/migrations/`: committed database migrations
- `db/seed.sql`: repeatable demo inserts that preserve existing rows

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

Tests cover:

- schema and API client validation behavior
- UI query and mutation flow with mocked `fetch`
- SQLite migrations, boolean/date mappings, auth foreign keys, and safe seeding
- authentication and optional provider configuration

Run them with:

```bash
vp test
```
