import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTodo, listTodos } from "@/features/todos/todo-api-client";

export const todosQueryKey = ["todos"];

export function todosQueryOptions() {
  return queryOptions({
    queryKey: todosQueryKey,
    queryFn: listTodos,
  });
}

export function useTodosQuery() {
  return useQuery(todosQueryOptions());
}

export function useCreateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: todosQueryKey });
    },
  });
}
