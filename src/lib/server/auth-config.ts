import { createServerFn } from '@tanstack/react-start'

export type AuthConfig = {
  configured: boolean
  providers: {
    email: boolean
    github: boolean
    google: boolean
  }
}

export const getAuthConfig = createServerFn({ method: 'GET' }).handler(
  (): AuthConfig => {
    const hasSecret = !!process.env.BETTER_AUTH_SECRET
    const hasDb = !!process.env.DATABASE_URL

    return {
      configured: hasSecret && hasDb,
      providers: {
        email: hasSecret && hasDb,
        github:
          !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET,
        google:
          !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET
      }
    }
  }
)
