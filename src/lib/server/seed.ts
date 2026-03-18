import { supabase } from './supabase'

const seededAt = new Date('2026-03-13T09:00:00.000Z')

const seedTodos = [
  {
    id: 'todo-router',
    title: 'Inspect the generated route tree before changing layouts',
    completed: false,
    created_at: seededAt.toISOString()
  },
  {
    id: 'todo-query',
    title: 'Keep server data behind React Query hooks',
    completed: true,
    created_at: new Date(seededAt.getTime() + 60_000).toISOString()
  },
  {
    id: 'todo-zod',
    title: 'Validate request and response payloads with shared Zod schemas',
    completed: false,
    created_at: new Date(seededAt.getTime() + 120_000).toISOString()
  }
]

const main = async () => {
  console.log('Seeding todos...')
  const { error } = await supabase.from('todo').upsert(seedTodos, {
    onConflict: 'id'
  })
  if (error) throw error
  console.log(`Seeded ${seedTodos.length} todos.`)
  process.exit(0)
}

main().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
