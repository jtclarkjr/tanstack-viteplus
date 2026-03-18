import { z } from 'zod'

const fieldErrorSchema = z.union([
  z.object({ message: z.string() }).transform((v) => v.message),
  z.string()
])

export const extractFieldError = (errors: Array<unknown>) => {
  const result = fieldErrorSchema.safeParse(errors[0])
  return result.success ? result.data : undefined
}
