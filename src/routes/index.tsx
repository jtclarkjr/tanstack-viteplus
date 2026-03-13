import { createFileRoute } from "@tanstack/react-router";
import { TodosPage } from "@/features/todos/todos-page";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return <TodosPage />;
}
