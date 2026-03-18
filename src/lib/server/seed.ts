import { db } from './db'
import { todo } from './schema'

const seededAt = new Date('2026-03-13T09:00:00.000Z')

const seedTodos = [
  {
    id: 'todo-router',
    title: 'Inspect the generated route tree before changing layouts',
    completed: false,
    createdAt: seededAt
  },
  {
    id: 'todo-query',
    title: 'Keep server data behind React Query hooks',
    completed: true,
    createdAt: new Date(seededAt.getTime() + 60_000)
  },
  {
    id: 'todo-zod',
    title: 'Validate request and response payloads with shared Zod schemas',
    completed: false,
    createdAt: new Date(seededAt.getTime() + 120_000)
  }
]

const main = async () => {
  console.log('Seeding todos...')
  await db.insert(todo).values(seedTodos).onConflictDoNothing()
  console.log(`Seeded ${seedTodos.length} todos.`)
  process.exit(0)
}

main().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
