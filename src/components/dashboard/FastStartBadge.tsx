import { Badge } from '@/components/ui/badge'
import type { FastStart } from '@/types'

interface FastStartBadgeProps {
  fastStart: FastStart
}

export function FastStartBadge({ fastStart }: FastStartBadgeProps) {
  if (fastStart.status === 'none' || fastStart.daysRemaining === null) {
    return <span className="text-muted-foreground">-</span>
  }

  const variant = fastStart.status === 'active' ? 'success' : 'warning'

  return (
    <Badge variant={variant}>
      {fastStart.daysRemaining} dni
    </Badge>
  )
}
