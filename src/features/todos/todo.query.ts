import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import {
  createTodo,
  deleteTodo,
  getTodo,
  listTodos,
  updateTodo
} from '@/features/todos/todo.api'
import type { UpdateTodoInput } from '@/features/todos/todo.schema'

export const todosQueryKey = ['todos']

export function todoQueryOptions(id: string) {
  return queryOptions({
    queryKey: [...todosQueryKey, id],
    queryFn: () => getTodo(id)
  })
}

export function todosQueryOptions() {
  return queryOptions({
    queryKey: todosQueryKey,
    queryFn: listTodos
  })
}

export function useTodosQuery() {
  return useQuery(todosQueryOptions())
}

export function useCreateTodoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTodo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: todosQueryKey })
    }
  })
}

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTodoInput }) =>
      updateTodo(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: todosQueryKey })
    }
  })
}

export function useDeleteTodoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteTodo(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: todosQueryKey })
    }
  })
}
