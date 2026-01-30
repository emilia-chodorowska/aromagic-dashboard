import { User } from 'lucide-react'
import type { ClientStats } from '@/types'

interface ClientStatsCardProps {
  stats: ClientStats
}

export function ClientStatsCard({ stats }: ClientStatsCardProps) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-bold text-2xl text-gray-800">Statystyki</h3>
          <p className="text-xs font-medium text-gray-500">Informacje</p>
        </div>
        <div className="w-10 h-10 bg-gray-100 text-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6" />
        </div>
      </div>
      <div className="space-y-2 text-xs mt-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Liczba zamawiających:</span>
          <span className="font-semibold text-gray-800">{stats.orderingCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Nowi członkowie:</span>
          <span className="font-semibold text-gray-800">{stats.newMembers}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Zapisani osobiście:</span>
          <span className="font-semibold text-gray-800">{stats.personallyEnrolled}</span>
        </div>
      </div>
    </div>
  )
}
