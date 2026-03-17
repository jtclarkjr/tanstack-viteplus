import { createFileRoute } from '@tanstack/react-router'
import { TodosPage } from '@/features/todos/todos.page'

const HomePage = () => {
  return <TodosPage />
}

export const Route = createFileRoute('/')({
  component: HomePage
})
