import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { env } from 'void/env'
import { db } from '@/lib/server/db'
import * as schema from '@/lib/server/schema'

export const getAuth = () => {
  const githubClientId = env.GITHUB_CLIENT_ID
  const githubClientSecret = env.GITHUB_CLIENT_SECRET
  const googleClientId = env.GOOGLE_CLIENT_ID
  const googleClientSecret = env.GOOGLE_CLIENT_SECRET

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema,
      transaction: false
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true
    },
    socialProviders: {
      ...(githubClientId &&
        githubClientSecret && {
          github: {
            clientId: githubClientId,
            clientSecret: githubClientSecret
          }
        }),
      ...(googleClientId &&
        googleClientSecret && {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret
          }
        })
    },
    plugins: [tanstackStartCookies()]
  })
}
