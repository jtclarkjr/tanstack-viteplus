import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'
import { defineConfig } from 'drizzle-kit'
import { z } from 'zod'

if (existsSync('.env')) {
  loadEnvFile()
}

const databaseUrl = z
  .string()
  .min(1, 'DATABASE_URL is required to run Drizzle commands.')
  .parse(process.env.DATABASE_URL)

export default defineConfig({
  schema: './src/lib/server/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl
  }
})
