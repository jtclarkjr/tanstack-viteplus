import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/sqlite-proxy'
import * as schema from '@/lib/server/schema'

const createDatabase = () => {
  const sqlite = new DatabaseSync(':memory:')
  sqlite.exec('PRAGMA foreign_keys = ON')

  const directory = 'db/migrations'
  const migrations = readdirSync(directory)
    .filter((name) => name.endsWith('.sql'))
    .toSorted()

  for (const migration of migrations) {
    sqlite.exec(readFileSync(join(directory, migration), 'utf8'))
  }

  const db = drizzle(
    (query, params, method) => {
      const statement = sqlite.prepare(query)
      if (method === 'run') {
        statement.run(...params)
        return Promise.resolve({ rows: [] })
      }

      const rows = statement.all(...params).map((row) => Object.values(row))
      return Promise.resolve({ rows: method === 'get' ? rows[0] : rows })
    },
    { schema }
  )

  return { sqlite, db }
}

describe('D1 schema and migrations', () => {
  let database: ReturnType<typeof createDatabase>

  beforeEach(() => {
    database = createDatabase()
  })

  afterEach(() => {
    database?.sqlite.close()
  })

  it('preserves todo booleans and millisecond dates through SQLite', async () => {
    const [created] = await database.db
      .insert(schema.todo)
      .values({ title: 'Check D1 defaults' })
      .returning()

    expect(created.completed).toBe(false)
    expect(Math.abs(Date.now() - created.createdAt.getTime())).toBeLessThan(
      5000
    )

    const createdAt = new Date('2026-03-13T09:00:00.789Z')
    const [updated] = await database.db
      .update(schema.todo)
      .set({ completed: true, createdAt })
      .where(eq(schema.todo.id, created.id))
      .returning()

    expect(updated.completed).toBe(true)
    expect(updated.createdAt.toISOString()).toBe(createdAt.toISOString())
  })

  it('maps BetterAuth fields and cascades sessions when a user is removed', async () => {
    const [user] = await database.db
      .insert(schema.user)
      .values({ id: 'user-1', name: 'Test', email: 'test@example.com' })
      .returning()
    const expiresAt = new Date('2027-01-01T00:00:00.123Z')
    const [session] = await database.db
      .insert(schema.session)
      .values({
        id: 'session-1',
        userId: user.id,
        token: 'test-session-token',
        expiresAt
      })
      .returning()

    expect(user.emailVerified).toBe(false)
    expect(user.createdAt).toBeInstanceOf(Date)
    expect(session.expiresAt.toISOString()).toBe(expiresAt.toISOString())

    await database.db.delete(schema.user).where(eq(schema.user.id, user.id))
    await expect(database.db.select().from(schema.session)).resolves.toEqual([])
  })

  it('seeds repeatedly without replacing existing todos or user edits', async () => {
    const seed = readFileSync('db/seed.sql', 'utf8')
    await database.db
      .insert(schema.todo)
      .values({ id: 'custom', title: 'My todo' })
    database.sqlite.exec(seed)
    await database.db
      .update(schema.todo)
      .set({ title: 'Edited sample' })
      .where(eq(schema.todo.id, 'todo-query'))

    database.sqlite.exec(seed)
    const todos = await database.db.select().from(schema.todo)

    expect(todos).toHaveLength(4)
    expect(todos.find((todo) => todo.id === 'custom')?.title).toBe('My todo')
    expect(todos.find((todo) => todo.id === 'todo-query')?.title).toBe(
      'Edited sample'
    )
    expect(
      todos.find((todo) => todo.id === 'todo-router')?.createdAt.toISOString()
    ).toBe('2026-03-13T09:00:00.000Z')
  })
})
