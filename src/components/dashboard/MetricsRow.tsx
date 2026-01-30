import { useState } from 'react'
import { OVMetricCard } from './OVMetricCard'
import { PGVMetricCard } from './PGVMetricCard'
import { ClusterVolumeCard } from './ClusterVolumeCard'
import { ClientStatsCard } from './ClientStatsCard'
import { Copy, Star, ChevronDown, Check, ChevronLeft, ChevronRight, Settings, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DashboardMetrics, UserProfile } from '@/types'

interface WAMember {
  id: string
  name: string
}

interface MetricsRowProps {
  personName: string | null
  metrics: DashboardMetrics
  userProfile: UserProfile
  onChangePerson?: (person: WAMember) => void
  onPersonLinkClick?: (person: WAMember) => void
  currentMonth: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
}

const defaultWAMembers: WAMember[] = [
  { id: '14769732', name: 'Chodorowska Emilia' },
  { id: '15129265', name: 'Sybal Wioletta' },
  { id: '17114570', name: 'Kluj Aneta' },
  { id: '17703928', name: 'Szypłowska Gabriela' },
  { id: '18438681', name: 'Janus Dominika' },
  { id: '15341016', name: 'Śledziewska Marta' },
  { id: '18567890', name: 'Flisak Monika' },
]

export function MetricsRow({
  personName,
  metrics,
  userProfile,
  onChangePerson,
  onPersonLinkClick,
  currentMonth,
  onPreviousMonth,
  onNextMonth,
}: MetricsRowProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isInfoExpanded, setIsInfoExpanded] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSelectPerson = (member: WAMember) => {
    onChangePerson?.(member)
    setIsDropdownOpen(false)
  }

  const monthName = currentMonth.toLocaleDateString('pl-PL', {
    month: 'long',
    year: 'numeric',
  })
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
        {/* Górny pasek: Selektor WA + Selektor miesiąca */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 border-b border-gray-100">
          {/* Selektor WA */}
          <div className="relative flex items-center gap-2">
            <span className="text-sm text-gray-500">Panel WA:</span>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-full text-sm font-medium transition-colors"
            >
              {personName || userProfile.name}
              <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-lg z-20 py-2">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Wybierz osobę WA
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {defaultWAMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => handleSelectPerson(member)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-800">{member.name}</div>
                          <div className="text-xs text-gray-500">ID: {member.id}</div>
                        </div>
                        {member.name === personName && (
                          <Check className="h-4 w-4 text-green-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Selektor miesiąca */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Miesiąc:</span>
            <div className="flex items-center bg-gray-100 rounded-full">
              <Button variant="ghost" size="icon" onClick={onPreviousMonth} className="rounded-full h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center px-2">
                {capitalizedMonth}
              </span>
              <Button variant="ghost" size="icon" onClick={onNextMonth} className="rounded-full h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Profil z ikonką info */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center text-lg sm:text-xl font-semibold text-gray-600 flex-shrink-0">
            {getInitials(userProfile.name)}
          </div>

          {/* Dane osoby */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPersonLinkClick?.({ id: userProfile.id, name: personName || userProfile.name })}
                className="text-lg sm:text-xl font-bold text-gray-800 hover:text-green-600 hover:underline transition-colors text-left truncate"
              >
                {personName || userProfile.name}
              </button>
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              {/* Ikonka info */}
              {(userProfile.sponsor || userProfile.enroller) && (
                <button
                  onClick={() => setIsInfoExpanded(!isInfoExpanded)}
                  className={`p-1 rounded-full transition-colors flex-shrink-0 ${
                    isInfoExpanded
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Pokaż Sponsor/Enroller"
                >
                  <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
              <span className="text-xs sm:text-sm text-gray-500">ID: {userProfile.id}</span>
              <button onClick={() => copyToClipboard(userProfile.id)} className="text-gray-400 hover:text-gray-600">
                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm">
                Silver
              </span>
            </div>
          </div>
        </div>

        {/* Rozwijana sekcja Sponsor/Enroller */}
        {isInfoExpanded && (userProfile.sponsor || userProfile.enroller) && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:gap-4">
            {userProfile.sponsor && (
              <div className="flex-1 bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">Sponsor</div>
                <button
                  onClick={() => onPersonLinkClick?.(userProfile.sponsor!)}
                  className="text-sm font-semibold text-gray-800 hover:text-green-600 hover:underline"
                >
                  {userProfile.sponsor.name}
                </button>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <span>ID: {userProfile.sponsor.id}</span>
                  <button onClick={() => copyToClipboard(userProfile.sponsor!.id)} className="hover:text-gray-600">
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {userProfile.enroller && (
              <div className="flex-1 bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">Enroller</div>
                <button
                  onClick={() => onPersonLinkClick?.(userProfile.enroller!)}
                  className="text-sm font-semibold text-gray-800 hover:text-green-600 hover:underline"
                >
                  {userProfile.enroller.name}
                </button>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <span>ID: {userProfile.enroller.id}</span>
                  <button onClick={() => copyToClipboard(userProfile.enroller!.id)} className="hover:text-gray-600">
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4 karty metryk */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <OVMetricCard metric={metrics.ov} />
        <PGVMetricCard metric={metrics.pgv} />
        <ClusterVolumeCard metric={metrics.clusterVolume} />
        <ClientStatsCard stats={metrics.clientStats} />
      </div>
    </div>
  )
}
