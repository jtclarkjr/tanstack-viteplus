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

export const todoQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: [...todosQueryKey, id],
    queryFn: () => getTodo(id)
  })
}

export const todosQueryOptions = () => {
  return queryOptions({
    queryKey: todosQueryKey,
    queryFn: listTodos
  })
}

export const useTodosQuery = () => {
  return useQuery(todosQueryOptions())
}

export const useCreateTodoMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTodo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: todosQueryKey })
    }
  })
}

export const useUpdateTodoMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTodoInput }) =>
      updateTodo(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: todosQueryKey })
    }
  })
}

export const useDeleteTodoMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteTodo(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: todosQueryKey })
    }
  })
}
