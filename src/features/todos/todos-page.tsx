import { useState } from "react";
import { ApiClientError, isSchemaError } from "@/features/todos/todo-api-client";
import { createTodoInputSchema } from "@/features/todos/todo-schema";
import { useCreateTodoMutation, useTodosQuery } from "@/features/todos/todo-query";

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function TodosPage() {
  const todosQuery = useTodosQuery();
  const createTodoMutation = useCreateTodoMutation();
  const [title, setTitle] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const mutationIssue =
    createTodoMutation.error instanceof ApiClientError
      ? (createTodoMutation.error.issues?.["title"]?.[0] ?? createTodoMutation.error.message)
      : isSchemaError(createTodoMutation.error)
        ? (createTodoMutation.error.issues[0]?.message ?? "The API returned an unexpected payload.")
        : createTodoMutation.error instanceof Error
          ? createTodoMutation.error.message
          : null;

  const items = todosQuery.data?.items ?? [];

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = createTodoInputSchema.safeParse({ title });

    if (!parsed.success) {
      setFieldError(parsed.error.flatten().fieldErrors.title?.[0] ?? "Give the todo a title.");
      return;
    }

    setFieldError(null);

    createTodoMutation.mutate(parsed.data, {
      onSuccess: () => {
        setTitle("");
      },
    });
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-grid">
          <div>
            <p className="eyebrow">TanStack Start + VitePlus</p>
            <h1 className="hero-title">React Query + Zod with a real internal API flow.</h1>
            <p className="hero-copy">
              This starter keeps the app deliberately small, but it already wires the full pattern
              you will reuse: client-side validation, server-side validation, shared response
              contracts, and React Query invalidation after writes.
            </p>
          </div>

          <div>
            <p className="eyebrow">Included surface area</p>
            <div className="hero-meta">
              <span className="meta-pill">
                <span className="meta-dot" />
                pnpm package manager
              </span>
              <span className="meta-pill">
                <span className="meta-dot" />
                Zod-validated API routes
              </span>
              <span className="meta-pill">
                <span className="meta-dot" />
                React Query hooks
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="layout-grid" aria-label="Starter overview">
        <article className="surface-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Live example</p>
              <h2>Todos</h2>
              <p>
                Fetched from <code>GET /api/todos</code> and updated via{" "}
                <code>POST /api/todos</code>.
              </p>
            </div>
            <span className="count-badge">{items.length} item(s)</span>
          </div>

          <form className="composer-grid" onSubmit={handleSubmit}>
            <label className="composer-label" htmlFor="todo-title">
              New todo
            </label>
            <div className="composer-row">
              <input
                id="todo-title"
                name="title"
                placeholder="Add the next thing this starter should prove"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (fieldError) {
                    setFieldError(null);
                  }
                }}
              />
              <button
                className="primary-button"
                disabled={createTodoMutation.isPending}
                type="submit"
              >
                {createTodoMutation.isPending ? "Adding..." : "Add todo"}
              </button>
            </div>
            {fieldError ? <p className="field-error">{fieldError}</p> : null}
            {mutationIssue && !fieldError ? <p className="field-error">{mutationIssue}</p> : null}
            <p className="helper-copy">
              The form validates with Zod before submit. The API route validates the same payload
              again before mutating server state.
            </p>
          </form>

          <div style={{ marginTop: "1.4rem" }}>
            {todosQuery.isPending ? (
              <p className="status-copy">Loading todos from the starter API…</p>
            ) : null}

            {todosQuery.isError ? (
              <p className="banner-error">
                {todosQuery.error instanceof Error
                  ? todosQuery.error.message
                  : "Something went wrong while loading todos."}
              </p>
            ) : null}

            {todosQuery.isSuccess && items.length === 0 ? (
              <div className="empty-state">
                The API returned an empty list. Add the first todo above.
              </div>
            ) : null}

            {todosQuery.isSuccess && items.length > 0 ? (
              <ul className="todo-list">
                {items.map((todo) => (
                  <li className="todo-item" key={todo.id}>
                    <span className="todo-mark" aria-hidden="true">
                      {todo.completed ? "✓" : "→"}
                    </span>
                    <div className="todo-body">
                      <h3>{todo.title}</h3>
                      <p className="todo-meta">
                        {todo.completed ? "Completed example item" : "Open example item"} • added{" "}
                        {formatCreatedAt(todo.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </article>

        <div className="layout-grid" style={{ marginTop: 0 }}>
          <aside className="surface-card">
            <p className="eyebrow">Files to copy</p>
            <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Starter pattern</h2>
            <ol className="route-list">
              <li>
                <code>src/features/todos/todo-schema.ts</code>
              </li>
              <li>
                <code>src/routes/api/todos.ts</code>
              </li>
              <li>
                <code>src/features/todos/todo-api-client.ts</code>
              </li>
              <li>
                <code>src/features/todos/todo-query.ts</code>
              </li>
              <li>
                <code>src/features/todos/todos-page.tsx</code>
              </li>
            </ol>
          </aside>

          <aside className="surface-card">
            <p className="eyebrow">What is already wired</p>
            <ul className="resource-list">
              <li>
                <strong>pnpm + VitePlus workflow</strong>
                Use <code>vp dev</code>, <code>vp check</code>, and <code>vp test</code>.
              </li>
              <li>
                <strong>Runtime API contracts</strong>
                Shared request and response schemas live next to the feature.
              </li>
              <li>
                <strong>React Query invalidation</strong>
                The create mutation refreshes the list without manual state syncing.
              </li>
            </ul>
            <p className="footer-note">
              Replace the in-memory store with a database when you are ready; the client contract
              can stay the same.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
