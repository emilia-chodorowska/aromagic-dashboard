import { useState } from 'react'
import { ChevronDown, Check, ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WAMember {
  id: string
  name: string
}

interface SponsorInfo {
  id: string
  name: string
}

interface StatsHeaderProps {
  personName: string | null
  personId?: string
  sponsor?: SponsorInfo
  enroller?: SponsorInfo
  waMembers?: WAMember[]
  onChangePerson?: (person: WAMember) => void
  currentMonth?: Date
  onPreviousMonth?: () => void
  onNextMonth?: () => void
  showSponsorInfo?: boolean
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

export function StatsHeader({
  personName,
  personId,
  sponsor,
  enroller,
  waMembers = defaultWAMembers,
  onChangePerson,
  currentMonth = new Date(2026, 0, 1),
  onPreviousMonth,
  onNextMonth,
  showSponsorInfo = false
}: StatsHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (member: WAMember) => {
    onChangePerson?.(member)
    setIsOpen(false)
  }

  const monthName = currentMonth.toLocaleDateString('pl-PL', {
    month: 'long',
    year: 'numeric',
  })
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  return (
    <div className={`flex items-center justify-between ${showSponsorInfo ? 'mb-8' : 'mb-4'} relative`}>
      <div className="relative flex items-center gap-2">
        <span className="text-sm text-gray-600">Panel struktury WA:</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 rounded-full text-sm font-medium transition-colors"
        >
          {personName}
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            {/* Menu */}
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-lg z-20 py-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Wybierz osobę WA
              </div>
              <div className="max-h-64 overflow-y-auto">
                {waMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleSelect(member)}
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

      {/* Month Selector */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onPreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[140px] text-center">
          {capitalizedMonth}
        </span>
        <Button variant="ghost" size="icon" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Opcja 2: Sponsor/Enroller info w nagłówku */}
      {showSponsorInfo && (sponsor || enroller) && (
        <div className="absolute top-full left-0 right-0 mt-1 flex items-center gap-4 text-xs text-gray-500">
          {personId && <span>ID: {personId}</span>}
          {sponsor && (
            <span>
              Sponsor: <span className="text-gray-700">{sponsor.name}</span>
              <span className="text-gray-400 ml-1">({sponsor.id})</span>
            </span>
          )}
          {enroller && (
            <span>
              Enroller: <span className="text-gray-700">{enroller.name}</span>
              <span className="text-gray-400 ml-1">({enroller.id})</span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
