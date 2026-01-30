import { useState, useRef } from 'react'
import { ChevronDown, Check, AlertCircle, Plus, X } from 'lucide-react'
import type { StructureMember } from '@/types'

// Wymagania doTERRA dla każdej rangi (oficjalne dane)
// * = wymóg personally enrolled
// Tylko rangi wymagające nóg - od Premier wzwyż
const RANK_REQUIREMENTS = [
  { id: 'premier', name: 'Premier', totalOV: 5000, legs: 2, legRank: 'Executive', legOV: 2000, personallyEnrolled: true, color: '#3b82f6' },
  { id: 'silver', name: 'Silver', totalOV: null, legs: 3, legRank: 'Elite', legOV: 3000, personallyEnrolled: true, color: '#8b5cf6' },
  { id: 'gold', name: 'Gold', totalOV: null, legs: 3, legRank: 'Premier', legOV: 5000, personallyEnrolled: true, color: '#f59e0b' },
  { id: 'platinum', name: 'Platinum', totalOV: null, legs: 3, legRank: 'Silver', legOV: null, personallyEnrolled: false, color: '#a855f7' },
  { id: 'diamond', name: 'Diamond', totalOV: null, legs: 4, legRank: 'Silver', legOV: null, personallyEnrolled: false, color: '#ec4899' },
  { id: 'blue-diamond', name: 'Blue Diamond', totalOV: null, legs: 5, legRank: 'Gold', legOV: null, personallyEnrolled: false, color: '#2563eb' },
  { id: 'presidential', name: 'Presidential', totalOV: null, legs: 6, legRank: 'Platinum', legOV: null, personallyEnrolled: false, color: '#dc2626' },
]

interface PlannedOrder {
  id: string
  description: string
  value: number
}

// Dostępne rejestracje do przeniesienia (mock data - w przyszłości z props)
const AVAILABLE_REGISTRATIONS = [
  { id: 'reg1', name: 'Nowak Anna', pv: 150.00, date: '2026-01-15' },
  { id: 'reg2', name: 'Wiśniewski Jan', pv: 200.00, date: '2026-01-18' },
  { id: 'reg3', name: 'Kowalczyk Maria', pv: 125.50, date: '2026-01-20' },
  { id: 'reg4', name: 'Wójcik Piotr', pv: 180.00, date: '2026-01-22' },
]

interface MovedRegistration {
  id: string
  name: string
  pv: number
}

interface LegAssignment {
  index: number
  memberId: string | null
  memberName: string
  memberOV: number
  plannedOrders: PlannedOrder[] // lista planowanych zamówień
  movedRegistrations: MovedRegistration[] // przeniesione rejestracje
}

interface RankPlannerProps {
  structureMembers: StructureMember[]
  memberOV: number // OV osoby z PersonDetailView - do podsumowania
}

export function RankPlanner({ structureMembers, memberOV }: RankPlannerProps) {
  const [selectedRankId, setSelectedRankId] = useState<string | null>(null)
  const [legs, setLegs] = useState<LegAssignment[]>([])
  const [isRankDropdownOpen, setIsRankDropdownOpen] = useState(false)
  const newOrderInputRef = useRef<HTMLInputElement>(null)
  
  const selectedRank = RANK_REQUIREMENTS.find(r => r.id === selectedRankId)

  const handleRankSelect = (rankId: string) => {
    const rank = RANK_REQUIREMENTS.find(r => r.id === rankId)
    if (!rank) return

    setSelectedRankId(rankId)
    setIsRankDropdownOpen(false)

    // Inicjalizuj puste nogi dla wybranej rangi
    const newLegs: LegAssignment[] = Array.from({ length: rank.legs }, (_, i) => ({
      index: i,
      memberId: null,
      memberName: '',
      memberOV: 0,
      plannedOrders: [],
      movedRegistrations: [],
    }))
    setLegs(newLegs)
  }

  const handleLegAssignment = (legIndex: number, memberId: string) => {
    const member = structureMembers.find(m => m.id === memberId)

    setLegs(prev => prev.map((leg, i) => {
      if (i === legIndex) {
        return {
          ...leg,
          memberId: memberId || null,
          memberName: member?.name || '',
          memberOV: member?.totalPV || 0,
        }
      }
      return leg
    }))
  }

  const addPlannedOrder = (legIndex: number) => {
    setLegs(prev => prev.map((l, i) => {
      if (i === legIndex) {
        return {
          ...l,
          plannedOrders: [
            ...l.plannedOrders,
            { id: crypto.randomUUID(), description: '', value: 0 }
          ]
        }
      }
      return l
    }))
    setTimeout(() => newOrderInputRef.current?.focus(), 0)
  }

  const updatePlannedOrder = (legIndex: number, orderId: string, field: 'description' | 'value', value: string | number) => {
    setLegs(prev => prev.map((leg, i) => {
      if (i === legIndex) {
        return {
          ...leg,
          plannedOrders: leg.plannedOrders.map(order =>
            order.id === orderId
              ? { ...order, [field]: field === 'value' ? (parseFloat(String(value)) || 0) : value }
              : order
          )
        }
      }
      return leg
    }))
  }

  const removePlannedOrder = (legIndex: number, orderId: string) => {
    setLegs(prev => prev.map((leg, i) => {
      if (i === legIndex) {
        return {
          ...leg,
          plannedOrders: leg.plannedOrders.filter(order => order.id !== orderId)
        }
      }
      return leg
    }))
  }

  // Pobierz wszystkie już przypisane rejestracje we wszystkich nogach
  const getAllAssignedRegistrationIds = () => {
    return legs.flatMap(leg => leg.movedRegistrations.map(r => r.id))
  }

  // Pobierz dostępne rejestracje (te które nie są jeszcze przypisane)
  const getAvailableRegistrations = () => {
    const assignedIds = getAllAssignedRegistrationIds()
    return AVAILABLE_REGISTRATIONS.filter(r => !assignedIds.includes(r.id))
  }

  const addMovedRegistration = (legIndex: number, registrationId: string) => {
    const registration = AVAILABLE_REGISTRATIONS.find(r => r.id === registrationId)
    if (!registration) return

    setLegs(prev => prev.map((leg, i) => {
      if (i === legIndex) {
        return {
          ...leg,
          movedRegistrations: [
            ...leg.movedRegistrations,
            { id: registration.id, name: registration.name, pv: registration.pv }
          ]
        }
      }
      return leg
    }))
  }

  const removeMovedRegistration = (legIndex: number, registrationId: string) => {
    setLegs(prev => prev.map((leg, i) => {
      if (i === legIndex) {
        return {
          ...leg,
          movedRegistrations: leg.movedRegistrations.filter(r => r.id !== registrationId)
        }
      }
      return leg
    }))
  }

  const getPlannedOVTotal = (leg: LegAssignment) => leg.plannedOrders.reduce((sum, o) => sum + o.value, 0)
  const getMovedOVTotal = (leg: LegAssignment) => leg.movedRegistrations.reduce((sum, r) => sum + r.pv, 0)
  // Suma OV nogi = OV wybranego WA + planowane zamówienia + przeniesione rejestracje
  const getLegTotalOV = (leg: LegAssignment) => leg.memberOV + getPlannedOVTotal(leg) + getMovedOVTotal(leg)

  // Przewidywana SUMA OV = OV osoby z PersonDetailView + wszystkie planowane zamówienia ze wszystkich nóg
  const totalPlannedOrders = legs.reduce((sum, leg) => sum + getPlannedOVTotal(leg), 0)
  const totalAssignedOV = memberOV + totalPlannedOrders

  // Dla rang z totalOV (Premier) sprawdzamy czy suma OV >= totalOV
  // Dla rang bez totalOV (Silver+) sprawdzamy czy wszystkie nogi osiągnęły wymagany poziom
  const isOVMet = selectedRank
    ? selectedRank.totalOV
      ? totalAssignedOV >= selectedRank.totalOV && legs.every(leg => selectedRank.legOV ? getLegTotalOV(leg) >= selectedRank.legOV : leg.memberId !== null)
      : selectedRank.legOV
        ? legs.every(leg => getLegTotalOV(leg) >= selectedRank.legOV!)
        : legs.length === selectedRank.legs && legs.every(leg => leg.memberId !== null)
    : false

  const formatPV = (value: number) =>
    value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  // Helper do wyświetlania opisu wymagań rangi
  const getRankDescription = (rank: typeof RANK_REQUIREMENTS[0]) => {
    const totalOVPart = rank.totalOV ? `${formatPV(rank.totalOV)} OV, ` : ''
    if (rank.legOV) {
      return `${totalOVPart}${rank.legs} nogi × ${formatPV(rank.legOV)} OV (${rank.legRank})${rank.personallyEnrolled ? '*' : ''}`
    }
    return `${totalOVPart}${rank.legs} nogi na poziomie ${rank.legRank}${rank.personallyEnrolled ? '*' : ''}`
  }

  return (
    <div className="space-y-4">
      {/* Wybór rangi docelowej */}
      <div className="relative">
        <div className="w-full flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
          <button
            type="button"
            onClick={() => setIsRankDropdownOpen(!isRankDropdownOpen)}
            className="flex-1 flex items-center justify-between cursor-pointer"
          >
            {selectedRank ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedRank.color }}
                />
                <span className="font-medium">{selectedRank.name}</span>
                <span className="text-sm text-gray-500">
                  ({getRankDescription(selectedRank)})
                </span>
              </div>
            ) : (
              <span className="text-gray-400">Wybierz rangę docelową...</span>
            )}
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isRankDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {selectedRank && (
            <button
              type="button"
              onClick={() => {
                setSelectedRankId(null)
                setLegs([])
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Wyczyść wybór"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Dropdown lista */}
        {isRankDropdownOpen && (
          <>
            {/* Overlay do zamykania */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsRankDropdownOpen(false)}
            />
            {/* Lista rozwijana */}
            <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {RANK_REQUIREMENTS.map(rank => (
                <button
                  type="button"
                  key={rank.id}
                  onClick={() => handleRankSelect(rank.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left cursor-pointer ${
                    selectedRankId === rank.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: rank.color }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {rank.name}
                      {rank.personallyEnrolled && <span className="text-xs text-gray-400 ml-1">*</span>}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getRankDescription(rank)}
                    </div>
                  </div>
                  {selectedRankId === rank.id && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Przypisywanie nóg */}
      {selectedRank && (
        <div className="space-y-4">
          <div className="text-sm text-gray-500">Przypisz WA do nóg ({selectedRank.legs} wymagane)</div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {legs.map((leg, index) => {
            const legTotal = getLegTotalOV(leg)
            // Dla rang z legOV sprawdzamy OV, dla innych sprawdzamy czy WA jest przypisany
            const isLegMet = selectedRank.legOV
              ? legTotal >= selectedRank.legOV
              : leg.memberId !== null

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-colors ${
                  isLegMet
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                {/* Nagłówek nogi */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-700">Noga {index + 1}</span>
                  <span className="text-xs text-gray-400">
                    (cel: {selectedRank.legOV ? `${formatPV(selectedRank.legOV)} OV` : selectedRank.legRank})
                  </span>
                </div>

                {/* Wybór WA + aktualny OV */}
                <div className="flex items-center gap-3 mb-2">
                  <select
                    value={leg.memberId || ''}
                    onChange={(e) => handleLegAssignment(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Wybierz WA...</option>
                    {structureMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({formatPV(member.totalPV)} OV)
                      </option>
                    ))}
                  </select>
                  <div className="text-right min-w-[90px]">
                    <div className="text-sm text-gray-600">{formatPV(leg.memberOV)} OV</div>
                    <div className="text-xs text-gray-400">aktualny OV</div>
                  </div>
                </div>

                {/* Przeniesione rejestracje */}
                <div className="space-y-2 mt-3 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Rejestracje do przeniesienia:</span>
                  </div>

                  {/* Dropdown do wyboru rejestracji */}
                  {getAvailableRegistrations().length > 0 && (
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          addMovedRegistration(index, e.target.value)
                          e.target.value = ''
                        }
                      }}
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Wybierz rejestrację do przeniesienia...</option>
                      {getAvailableRegistrations().map(reg => (
                        <option key={reg.id} value={reg.id}>
                          {reg.name} ({formatPV(reg.pv)} PV) - {reg.date}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Lista przeniesionych rejestracji */}
                  {leg.movedRegistrations.map((reg) => (
                    <div key={reg.id} className="group flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-xs">
                      <span className="font-medium text-gray-700">{reg.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{formatPV(reg.pv)} PV</span>
                        <button
                          type="button"
                          onClick={() => removeMovedRegistration(index, reg.id)}
                          className="p-1 text-gray-400 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {leg.movedRegistrations.length > 0 && (
                    <div className="flex justify-between text-xs text-blue-600">
                      <span>Suma przeniesionych:</span>
                      <span>{formatPV(getMovedOVTotal(leg))} PV</span>
                    </div>
                  )}
                </div>

                {/* Planowane zamówienia */}
                <div className="space-y-2 mt-3 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Planowane zamówienia:</span>
                    <button
                      type="button"
                      onClick={() => addPlannedOrder(index)}
                      className="p-0.5 text-gray-400 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {leg.plannedOrders.map((order, orderIndex) => (
                    <div key={order.id} className="group flex items-center gap-2">
                      <input
                        ref={orderIndex === leg.plannedOrders.length - 1 ? newOrderInputRef : null}
                        type="text"
                        placeholder="Opis zamówienia"
                        value={order.description}
                        onChange={(e) => updatePlannedOrder(index, order.id, 'description', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addPlannedOrder(index)
                          }
                        }}
                        className="flex-1 px-2 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          placeholder="0"
                          value={order.value || ''}
                          onChange={(e) => updatePlannedOrder(index, order.id, 'value', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addPlannedOrder(index)
                            }
                          }}
                          className="w-20 px-2 py-1.5 pr-7 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">PV</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePlannedOrder(index, order.id)}
                        className="p-1 text-gray-400 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {leg.plannedOrders.length > 0 && (
                    <div className="flex justify-between text-xs text-blue-600">
                      <span>Suma planowanych:</span>
                      <span>{formatPV(getPlannedOVTotal(leg))} PV</span>
                    </div>
                  )}
                </div>

                {/* Suma OV */}
                {(leg.memberId || leg.plannedOrders.length > 0) && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Suma OV:</span>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">
                        {formatPV(legTotal)} OV
                      </div>
                      <div className="text-xs">
                        {isLegMet ? (
                          <span className="text-gray-500">cel osiągnięty</span>
                        ) : selectedRank.legOV ? (
                          <span className="text-gray-500">brakuje {formatPV(selectedRank.legOV - legTotal)}</span>
                        ) : (
                          <span className="text-gray-500">wymaga rangi {selectedRank.legRank}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          </div>

          {/* Podsumowanie */}
          <div className={`p-4 rounded-lg border-2 ${isOVMet ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOVMet ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="font-medium text-gray-800">
                  {selectedRank.totalOV ? 'Przewidywana SUMA OV' : 'Status nóg'}
                </span>
              </div>
              <div className="text-right">
                {selectedRank.totalOV ? (
                  <>
                    <div className="text-xl font-bold text-gray-800">
                      {formatPV(totalAssignedOV)} OV
                    </div>
                    <div className="text-xs text-gray-500">
                      cel: {formatPV(selectedRank.totalOV)} OV
                      {!isOVMet && totalAssignedOV > 0 && (
                        <span className="text-gray-500 ml-1">
                          (brakuje {formatPV(selectedRank.totalOV - totalAssignedOV)})
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`text-xl font-bold ${isOVMet ? 'text-green-600' : 'text-gray-800'}`}>
                      {legs.filter(leg => selectedRank.legOV ? getLegTotalOV(leg) >= selectedRank.legOV : leg.memberId !== null).length} / {selectedRank.legs}
                    </div>
                    <div className="text-xs text-gray-500">
                      nogi na poziomie {selectedRank.legRank}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${isOVMet ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{
                    width: selectedRank.totalOV
                      ? `${Math.min((totalAssignedOV / selectedRank.totalOV) * 100, 100)}%`
                      : `${Math.min((legs.filter(leg => selectedRank.legOV ? getLegTotalOV(leg) >= selectedRank.legOV : leg.memberId !== null).length / selectedRank.legs) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Informacja o personally enrolled */}
            {selectedRank.personallyEnrolled && (
              <div className="mt-3 text-xs text-gray-500">
                * Nogi muszą być osobiście zapisane (personally enrolled)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
