import { desc, eq } from 'drizzle-orm'
import type { CreateTodoInput, Todo, UpdateTodoInput } from './todo.schema'
import { db } from '@/lib/server/db'
import { todo } from '@/lib/server/schema'

const toTodo = (row: typeof todo.$inferSelect): Todo => ({
  ...row,
  createdAt: row.createdAt.toISOString()
})

export const getTodo = async (id: string): Promise<Todo | null> => {
  const rows = await db.select().from(todo).where(eq(todo.id, id))
  return rows[0] ? toTodo(rows[0]) : null
}

export const listTodos = async (): Promise<Todo[]> => {
  const rows = await db.select().from(todo).orderBy(desc(todo.createdAt))
  return rows.map(toTodo)
}

export const createTodo = async (input: CreateTodoInput): Promise<Todo> => {
  const rows = await db.insert(todo).values({ title: input.title }).returning()
  return toTodo(rows[0])
}

export const updateTodo = async (
  id: string,
  input: UpdateTodoInput
): Promise<Todo | null> => {
  const rows = await db
    .update(todo)
    .set(input)
    .where(eq(todo.id, id))
    .returning()
  return rows[0] ? toTodo(rows[0]) : null
}

export const deleteTodo = async (id: string): Promise<Todo | null> => {
  const rows = await db.delete(todo).where(eq(todo.id, id)).returning()
  return rows[0] ? toTodo(rows[0]) : null
}
