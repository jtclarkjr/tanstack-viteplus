import { LaptopMinimal, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTheme, type Theme } from '@/providers/theme-provider'

const options: Array<{
  value: Theme
  label: string
  icon: typeof Sun
}> = [
  {
    value: 'light',
    label: 'Light',
    icon: Sun
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: Moon
  },
  {
    value: 'system',
    label: 'System',
    icon: LaptopMinimal
  }
]

export const ThemeToggle = () => {
  const { theme, mounted, setTheme } = useTheme()

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className="inline-flex h-10 min-w-64 items-center rounded-full border border-border/70 bg-card/80 p-1 opacity-0 shadow-sm backdrop-blur"
      />
    )
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/80 p-1 shadow-sm backdrop-blur">
      {options.map((option) => {
        const Icon = option.icon
        const isActive = theme === option.value

        return (
          <Button
            key={option.value}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'rounded-full px-3',
              isActive
                ? 'shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setTheme(option.value)}
            type="button"
          >
            <Icon className="size-4" />
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}
