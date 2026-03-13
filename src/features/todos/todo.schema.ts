import { z } from 'zod'

export const createTodoInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Give the todo a title.')
    .max(80, 'Keep titles under 80 characters.')
})

export const updateTodoInputSchema = z
  .object({
    title: createTodoInputSchema.shape.title.optional(),
    completed: z.boolean().optional()
  })
  .refine(
    (value) => value.title !== undefined || value.completed !== undefined,
    {
      message: 'Provide at least one field to update.'
    }
  )

export const todoSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  createdAt: z.iso.datetime()
})

export const listTodosResponseSchema = z.object({
  items: z.array(todoSchema)
})

export const createTodoResponseSchema = z.object({
  item: todoSchema
})

export const updateTodoResponseSchema = z.object({
  item: todoSchema
})

export const deleteTodoResponseSchema = z.object({
  item: todoSchema
})

export const apiErrorSchema = z.object({
  message: z.string(),
  issues: z.record(z.string(), z.array(z.string())).optional()
})

export type CreateTodoInput = z.infer<typeof createTodoInputSchema>
export type UpdateTodoInput = z.infer<typeof updateTodoInputSchema>
export type Todo = z.infer<typeof todoSchema>
export type ListTodosResponse = z.infer<typeof listTodosResponseSchema>
export type CreateTodoResponse = z.infer<typeof createTodoResponseSchema>
export type UpdateTodoResponse = z.infer<typeof updateTodoResponseSchema>
export type DeleteTodoResponse = z.infer<typeof deleteTodoResponseSchema>
export type ApiError = z.infer<typeof apiErrorSchema>
