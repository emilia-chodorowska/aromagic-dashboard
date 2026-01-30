import { Badge } from '@/components/ui/badge'
import type { MembershipType } from '@/types'

interface MembershipBadgeProps {
  type: MembershipType
}

export function MembershipBadge({ type }: MembershipBadgeProps) {
  return (
    <Badge variant={type === 'WC' ? 'info' : 'purple'}>
      {type}
    </Badge>
  )
}
