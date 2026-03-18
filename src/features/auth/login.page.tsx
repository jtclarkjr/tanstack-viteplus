import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { AlertCircle, Github, Info, Loader2 } from 'lucide-react'
import { z } from 'zod'

import { signIn, signUp } from '@/lib/auth-client'
import { extractFieldError } from '@/lib/form-utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import type { AuthConfig } from '@/lib/server/auth-config'

const emailSchema = z.string().email('Enter a valid email address')
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')

const NotConfiguredCard = () => {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Authentication Not Configured</CardTitle>
        <CardDescription>
          Set up your environment variables to enable authentication.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <Info className="size-4" />
          <AlertTitle>Setup Required</AlertTitle>
          <AlertDescription>
            <p>
              Copy <code className="text-xs">.env.example</code> to{' '}
              <code className="text-xs">.env</code> and configure:
            </p>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-xs">
              <li>
                Set <code>DATABASE_URL</code> to your Postgres connection string
              </li>
              <li>
                Set <code>BETTER_AUTH_SECRET</code> to a random secret
              </li>
              <li>
                Run <code>vp run db:push</code> (or{' '}
                <code>pnpm run db:push</code>) to create tables
              </li>
              <li>Restart the dev server</li>
            </ol>
            <p className="mt-2 text-xs">
              Optionally add <code>GITHUB_CLIENT_ID</code>/
              <code>GITHUB_CLIENT_SECRET</code> or <code>GOOGLE_CLIENT_ID</code>
              /<code>GOOGLE_CLIENT_SECRET</code> for SSO.
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

const SsoButtons = ({ providers }: { providers: AuthConfig['providers'] }) => {
  const hasAny = providers.github || providers.google
  if (!hasAny) return null

  const handleSso = async (provider: 'github' | 'google') => {
    await signIn.social({ provider, callbackURL: '/' })
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>
      <div className="flex flex-col gap-2">
        {providers.github && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => void handleSso('github')}
            type="button"
          >
            <Github className="size-4" />
            Continue with GitHub
          </Button>
        )}
        {providers.google && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => void handleSso('google')}
            type="button"
          >
            <svg className="size-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        )}
      </div>
    </>
  )
}

const SignInForm = ({
  onSuccess,
  serverError,
  setServerError
}: {
  onSuccess?: () => void
  serverError: string | null
  setServerError: (v: string | null) => void
}) => {
  const router = useRouter()

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      setServerError(null)
      const result = await signIn.email({
        email: value.email,
        password: value.password
      })
      if (result.error) {
        setServerError(result.error.message ?? 'Sign in failed')
        return
      }
      onSuccess?.()
      void router.invalidate()
    }
  })

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="email" validators={{ onBlur: emailSchema }}>
        {(field) => {
          const fieldError = extractFieldError(field.state.meta.errors)
          const showError =
            Boolean(fieldError) &&
            (field.state.meta.isTouched || form.state.submissionAttempts > 0)

          return (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sign-in-email">Email</Label>
              <Input
                id="sign-in-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={showError}
              />
              {showError && (
                <p className="text-xs text-destructive">{fieldError}</p>
              )}
            </div>
          )
        }}
      </form.Field>

      <form.Field name="password" validators={{ onBlur: passwordSchema }}>
        {(field) => {
          const fieldError = extractFieldError(field.state.meta.errors)
          const showError =
            Boolean(fieldError) &&
            (field.state.meta.isTouched || form.state.submissionAttempts > 0)

          return (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sign-in-password">Password</Label>
              <Input
                id="sign-in-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={showError}
              />
              {showError && (
                <p className="text-xs text-destructive">{fieldError}</p>
              )}
            </div>
          )
        }}
      </form.Field>

      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Sign In
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

const SignUpForm = ({
  onSuccess,
  serverError,
  setServerError
}: {
  onSuccess?: () => void
  serverError: string | null
  setServerError: (v: string | null) => void
}) => {
  const router = useRouter()

  const form = useForm({
    defaultValues: { name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setServerError(null)
      const result = await signUp.email({
        email: value.email,
        password: value.password,
        name: value.name || value.email.split('@')[0]
      })
      if (result.error) {
        setServerError(result.error.message ?? 'Sign up failed')
        return
      }
      onSuccess?.()
      void router.invalidate()
    }
  })

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="name">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sign-up-name">Name</Label>
            <Input
              id="sign-up-name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="email" validators={{ onBlur: emailSchema }}>
        {(field) => {
          const fieldError = extractFieldError(field.state.meta.errors)
          const showError =
            Boolean(fieldError) &&
            (field.state.meta.isTouched || form.state.submissionAttempts > 0)

          return (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sign-up-email">Email</Label>
              <Input
                id="sign-up-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={showError}
              />
              {showError && (
                <p className="text-xs text-destructive">{fieldError}</p>
              )}
            </div>
          )
        }}
      </form.Field>

      <form.Field name="password" validators={{ onBlur: passwordSchema }}>
        {(field) => {
          const fieldError = extractFieldError(field.state.meta.errors)
          const showError =
            Boolean(fieldError) &&
            (field.state.meta.isTouched || form.state.submissionAttempts > 0)

          return (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sign-up-password">Password</Label>
              <Input
                id="sign-up-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={showError}
              />
              {showError && (
                <p className="text-xs text-destructive">{fieldError}</p>
              )}
            </div>
          )
        }}
      </form.Field>

      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Create Account
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

export const LoginForm = ({
  authConfig,
  onSuccess
}: {
  authConfig: AuthConfig
  onSuccess?: () => void
}) => {
  const [serverError, setServerError] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="sign-in" onValueChange={() => setServerError(null)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-in" className="mt-4">
          <SignInForm
            onSuccess={onSuccess}
            serverError={serverError}
            setServerError={setServerError}
          />
        </TabsContent>
        <TabsContent value="sign-up" className="mt-4">
          <SignUpForm
            onSuccess={onSuccess}
            serverError={serverError}
            setServerError={setServerError}
          />
        </TabsContent>
      </Tabs>
      <SsoButtons providers={authConfig.providers} />
    </div>
  )
}

export const LoginPage = ({ authConfig }: { authConfig: AuthConfig }) => {
  if (!authConfig.configured) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <NotConfiguredCard />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Sign in or create an account.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm authConfig={authConfig} />
        </CardContent>
      </Card>
    </main>
  )
}
