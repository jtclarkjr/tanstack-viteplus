import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { ZodError } from "zod";
import { createTodo, listTodos } from "@/features/todos/todo-api-client";

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal("fetch", fetchMock);

describe("todo api client", () => {
  afterEach(() => {
    fetchMock.mockReset();
  });

  it("parses a valid todos response", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: "todo-one",
              title: "Ship the starter",
              completed: false,
              createdAt: "2026-03-13T09:00:00.000Z",
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    await expect(listTodos()).resolves.toEqual({
      items: [
        {
          id: "todo-one",
          title: "Ship the starter",
          completed: false,
          createdAt: "2026-03-13T09:00:00.000Z",
        },
      ],
    });
  });

  it("rejects an invalid response payload", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ items: [{ id: "broken" }] }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    await expect(listTodos()).rejects.toBeInstanceOf(ZodError);
  });

  it("rejects invalid create input before calling fetch", async () => {
    await expect(createTodo({ title: "   " })).rejects.toBeInstanceOf(ZodError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
