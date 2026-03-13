import type { Meta, StoryObj } from '@storybook/react-vite'
import { MoreHorizontal } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  args: {
    size: 'default'
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'sm']
    }
  },
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <div className="max-w-md p-6">
      <Card {...args}>
        <CardHeader>
          <CardTitle>Q2 launch checklist</CardTitle>
          <CardDescription>
            Track the remaining pieces before the new onboarding release goes
            live.
          </CardDescription>
          <CardAction>
            <Badge variant="secondary">On track</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Design review is approved.</p>
            <p>Marketing copy is waiting on final screenshots.</p>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <span className="text-sm text-muted-foreground">
            Updated 2 hours ago
          </span>
          <Button size="sm">Open board</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export const Compact: Story = {
  args: {
    size: 'sm'
  },
  render: (args) => (
    <div className="max-w-sm p-6">
      <Card {...args}>
        <CardHeader className="border-b">
          <CardTitle>Storage usage</CardTitle>
          <CardDescription>
            83% of the team quota is currently used.
          </CardDescription>
          <CardAction>
            <Button size="icon-xs" variant="ghost" aria-label="More options">
              <MoreHorizontal />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <p className="text-2xl font-semibold">248 GB</p>
            <p className="text-sm text-muted-foreground">52 GB remaining</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
