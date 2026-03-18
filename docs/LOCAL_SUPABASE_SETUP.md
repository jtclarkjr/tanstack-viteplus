# Local Supabase Setup Guide

This guide shows you how to run Supabase locally instead of using the hosted
cloud version. Local development is useful for:

- **Faster development** - No network latency
- **Offline development** - Work without internet
- **Cost savings** - No usage charges during development
- **Database experimentation** - Test schema changes safely
- **Email/password auth** - Simple local authentication without OAuth setup

## Prerequisites

- **Docker Desktop** - Required for running Supabase containers
- **Homebrew** (macOS/Linux) or direct download for Supabase CLI
- **Node.js 22+**

## Step 1: Install Supabase CLI

### macOS/Linux (Homebrew)

```bash
brew install supabase/tap/supabase
```

### Windows (Scoop)

```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Verify Installation

```bash
supabase --version
```

## Step 2: Initialize and Start Local Supabase

Navigate to the project root and initialize Supabase (first time only):

```bash
supabase init
```

Start local Supabase:

```bash
supabase start
```

**First run will take 2-5 minutes** as it downloads Docker images (~2GB).

After successful startup, you'll see output with your local credentials:

**Important URLs:**

- **Supabase Studio**: http://127.0.0.1:54323 (Database GUI)
- **API**: http://127.0.0.1:54321
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Mailpit** (Email testing): http://127.0.0.1:54324

## Step 3: Create the Todo Table

Open Supabase Studio at http://127.0.0.1:54323 and run this SQL in the SQL
Editor:

```sql
create table public.todo (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Allow the service role full access (no RLS needed for server-side only)
alter table public.todo enable row level security;

create policy "Service role has full access"
  on public.todo
  for all
  using (true)
  with check (true);
```

### Verify the Table

```bash
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "\dt public.*"
```

## Step 4: Configure Environment Variables

Copy `.env.example` to `.env` and fill in local values. Get your keys from the
`supabase start` output or run:

```bash
supabase status
```

Then update `.env`:

```bash
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SECRET_KEY=<service_role key from supabase status>

VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key from supabase status>
```

> **Note:** Local Supabase outputs JWT-format keys (`eyJ...`). These work the
> same way as the newer publishable/secret keys from hosted Supabase.

## Step 5: Seed the Database (Optional)

```bash
vp run db:seed
# or: pnpm run db:seed
```

This inserts 3 sample todos.

## Step 6: Start the Application

```bash
vp install
vp dev
```

Open http://localhost:3000. You should see the app with the seeded todos.

## Step 7: Create a Test User

### Option 1: Via the App UI

1. Click the user icon in the top-right corner
2. Switch to the "Sign Up" tab
3. Enter an email and password (min 8 characters)
4. Check Mailpit at http://127.0.0.1:54324 for the confirmation email
5. Click the confirmation link, then sign in

### Option 2: Via Supabase Studio

1. Open http://127.0.0.1:54323
2. Go to **Authentication** → **Users**
3. Click **Add user**
4. Enter email and password
5. Check "Auto Confirm User"
6. Click **Create**

## Common Commands

### Check Supabase Status

```bash
supabase status
```

### Stop Supabase

```bash
supabase stop
```

### Restart Supabase

```bash
supabase stop
supabase start
```

### Reset Database

**Warning**: This deletes all data!

```bash
supabase db reset
```

Then re-create the todo table (Step 3) and re-seed (Step 5).

## Local vs Hosted Supabase

| Feature            | Local Supabase           | Hosted Supabase                  |
| ------------------ | ------------------------ | -------------------------------- |
| **Setup**          | Requires Docker & CLI    | Just create project              |
| **Authentication** | Email/password (simple)  | OAuth providers (GitHub, Google) |
| **Database**       | PostgreSQL in Docker     | Managed PostgreSQL               |
| **Cost**           | Free (local resources)   | Free tier, then paid             |
| **Email**          | Mailpit (no real emails) | Real email delivery              |
| **Offline**        | Works offline            | Requires internet                |

## Troubleshooting

### Issue: "Port already in use"

```bash
supabase stop
supabase start
```

### Issue: JWT error "invalid signature"

Verify you're using the correct keys from `supabase status` in your `.env` and
restart the dev server.

### Issue: RLS policy error

Make sure the todo table policy from Step 3 was applied. Check in Supabase
Studio under **Authentication** → **Policies**.

### Issue: Docker container fails to start

1. Check Docker is running
2. Check available disk space
3. Reset:
   ```bash
   supabase stop
   docker system prune -a
   supabase start
   ```

## Additional Resources

- **Supabase CLI Docs**: https://supabase.com/docs/guides/cli
- **Local Development Guide**:
  https://supabase.com/docs/guides/cli/local-development
- **Supabase Studio**: http://127.0.0.1:54323 (local GUI)
- **Mailpit**: http://127.0.0.1:54324 (test emails)
