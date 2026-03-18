import type { CreateTodoInput, Todo, UpdateTodoInput } from './todo.schema'
import { supabase } from '@/lib/server/supabase'

const toTodo = (row: {
  id: string
  title: string
  completed: boolean
  created_at: string
}): Todo => ({
  id: row.id,
  title: row.title,
  completed: row.completed,
  createdAt: row.created_at
})

export const getTodo = async (id: string): Promise<Todo | null> => {
  const { data, error } = await supabase
    .from('todo')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return toTodo(data)
}

export const listTodos = async (): Promise<Todo[]> => {
  const { data, error } = await supabase
    .from('todo')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map(toTodo)
}

export const createTodo = async (input: CreateTodoInput): Promise<Todo> => {
  const { data, error } = await supabase
    .from('todo')
    .insert({ title: input.title })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Failed to create todo')
  return toTodo(data)
}

export const updateTodo = async (
  id: string,
  input: UpdateTodoInput
): Promise<Todo | null> => {
  const { data, error } = await supabase
    .from('todo')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error || !data) return null
  return toTodo(data)
}

export const deleteTodo = async (id: string): Promise<Todo | null> => {
  const { data, error } = await supabase
    .from('todo')
    .delete()
    .eq('id', id)
    .select()
    .single()
  if (error || !data) return null
  return toTodo(data)
}
