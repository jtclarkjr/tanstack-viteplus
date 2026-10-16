import { createServerFn } from '@tanstack/react-start'
import { env } from 'void/env'

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
    const configured = !!env.BETTER_AUTH_SECRET && !!env.BETTER_AUTH_URL

    return {
      configured,
      providers: {
        email: configured,
        github: !!env.GITHUB_CLIENT_ID && !!env.GITHUB_CLIENT_SECRET,
        google: !!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET
      }
    }
  }
)
