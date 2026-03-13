import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { createTodo, listTodos } from "@/features/todos/todo-store";
import {
  apiErrorSchema,
  createTodoInputSchema,
  createTodoResponseSchema,
  listTodosResponseSchema,
} from "@/features/todos/todo-schema";

function buildValidationIssues(fieldErrors: Record<string, string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(fieldErrors).filter((entry): entry is [string, string[]] =>
      Boolean(entry[1]?.length),
    ),
  );
}

export const Route = createFileRoute("/api/todos")({
  server: {
    handlers: {
      GET: async () => {
        return json(listTodosResponseSchema.parse({ items: listTodos() }));
      },
      POST: async ({ request }) => {
        let payload: unknown;

        try {
          payload = await request.json();
        } catch {
          return json(apiErrorSchema.parse({ message: "Request body must be valid JSON." }), {
            status: 400,
          });
        }

        const parsed = createTodoInputSchema.safeParse(payload);

        if (!parsed.success) {
          return json(
            apiErrorSchema.parse({
              message: "Request body failed validation.",
              issues: buildValidationIssues(parsed.error.flatten().fieldErrors),
            }),
            {
              status: 400,
            },
          );
        }

        const item = createTodo(parsed.data);

        return json(createTodoResponseSchema.parse({ item }), {
          status: 201,
        });
      },
    },
  },
});
