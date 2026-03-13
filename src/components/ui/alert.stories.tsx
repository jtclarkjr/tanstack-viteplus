import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlertCircle, CircleCheckBig } from 'lucide-react'

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'UI/Alert',
  component: Alert,
  tags: ['autodocs'],
  args: {
    variant: 'default'
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive']
    }
  },
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof Alert>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <div className="max-w-xl p-6">
      <Alert {...args}>
        <CircleCheckBig />
        <AlertTitle>Changes saved</AlertTitle>
        <AlertDescription>
          Your profile details were updated and are ready to publish.
        </AlertDescription>
      </Alert>
    </div>
  )
}

export const WithAction: Story = {
  render: () => (
    <div className="max-w-xl p-6">
      <Alert>
        <CircleCheckBig />
        <AlertTitle>Invite sent</AlertTitle>
        <AlertDescription>
          The recipient can now join the workspace from their email link.
        </AlertDescription>
        <AlertAction>
          <Button size="sm" variant="outline">
            View details
          </Button>
        </AlertAction>
      </Alert>
    </div>
  )
}

export const Destructive: Story = {
  args: {
    variant: 'destructive'
  },
  render: (args) => (
    <div className="max-w-xl p-6">
      <Alert {...args}>
        <AlertCircle />
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>
          We could not renew this subscription. Update the billing method and
          try again.
        </AlertDescription>
      </Alert>
    </div>
  )
}
