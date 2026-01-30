import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MembershipBadge } from './MembershipBadge'
import { FastStartBadge } from './FastStartBadge'
import { Copy, Users, List, RotateCcw, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StructureMember } from '@/types'

interface StructureTableProps {
  members: StructureMember[]
  onMemberClick?: (member: StructureMember) => void
}

export function StructureTable({ members, onMemberClick }: StructureTableProps) {
  const formatPV = (value: number) =>
    value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' PV'

  const formatDate = (date: Date | null) =>
    date ? date.toLocaleDateString('pl-PL') : '-'

  const getPVClassName = (status: StructureMember['pvStatus']) => {
    switch (status) {
      case 'success':
        return 'text-green-600 font-medium'
      case 'warning':
        return 'text-orange-600 font-medium'
      default:
        return ''
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Klient</TableHead>
          <TableHead>Zamówienia</TableHead>
          <TableHead>Łączne PV</TableHead>
          <TableHead className="flex items-center gap-1">
            Ostatnie zamówienie
            <ArrowUpDown className="h-3 w-3" />
          </TableHead>
          <TableHead>Sponsor</TableHead>
          <TableHead>Enroller</TableHead>
          <TableHead>Typ członkostwa</TableHead>
          <TableHead>Fast Start</TableHead>
          <TableHead>Pozostałe miesiące PGV</TableHead>
          <TableHead>Akcje</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell>
              <div>
                <button
                  onClick={() => onMemberClick?.(member)}
                  className="font-medium text-left hover:text-green-600 hover:underline transition-colors"
                >
                  {member.name}
                </button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>ID: {member.id}</span>
                  <button className="hover:text-foreground">
                    <Copy className="h-3 w-3" />
                  </button>
                  <button className="hover:text-foreground">
                    <Users className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </TableCell>
            <TableCell>{member.ordersCount}</TableCell>
            <TableCell className={cn(getPVClassName(member.pvStatus))}>
              {formatPV(member.totalPV)}
            </TableCell>
            <TableCell>{formatDate(member.lastOrderDate)}</TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{member.sponsor.name}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>ID: {member.sponsor.id}</span>
                  <button className="hover:text-foreground">
                    <Copy className="h-3 w-3" />
                  </button>
                  <button className="hover:text-foreground">
                    <Users className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{member.enroller.name}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>ID: {member.enroller.id}</span>
                  <button className="hover:text-foreground">
                    <Copy className="h-3 w-3" />
                  </button>
                  <button className="hover:text-foreground">
                    <Users className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <MembershipBadge type={member.membershipType} />
            </TableCell>
            <TableCell>
              <FastStartBadge fastStart={member.fastStart} />
            </TableCell>
            <TableCell>
              {member.remainingPGVMonths !== null ? member.remainingPGVMonths : '-'}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-muted rounded">
                  <List className="h-4 w-4 text-muted-foreground" />
                </button>
                <button className="p-1 hover:bg-muted rounded">
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
