INSERT INTO todo (id, title, completed, created_at)
VALUES
  ('todo-router', 'Inspect the generated route tree before changing layouts', 0, 1773392400000),
  ('todo-query', 'Keep server data behind React Query hooks', 1, 1773392460000),
  ('todo-zod', 'Validate request and response payloads with shared Zod schemas', 0, 1773392520000)
ON CONFLICT (id) DO NOTHING;
