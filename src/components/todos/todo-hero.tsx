import { CheckCircle2, DatabaseZap, Server, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export function TodoHero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 shadow-sm backdrop-blur">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute -right-16 top-8 size-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -left-12 bottom-0 size-56 rounded-full bg-accent/70 blur-3xl" />
      <div className="relative grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.8fr)] lg:px-10 lg:py-10">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="rounded-full bg-background/70 px-3 py-1"
            >
              TanStack Start + VitePlus
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              shadcn/ui
            </Badge>
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              React Query, shared Zod contracts, and shadcn/ui in one starter.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
              This boilerplate keeps the app small, but it ships a complete
              pattern: validated internal API routes, typed client parsing,
              React Query invalidation, and a Tailwind + shadcn UI baseline you
              can extend immediately.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="bg-background/70">
              <CardContent className="flex items-center gap-3 px-4 py-4">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <DatabaseZap className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">pnpm workflow</p>
                  <p className="text-sm text-muted-foreground">
                    `vp dev`, `vp check`, `vp test`
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/70">
              <CardContent className="flex items-center gap-3 px-4 py-4">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Shared schemas</p>
                  <p className="text-sm text-muted-foreground">
                    Requests and responses validated
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/70">
              <CardContent className="flex items-center gap-3 px-4 py-4">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Server className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Internal API</p>
                  <p className="text-sm text-muted-foreground">
                    `GET` and `POST /api/todos`
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="self-start border-border/70 bg-background/80 shadow-sm">
          <CardHeader>
            <Badge variant="outline" className="mb-2 w-fit rounded-full">
              Core starter pattern
            </Badge>
            <CardTitle className="text-lg">What this page proves</CardTitle>
            <CardDescription>
              The UI consumes the same contracts your server returns, then
              refreshes from the source of truth after every write.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3 rounded-xl bg-muted/60 p-3">
              <CheckCircle2 className="mt-0.5 size-4 text-primary" />
              <span>Client-side Zod validation before the mutation fires</span>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-muted/60 p-3">
              <CheckCircle2 className="mt-0.5 size-4 text-primary" />
              <span>
                Server-side request and response validation in the route
              </span>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-muted/60 p-3">
              <CheckCircle2 className="mt-0.5 size-4 text-primary" />
              <span>
                React Query invalidation instead of local optimistic bookkeeping
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
