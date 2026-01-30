import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Copy, Users } from 'lucide-react'
import type { UserProfile } from '@/types'

interface UserProfileCardProps {
  user: UserProfile
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="min-w-[280px]">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div>
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>ID: {user.id}</span>
                  <button className="hover:text-foreground">
                    <Copy className="h-3 w-3" />
                  </button>
                  <button className="hover:text-foreground">
                    <Users className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            {user.sponsor && (
              <div className="mb-1">
                <span className="text-xs text-muted-foreground">Sponsor</span>
                <div className="text-sm font-medium">{user.sponsor.name}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>ID: {user.sponsor.id}</span>
                  <button className="hover:text-foreground">
                    <Copy className="h-3 w-3" />
                  </button>
                  <button className="hover:text-foreground">
                    <Users className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {user.enroller && (
              <div>
                <span className="text-xs text-muted-foreground">Enroller</span>
                <div className="text-sm font-medium">{user.enroller.name}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>ID: {user.enroller.id}</span>
                  <button className="hover:text-foreground">
                    <Copy className="h-3 w-3" />
                  </button>
                  <button className="hover:text-foreground">
                    <Users className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <Avatar className="h-12 w-12 bg-slate-200">
            <AvatarFallback className="bg-slate-200 text-slate-600 font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </CardContent>
    </Card>
  )
}
