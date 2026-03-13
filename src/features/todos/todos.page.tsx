import { ThemeToggle } from '@/components/theme-toggle'
import { TodoHero } from '@/components/todos/todo-hero'
import { TodoList } from '@/components/todos/todo-list'
import { TodoSidebar } from '@/components/todos/todo-sidebar'

export function TodosPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      <TodoHero />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.9fr)]">
        <TodoList />
        <TodoSidebar />
      </section>
    </main>
  )
}
