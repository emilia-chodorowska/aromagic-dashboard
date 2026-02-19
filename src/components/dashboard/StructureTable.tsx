import { useState } from 'react'
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

import type { StructureMember } from '@/types'

type BreakVariant = 'name-color' | 'name-badge' | 'pv-badge'

interface StructureTableProps {
  members: StructureMember[]
  onMemberClick?: (member: StructureMember) => void
}

export function StructureTable({ members, onMemberClick }: StructureTableProps) {
  const [breakVariant, setBreakVariant] = useState<BreakVariant>('name-badge')

  const formatPV = (value: number) =>
    value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' PV'

  const formatDate = (date: Date | null) =>
    date ? date.toLocaleDateString('pl-PL') : '-'

  const getPVBadgeClassName = (status: StructureMember['pvStatus']) => {
    switch (status) {
      case 'success':
        return 'inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700'
      case 'warning':
        return 'inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700'
      default:
        return ''
    }
  }

  const renderPV = (member: StructureMember) => {
    // Wariant C: badge "Po przerwie" obok PV
    if (breakVariant === 'pv-badge' && member.isAfterBreak) {
      return (
        <div className="flex items-center gap-1.5">
          {member.orderType === 'internet' ? (
            <span className="inline-flex items-center rounded-full bg-[#eff6ff] px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              {formatPV(member.totalPV)}
            </span>
          ) : member.pvStatus !== 'normal' ? (
            <span className={getPVBadgeClassName(member.pvStatus)}>
              {formatPV(member.totalPV)}
            </span>
          ) : (
            formatPV(member.totalPV)
          )}
          <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
            Po przerwie
          </span>
        </div>
      )
    }

    // Standardowe renderowanie PV
    if (member.orderType === 'internet') {
      return (
        <span className="inline-flex items-center rounded-full bg-[#eff6ff] px-2.5 py-0.5 text-xs font-semibold text-blue-700">
          {formatPV(member.totalPV)}
        </span>
      )
    }
    if (member.pvStatus !== 'normal') {
      return (
        <span className={getPVBadgeClassName(member.pvStatus)}>
          {formatPV(member.totalPV)}
        </span>
      )
    }
    return formatPV(member.totalPV)
  }

  const renderName = (member: StructureMember) => {
    const isBreakNameColor = breakVariant === 'name-color' && member.isAfterBreak
    const isBreakNameBadge = breakVariant === 'name-badge' && member.isAfterBreak

    return (
      <div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onMemberClick?.(member)}
            className={`font-medium text-left hover:underline transition-colors ${
              isBreakNameColor
                ? 'text-orange-600 hover:text-orange-700'
                : 'hover:text-green-600'
            }`}
          >
            {member.name}
          </button>
          {isBreakNameBadge && (
            <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
              Po przerwie
            </span>
          )}
        </div>
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
    )
  }

  const variants: { key: BreakVariant; label: string }[] = [
    { key: 'name-color', label: 'Kolor nazwy' },
    { key: 'name-badge', label: 'Badge przy nazwie' },
    { key: 'pv-badge', label: 'Badge przy PV' },
  ]

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-xs text-muted-foreground">Wariant "Po przerwie":</span>
        {variants.map((v) => (
          <button
            key={v.key}
            onClick={() => setBreakVariant(v.key)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
              breakVariant === v.key
                ? 'bg-orange-100 border-orange-300 text-orange-700 font-semibold'
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Klient</TableHead>
            <TableHead>Zamówienia</TableHead>
            <TableHead>PV</TableHead>
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
            <TableRow
              key={member.id}
            >
              <TableCell>{renderName(member)}</TableCell>
              <TableCell>{member.ordersCount}</TableCell>
              <TableCell>{renderPV(member)}</TableCell>
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
    </div>
  )
}
