import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '@/features/auth/login.page'
import { authConfigQueryOptions } from '@/features/auth/auth.query'

const LoginRoute = () => {
  const { authConfig } = Route.useLoaderData()
  return <LoginPage authConfig={authConfig} />
}

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context }) => {
    if (context.session) {
      throw redirect({ to: '/' })
    }
  },
  loader: async ({ context }) => {
    const authConfig = await context.queryClient.ensureQueryData(
      authConfigQueryOptions()
    )
    return { authConfig }
  },
  component: LoginRoute
})
