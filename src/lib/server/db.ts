import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/lib/server/schema'

if (existsSync('.env')) {
  loadEnvFile()
}

const connectionString = process.env.DATABASE_URL

let db: PostgresJsDatabase<typeof schema>

if (connectionString) {
  const queryClient = postgres(connectionString)
  db = drizzle(queryClient, { schema })
}

export { db }
