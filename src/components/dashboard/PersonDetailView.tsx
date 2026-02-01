import { useState } from 'react'
import { Copy, Star, Zap, TrendingUp, BarChart3, User, CheckCircle, MinusCircle, ChevronLeft, ChevronRight, Settings, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RankPlanner } from './RankPlanner'
import type { StructureMember } from '@/types'

interface PersonDetailViewProps {
  member: StructureMember
  currentMonth: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  structureMembers: StructureMember[]
  onMemberClick?: (member: StructureMember) => void
}

export function PersonDetailView({
  member,
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  structureMembers,
  onMemberClick,
}: PersonDetailViewProps) {
  const [isInfoExpanded, setIsInfoExpanded] = useState(false)
  const [isPathExpanded, setIsPathExpanded] = useState(false)
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatPV = (value: number) =>
    value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  // Mock dane metryk dla widoku szczegółowego (w przyszłości z props)
  const mockMetrics = {
    ov: {
      totalPV: member.totalPV,
      lrpVolume: member.totalPV * 0.75,
      lrpPercentage: 75
    },
    pgv: {
      currentPV: 423.50,
      goals: [
        { label: 'Cel 400', isAchieved: true, remaining: 0 },
        { label: 'Cel 800', isAchieved: false, remaining: 376.50 }
      ]
    },
    clusterVolume: {
      volumePV: 202.50,
      clusterType: 'PO3',
      lrpGoalAchieved: true,
      lrpGoalLabel: 'Cel 100',
      nextGoal: { target: 500, remaining: 297.50 }
    },
    clientStats: {
      orderingCount: 27,
      newMembers: 3,
      personallyEnrolled: 1
    }
  }

  // Generuj inicjały z imienia
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Formatowanie miesiąca
  const monthName = currentMonth.toLocaleDateString('pl-PL', {
    month: 'long',
    year: 'numeric',
  })
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  return (
    <div className="space-y-4">
      {/* ========== SEKCJA 1: INFORMACJE O OSOBIE (statyczne) ========== */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
        {/* Górny pasek: Badge + breadcrumb w jednej linii */}
        <div className="flex items-center gap-3 py-2 mb-4 sm:mb-6 pb-4 border-b border-gray-100 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            <User className="w-3.5 h-3.5" />
            Profil
          </span>
          {member.path && member.path.length > 0 && (
            <>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                {(() => {
                  const path = member.path || []
                  const shouldCollapse = path.length > 3 && !isPathExpanded

                  const renderNode = (node: { id: string; name: string }, index: number) => (
                    <span key={node.id} className="flex items-center gap-2">
                      {index > 0 && <span className="text-gray-400">&gt;</span>}
                      <button
                        onClick={() => {
                          if (onMemberClick) {
                            const nodeMember: StructureMember = {
                              id: node.id,
                              name: node.name,
                              totalPV: 0,
                              ordersCount: 0,
                              pvStatus: 'normal',
                              lastOrderDate: null,
                              sponsor: { id: '', name: '' },
                              enroller: { id: '', name: '' },
                              membershipType: 'WA',
                              fastStart: { daysRemaining: null, status: 'none' },
                              remainingPGVMonths: null,
                              path: member.path?.slice(0, index),
                            }
                            onMemberClick(nodeMember)
                          }
                        }}
                        className="text-gray-500 hover:text-green-600 hover:underline transition-colors"
                      >
                        {node.name}
                      </button>
                    </span>
                  )

                  if (shouldCollapse) {
                    return (
                      <>
                        {renderNode(path[0], 0)}
                        <span className="text-gray-400">&gt;</span>
                        <button
                          onClick={() => setIsPathExpanded(true)}
                          className="text-gray-400 hover:text-green-600 transition-colors px-1"
                          title="Kliknij aby rozwinąć pełną ścieżkę"
                        >
                          ...
                        </button>
                        <span className="text-gray-400">&gt;</span>
                        {renderNode(path[path.length - 1], path.length - 1)}
                      </>
                    )
                  }

                  return path.map((node, index) => renderNode(node, index))
                })()}
                <span className="text-gray-400">&gt;</span>
                <span className="font-medium text-gray-800">{member.name}</span>
                {isPathExpanded && member.path && member.path.length > 3 && (
                  <button
                    onClick={() => setIsPathExpanded(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 ml-2"
                  >
                    (zwiń)
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center text-lg sm:text-xl font-semibold text-gray-600 flex-shrink-0">
            {getInitials(member.name)}
          </div>

          {/* Dane osoby */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{member.name}</h1>
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              {/* Ikonka info */}
              {(member.sponsor || member.enroller) && (
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
              <span className="text-xs sm:text-sm text-gray-500">ID: {member.id}</span>
              <button onClick={() => copyToClipboard(member.id)} className="text-gray-400 hover:text-gray-600">
                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm">
                Silver
              </span>
              {/* Statystyki struktury - inline */}
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="text-xs sm:text-sm text-gray-500">
                Struktura: <span className="font-semibold text-gray-700">350</span>
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                Premier+: <span className="font-semibold text-gray-700">1</span>
              </span>
            </div>
          </div>
        </div>

        {/* Rozwijana sekcja Sponsor/Enroller */}
        {isInfoExpanded && (member.sponsor || member.enroller) && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:gap-4">
            {member.sponsor && member.sponsor.id && (
              <div
                className="flex-1 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => {
                  if (onMemberClick && member.sponsor) {
                    const sponsorMember: StructureMember = {
                      id: member.sponsor.id,
                      name: member.sponsor.name,
                      totalPV: 0,
                      ordersCount: 0,
                      pvStatus: 'normal',
                      lastOrderDate: null,
                      sponsor: { id: '', name: '' },
                      enroller: { id: '', name: '' },
                      membershipType: 'WA',
                      fastStart: { daysRemaining: null, status: 'none' },
                      remainingPGVMonths: null,
                    }
                    onMemberClick(sponsorMember)
                  }
                }}
              >
                <div className="text-xs text-gray-500 mb-1">Sponsor</div>
                <div className="text-sm font-semibold text-gray-800 hover:text-green-600">
                  {member.sponsor.name}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <span>ID: {member.sponsor.id}</span>
                  <button onClick={(e) => { e.stopPropagation(); copyToClipboard(member.sponsor!.id) }} className="hover:text-gray-600">
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {member.enroller && member.enroller.id && (
              <div
                className="flex-1 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => {
                  if (onMemberClick && member.enroller) {
                    const enrollerMember: StructureMember = {
                      id: member.enroller.id,
                      name: member.enroller.name,
                      totalPV: 0,
                      ordersCount: 0,
                      pvStatus: 'normal',
                      lastOrderDate: null,
                      sponsor: { id: '', name: '' },
                      enroller: { id: '', name: '' },
                      membershipType: 'WA',
                      fastStart: { daysRemaining: null, status: 'none' },
                      remainingPGVMonths: null,
                    }
                    onMemberClick(enrollerMember)
                  }
                }}
              >
                <div className="text-xs text-gray-500 mb-1">Enroller</div>
                <div className="text-sm font-semibold text-gray-800 hover:text-green-600">
                  {member.enroller.name}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <span>ID: {member.enroller.id}</span>
                  <button onClick={(e) => { e.stopPropagation(); copyToClipboard(member.enroller!.id) }} className="hover:text-gray-600">
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========== SEKCJA 2: DANE MIESIĘCZNE (z selektorem) ========== */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        {/* Nagłówek z selektorem miesiąca */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Dane za miesiąc</h2>
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
          </div>
        </div>

        {/* Zawartość sekcji danych miesięcznych */}
        <div className="p-6 space-y-6">
          {/* 4 karty metryk */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Karta OV */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-2xl text-gray-800">{formatPV(mockMetrics.ov.totalPV)} PV</h3>
                <p className="text-xs font-medium text-gray-500">Wartość obrotu struktury OV</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="text-xs mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600">Objętość LRP:</span>
              <span className="font-semibold text-gray-800">
                {formatPV(mockMetrics.ov.lrpVolume)} PV ({mockMetrics.ov.lrpPercentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-orange-400 h-1.5 rounded-full transition-all"
                style={{ width: `${mockMetrics.ov.lrpPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Karta PGV */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-2xl text-gray-800">{formatPV(mockMetrics.pgv.currentPV)} PV</h3>
              <p className="text-xs font-medium text-gray-500">PGV</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 text-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-2 text-xs mt-4">
            {mockMetrics.pgv.goals.map((goal, index) => (
              <div key={index} className="flex items-center text-gray-600">
                {goal.isAchieved ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1.5 flex-shrink-0" />
                    <span>{goal.label}</span>
                  </>
                ) : (
                  <>
                    <MinusCircle className="w-4 h-4 text-gray-400 mr-1.5 flex-shrink-0" />
                    <span>{goal.label}, brakuje: {formatPV(goal.remaining)} PV</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Karta Wolumen Klastra */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-2xl text-gray-800">{formatPV(mockMetrics.clusterVolume.volumePV)} PV</h3>
              <p className="text-xs font-medium text-gray-500">
                Wolumen Klastra {mockMetrics.clusterVolume.clusterType}
              </p>
            </div>
            <div className="w-10 h-10 bg-gray-100 text-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-2 text-xs mt-4">
            <div className="flex items-center text-gray-600">
              {mockMetrics.clusterVolume.lrpGoalAchieved ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1.5 flex-shrink-0" />
                  <span>{mockMetrics.clusterVolume.lrpGoalLabel}</span>
                </>
              ) : (
                <>
                  <MinusCircle className="w-4 h-4 text-gray-400 mr-1.5 flex-shrink-0" />
                  <span>{mockMetrics.clusterVolume.lrpGoalLabel}</span>
                </>
              )}
            </div>
            {mockMetrics.clusterVolume.nextGoal && (
              <div className="flex items-center text-gray-600">
                <MinusCircle className="w-4 h-4 text-gray-400 mr-1.5 flex-shrink-0" />
                <span>
                  Cel {mockMetrics.clusterVolume.nextGoal.target}, brakuje: {formatPV(mockMetrics.clusterVolume.nextGoal.remaining)} PV
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Karta Statystyki */}
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
              <span className="font-semibold text-gray-800">{mockMetrics.clientStats.orderingCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Nowi członkowie:</span>
              <span className="font-semibold text-gray-800">{mockMetrics.clientStats.newMembers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Zapisani osobiście:</span>
              <span className="font-semibold text-gray-800">{mockMetrics.clientStats.personallyEnrolled}</span>
            </div>
          </div>
        </div>
          </div>

          {/* Grid: Struktura bezpośrednia + pusta karta */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sekcja struktury bezpośredniej */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-800">Struktura bezpośrednia</h3>
              </div>

            {/* Lista osób w pierwszej linii */}
            <div className="space-y-3">
              {[
                { id: '18123456', name: 'Kowalski Marek', totalPV: 245.00, membershipType: 'WA' as const, color: 'green' },
                { id: '18234567', name: 'Adamska Nina', totalPV: 128.50, membershipType: 'WC' as const, color: 'blue' },
                { id: '18345678', name: 'Tomaszewski Piotr', totalPV: 89.00, membershipType: 'WA' as const, color: 'orange' },
                { id: '18456789', name: 'Mazur Zofia', totalPV: 0.00, membershipType: 'WA' as const, color: 'pink' },
              ].map((person) => {
                const colorClasses: Record<string, { bg: string; text: string }> = {
                  green: { bg: 'bg-green-100', text: 'text-green-700' },
                  blue: { bg: 'bg-blue-100', text: 'text-blue-700' },
                  orange: { bg: 'bg-orange-100', text: 'text-orange-700' },
                  pink: { bg: 'bg-pink-100', text: 'text-pink-700' },
                }
                const typeColors: Record<string, { bg: string; text: string }> = {
                  WA: { bg: 'bg-green-100', text: 'text-green-700' },
                  WC: { bg: 'bg-purple-100', text: 'text-purple-700' },
                }
                const isInactive = person.totalPV === 0

                const handleClick = () => {
                  if (onMemberClick) {
                    // Tworzymy tymczasowy obiekt StructureMember
                    const mockMember: StructureMember = {
                      id: person.id,
                      name: person.name,
                      totalPV: person.totalPV,
                      ordersCount: 1,
                      pvStatus: 'normal',
                      lastOrderDate: new Date(),
                      sponsor: { id: '', name: '' },
                      enroller: { id: '', name: '' },
                      membershipType: person.membershipType,
                      fastStart: { daysRemaining: null, status: 'none' },
                      remainingPGVMonths: null,
                    }
                    onMemberClick(mockMember)
                  }
                }

                return (
                  <div
                    key={person.id}
                    onClick={handleClick}
                    className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${colorClasses[person.color].bg} rounded-full flex items-center justify-center text-sm font-semibold ${colorClasses[person.color].text}`}>
                        {getInitials(person.name)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 hover:text-green-600">{person.name}</div>
                        <div className="text-xs text-gray-500">ID: {person.id}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">{formatPV(person.totalPV)} PV</div>
                      <span className={`px-2 py-0.5 ${isInactive ? 'bg-gray-100 text-gray-600' : typeColors[person.membershipType].bg + ' ' + typeColors[person.membershipType].text} rounded text-xs`}>
                        {isInactive ? 'Nieaktywny' : person.membershipType}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm">
                <span className="text-gray-500">Łącznie w pierwszej linii:</span>
                <span className="font-semibold text-gray-800">4 osoby • 462.50 PV</span>
              </div>
            </div>

            {/* Pusta karta - placeholder */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Do zaimplementowania</h3>
              <div className="h-48 flex items-center justify-center text-gray-400">
                Miejsce na nową funkcjonalność
              </div>
            </div>
          </div>

          {/* Sekcja planera rangi */}
          <div className="bg-gray-50 rounded-xl p-4 overflow-visible">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Planowanie rangi</h3>
            <RankPlanner structureMembers={structureMembers} memberOV={member.totalPV} />
          </div>
        </div>
      </div>

      {/* ========== SEKCJA 3: WYKRES STATYSTYK (historyczne, niezależne od miesiąca) ========== */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Statystyki miesięczne</h2>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">OV</button>
            <button className="px-3 py-1 bg-white border border-green-500 text-green-600 rounded-full text-sm">
              Team LRP
            </button>
          </div>
        </div>

        {/* Placeholder dla wykresu */}
        <div className="h-48 bg-gradient-to-r from-green-50 to-purple-50 rounded-xl flex items-center justify-center text-gray-400">
          Wykres statystyk miesięcznych (do zaimplementowania)
        </div>

        {/* Legenda */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-gray-600">OV</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
            <span className="text-gray-600">Team LRP</span>
          </div>
        </div>
      </div>

      {/* ========== SEKCJA 4: ZAMÓWIENIA + PUSTA KARTA ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Zamówienia</h2>
          </div>

          {/* Tabela zamówień */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">Nr zamówienia</th>
                  <th className="pb-3 font-medium">Data</th>
                  <th className="pb-3 font-medium text-right">Objętość PV</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">▼</span>
                      <span className="font-medium">174385478</span>
                      <Copy className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600" />
                    </div>
                  </td>
                  <td className="py-3 text-gray-600">04.01.2026</td>
                  <td className="py-3 text-right text-orange-500 font-medium">{formatPV(member.totalPV)}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      Opłacone
                    </span>
                  </td>
                </tr>
                {member.ordersCount > 1 && (
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">▼</span>
                        <span className="font-medium">173740691</span>
                        <Copy className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600" />
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">16.12.2025</td>
                    <td className="py-3 text-right text-gray-500">-</td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        Opłacone
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pusta karta - placeholder */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Do zaimplementowania</h2>
          <div className="h-48 flex items-center justify-center text-gray-400">
            Miejsce na nową funkcjonalność
          </div>
        </div>
      </div>
    </div>
  )
}
