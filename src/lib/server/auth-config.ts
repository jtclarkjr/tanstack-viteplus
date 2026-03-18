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
    const hasUrl = !!process.env.SUPABASE_URL
    const hasPublishableKey = !!process.env.VITE_SUPABASE_PUBLISHABLE_KEY

    return {
      configured: hasUrl && hasPublishableKey,
      providers: {
        email: hasUrl && hasPublishableKey,
        github:
          !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET,
        google:
          !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET
      }
    }
  }
)
