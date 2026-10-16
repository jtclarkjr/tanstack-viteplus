import { defineEnv, string, url } from 'void/env'
import { z } from 'zod'

export default defineEnv({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: url(),
  GITHUB_CLIENT_ID: string().optional(),
  GITHUB_CLIENT_SECRET: string().optional(),
  GOOGLE_CLIENT_ID: string().optional(),
  GOOGLE_CLIENT_SECRET: string().optional()
})
