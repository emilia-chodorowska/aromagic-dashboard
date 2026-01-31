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
  value: string
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

// Zapisane dane sub-planu
interface SubPlanData {
  legs: LegAssignment[]
  otherPlannedOrders: PlannedOrder[] // zamówienia poza nogami (dla totalOV)
  otherMovedRegistrations: MovedRegistration[] // przeniesienia poza nogami (dla totalOV)
  // Podsumowanie planu
  isComplete: boolean       // czy plan spełnia wszystkie wymagania
  totalPlannedOV: number    // suma OV w planie
  legsMet: number           // ile nóg spełnia wymagania
  totalLegs: number         // ile nóg wymaganych
  targetOV?: number         // wymagane totalOV (np. 5000 dla Premier)
  targetLegOV?: number      // wymagane OV na nogę (np. 2000 dla Premier)
}

interface LegAssignment {
  index: number
  memberId: string | null
  memberName: string
  memberOV: number
  plannedOrders: PlannedOrder[] // lista planowanych zamówień
  movedRegistrations: MovedRegistration[] // przeniesione rejestracje
  subPlanSaved?: boolean // czy sub-plan został zapisany (dla rang wymagających sub-rang)
  subPlanData?: SubPlanData // zapisane dane sub-planu
}

interface RankPlannerProps {
  structureMembers: StructureMember[]
  memberOV: number // OV osoby z PersonDetailView - do podsumowania
}

// State dla zagnieżdżonego planowania (modal)
interface SubPlannerModal {
  legIndex: number
  memberId: string
  memberName: string
  memberOV: number
  targetRank: string
  targetRankId: string
  existingData?: SubPlanData // istniejące dane do edycji
}

// Stan planu dla pojedynczej rangi
interface RankPlanState {
  legs: LegAssignment[]
  otherPlannedOrders: PlannedOrder[]
  otherMovedRegistrations: MovedRegistration[]
}

export function RankPlanner({ structureMembers, memberOV }: RankPlannerProps) {
  const [selectedRankId, setSelectedRankId] = useState<string | null>(null)
  const [legs, setLegs] = useState<LegAssignment[]>([])
  const [isRankDropdownOpen, setIsRankDropdownOpen] = useState(false)
  const [openLegDropdown, setOpenLegDropdown] = useState<number | null>(null)
  const newOrderInputRef = useRef<HTMLInputElement>(null)
  const [subPlannerModal, setSubPlannerModal] = useState<SubPlannerModal | null>(null)

  // State dla zamówień/przeniesień poza nogami (tylko dla rang z totalOV jak Premier)
  const [otherPlannedOrders, setOtherPlannedOrders] = useState<PlannedOrder[]>([])
  const [otherMovedRegistrations, setOtherMovedRegistrations] = useState<MovedRegistration[]>([])

  // Zapisane plany per ranga - przy zmianie rangi dane nie są tracone
  const [plansPerRank, setPlansPerRank] = useState<Record<string, RankPlanState>>({})

  const selectedRank = RANK_REQUIREMENTS.find(r => r.id === selectedRankId)

  const handleRankSelect = (rankId: string) => {
    const rank = RANK_REQUIREMENTS.find(r => r.id === rankId)
    if (!rank) return

    // Zapisz bieżący plan przed zmianą rangi
    if (selectedRankId && legs.length > 0) {
      setPlansPerRank(prev => ({
        ...prev,
        [selectedRankId]: {
          legs,
          otherPlannedOrders,
          otherMovedRegistrations
        }
      }))
    }

    setSelectedRankId(rankId)
    setIsRankDropdownOpen(false)

    // Sprawdź czy jest zapisany plan dla nowej rangi
    const existingPlan = plansPerRank[rankId]

    if (existingPlan) {
      // Załaduj istniejący plan
      setLegs(existingPlan.legs)
      setOtherPlannedOrders(existingPlan.otherPlannedOrders)
      setOtherMovedRegistrations(existingPlan.otherMovedRegistrations)
    } else {
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
      setOtherPlannedOrders([])
      setOtherMovedRegistrations([])
    }
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
            { id: crypto.randomUUID(), description: '', value: '' }
          ]
        }
      }
      return l
    }))
    setTimeout(() => newOrderInputRef.current?.focus(), 0)
  }

  const updatePlannedOrder = (legIndex: number, orderId: string, field: 'description' | 'value', value: string) => {
    setLegs(prev => prev.map((leg, i) => {
      if (i === legIndex) {
        return {
          ...leg,
          plannedOrders: leg.plannedOrders.map(order =>
            order.id === orderId
              ? { ...order, [field]: value }
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

  const getPlannedOVTotal = (leg: LegAssignment) => leg.plannedOrders.reduce((sum, o) => sum + (parseFloat(o.value.replace(',', '.')) || 0), 0)
  const getMovedOVTotal = (leg: LegAssignment) => leg.movedRegistrations.reduce((sum, r) => sum + r.pv, 0)
  // Suma OV nogi = OV wybranego WA + planowane zamówienia + przeniesione rejestracje
  const getLegTotalOV = (leg: LegAssignment) => leg.memberOV + getPlannedOVTotal(leg) + getMovedOVTotal(leg)

  // Funkcje dla "Inne w strukturze"
  const getOtherPlannedOVTotal = () => otherPlannedOrders.reduce((sum, o) => sum + (parseFloat(o.value.replace(',', '.')) || 0), 0)
  const getOtherMovedOVTotal = () => otherMovedRegistrations.reduce((sum, r) => sum + r.pv, 0)

  const addOtherPlannedOrder = () => {
    setOtherPlannedOrders(prev => [
      ...prev,
      { id: crypto.randomUUID(), description: '', value: '' }
    ])
  }

  const updateOtherPlannedOrder = (orderId: string, field: 'description' | 'value', value: string) => {
    setOtherPlannedOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, [field]: value } : order
    ))
  }

  const removeOtherPlannedOrder = (orderId: string) => {
    setOtherPlannedOrders(prev => prev.filter(order => order.id !== orderId))
  }

  const addOtherMovedRegistration = (registrationId: string) => {
    const registration = AVAILABLE_REGISTRATIONS.find(r => r.id === registrationId)
    if (!registration) return
    setOtherMovedRegistrations(prev => [
      ...prev,
      { id: registration.id, name: registration.name, pv: registration.pv }
    ])
  }

  const removeOtherMovedRegistration = (registrationId: string) => {
    setOtherMovedRegistrations(prev => prev.filter(r => r.id !== registrationId))
  }

  // Przewidywana SUMA OV = OV osoby z PersonDetailView + wszystkie planowane zamówienia (nogi + inne)
  // Przeniesienia NIE zwiększają total OV - to tylko reorganizacja osób w strukturze
  const totalPlannedOrders = legs.reduce((sum, leg) => sum + getPlannedOVTotal(leg), 0)
  const totalAssignedOV = memberOV + totalPlannedOrders + getOtherPlannedOVTotal()

  // Sprawdza czy noga spełnia wymagania
  const isLegRequirementMet = (leg: LegAssignment) => {
    // Dla rang wymagających sub-rang (np. Gold → Premier) sprawdzamy czy plan jest SPEŁNIONY
    const requiresSubRank = selectedRank && RANK_REQUIREMENTS.find(r => r.name === selectedRank.legRank)
    if (requiresSubRank) {
      return leg.subPlanData?.isComplete === true
    }
    // Dla rang z legOV sprawdzamy: przypisana osoba (WA) ORAZ OV >= wymagany
    if (selectedRank?.legOV) {
      return leg.memberId !== null && getLegTotalOV(leg) >= selectedRank.legOV
    }
    // Dla innych sprawdzamy czy WA jest przypisany
    return leg.memberId !== null
  }

  // Dla rang z totalOV (Premier) sprawdzamy czy suma OV >= totalOV
  // Dla rang bez totalOV (Silver+) sprawdzamy czy wszystkie nogi osiągnęły wymagany poziom
  const isOVMet = selectedRank
    ? selectedRank.totalOV
      ? totalAssignedOV >= selectedRank.totalOV && legs.every(isLegRequirementMet)
      : legs.length === selectedRank.legs && legs.every(isLegRequirementMet)
    : false

  const formatPV = (value: number) =>
    value.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

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
                // Usuń plan dla bieżącej rangi z mapy
                if (selectedRankId) {
                  setPlansPerRank(prev => {
                    const { [selectedRankId]: _, ...rest } = prev
                    return rest
                  })
                }
                setSelectedRankId(null)
                setLegs([])
                setOtherPlannedOrders([])
                setOtherMovedRegistrations([])
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
          <div className="text-sm text-gray-500">Przypisz WA do nóg</div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {legs.map((leg, index) => {
            const legTotal = getLegTotalOV(leg)
            // Dla rang wymagających sub-rang (np. Gold → Premier) sprawdzamy czy plan jest zapisany
            // Dla rang z legOV sprawdzamy OV
            // Dla innych sprawdzamy czy WA jest przypisany
            const requiresSubRank = RANK_REQUIREMENTS.find(r => r.name === selectedRank.legRank)
            const isLegMet = requiresSubRank
              ? leg.subPlanSaved === true
              : selectedRank.legOV
                ? leg.memberId !== null && legTotal >= selectedRank.legOV
                : leg.memberId !== null

            return (
              <div
                key={index}
                className="p-4 rounded-lg bg-white transition-colors"
                style={{
                  border: isLegMet ? '2px solid #22c55e' : '2px solid #e5e7eb'
                }}
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
                  <div className="flex-1 relative">
                    <button
                      type="button"
                      onClick={() => setOpenLegDropdown(openLegDropdown === index ? null : index)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        leg.memberId
                          ? 'bg-green-100 hover:bg-green-200 text-green-800'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <span className="truncate">
                        {leg.memberName || 'Wybierz WA...'}
                      </span>
                      <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform ${openLegDropdown === index ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    {openLegDropdown === index && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenLegDropdown(null)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-20 py-2 max-h-48 overflow-y-auto">
                          {structureMembers.map(member => (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => {
                                handleLegAssignment(index, member.id)
                                setOpenLegDropdown(null)
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                            >
                              <div>
                                <div className="text-sm font-medium text-gray-800">{member.name}</div>
                                <div className="text-xs text-gray-500">{formatPV(member.totalPV)} OV</div>
                              </div>
                              {leg.memberId === member.id && (
                                <Check className="h-4 w-4 text-green-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-right min-w-[90px]">
                    <div className="text-sm text-gray-600">{formatPV(leg.memberOV)} OV</div>
                    <div className="text-xs text-gray-400">aktualny OV</div>
                  </div>
                </div>

                {/* Rejestracje do przeniesienia - ukryte gdy wymaga sub-rangi lub brak WA */}
                {leg.memberId && !RANK_REQUIREMENTS.find(r => r.name === selectedRank.legRank) && (
                <div className={`space-y-2 mt-3 rounded-lg p-3 ${isLegMet ? 'bg-white' : 'bg-white/60'}`}>
                  <span className="text-xs text-gray-500 block mb-1 px-5">Osoby do przeniesienia:</span>

                  {/* Dropdown do wyboru rejestracji */}
                  {getAvailableRegistrations().length > 0 && (
                    <div className="px-5">
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            addMovedRegistration(index, e.target.value)
                            e.target.value = ''
                          }
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Wybierz osobę do przeniesienia...</option>
                        {getAvailableRegistrations().map(reg => (
                          <option key={reg.id} value={reg.id}>
                            {reg.name} ({formatPV(reg.pv)} PV)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Lista przeniesionych rejestracji */}
                  {leg.movedRegistrations.map((reg) => (
                    <div key={reg.id} className="group relative px-5">
                      <div className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-xs">
                        <span className="font-medium text-gray-700">{reg.name}</span>
                        <span className="text-gray-500">{formatPV(reg.pv)} PV</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMovedRegistration(index, reg.id)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-300 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {leg.movedRegistrations.length > 0 && (
                    <div className="px-5">
                      <div className="flex justify-between text-xs text-blue-600 px-2 py-1 pt-1 mt-1 border-t border-gray-100">
                        <span>Suma:</span>
                        <span>{formatPV(getMovedOVTotal(leg))} PV</span>
                      </div>
                    </div>
                  )}
                </div>
                )}

                {/* Planowane zamówienia - ukryte gdy wymaga sub-rangi lub brak WA */}
                {leg.memberId && !RANK_REQUIREMENTS.find(r => r.name === selectedRank.legRank) && (
                <div className={`space-y-2 mt-3 rounded-lg p-3 ${isLegMet ? 'bg-white' : 'bg-white/60'}`}>
                  <span className="text-xs text-gray-500 block mb-1 px-5">Planowane zamówienia:</span>
                  <div className="px-5">
                    <button
                      type="button"
                      onClick={() => addPlannedOrder(index)}
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-500 text-left hover:border-blue-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Dodaj zamówienie...
                    </button>
                  </div>
                  {leg.plannedOrders.map((order, orderIndex) => (
                    <div key={order.id} className="group relative px-5">
                      <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded">
                        <input
                          ref={orderIndex === leg.plannedOrders.length - 1 ? newOrderInputRef : null}
                          type="text"
                          placeholder="Opis"
                          value={order.description}
                          onChange={(e) => updatePlannedOrder(index, order.id, 'description', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addPlannedOrder(index)
                            }
                          }}
                          className="flex-1 bg-transparent text-xs text-gray-700 font-medium focus:outline-none"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0"
                            value={order.value}
                            onChange={(e) => {
                              const val = e.target.value
                              if (val === '' || /^[\d,]*$/.test(val)) {
                                updatePlannedOrder(index, order.id, 'value', val)
                              }
                            }}
                            onBlur={() => {
                              const num = parseFloat(order.value.replace(',', '.'))
                              if (!isNaN(num) && num > 0) {
                                updatePlannedOrder(index, order.id, 'value', num.toFixed(1).replace('.', ','))
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                const num = parseFloat(order.value.replace(',', '.'))
                                if (!isNaN(num) && num > 0) {
                                  updatePlannedOrder(index, order.id, 'value', num.toFixed(1).replace('.', ','))
                                }
                                addPlannedOrder(index)
                              }
                            }}
                            className="w-16 bg-transparent text-xs text-gray-500 text-right focus:outline-none"
                          />
                          <span className="text-xs text-gray-500">PV</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePlannedOrder(index, order.id)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-300 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {leg.plannedOrders.length > 0 && (
                    <div className="px-5">
                      <div className="flex justify-between text-xs text-blue-600 px-2 py-1 pt-1 mt-1 border-t border-gray-100">
                        <span>Suma:</span>
                        <span>{formatPV(getPlannedOVTotal(leg))} PV</span>
                      </div>
                    </div>
                  )}
                </div>
                )}

                {/* Suma OV - ukryte gdy wymaga sub-rangi */}
                {!RANK_REQUIREMENTS.find(r => r.name === selectedRank.legRank) && (leg.memberId || leg.plannedOrders.length > 0) && (
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

                {/* Przycisk do zagnieżdżonego planowania - tylko gdy legRank jest rangą do zaplanowania */}
                {selectedRank.legRank && leg.memberId && RANK_REQUIREMENTS.find(r => r.name === selectedRank.legRank) && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        const targetRank = RANK_REQUIREMENTS.find(r => r.name === selectedRank.legRank)
                        if (targetRank) {
                          setSubPlannerModal({
                            legIndex: index,
                            memberId: leg.memberId!,
                            memberName: leg.memberName,
                            memberOV: leg.memberOV,
                            targetRank: selectedRank.legRank,
                            targetRankId: targetRank.id,
                            existingData: leg.subPlanData // przekaż istniejące dane jeśli są
                          })
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        leg.subPlanData?.isComplete
                          ? 'bg-green-100 hover:bg-green-200 text-green-700'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                      }`}
                    >
                      {leg.subPlanData?.isComplete ? (
                        <>
                          <Check className="h-4 w-4" />
                          Plan {selectedRank.legRank} spełniony
                        </>
                      ) : leg.subPlanSaved ? (
                        <>Plan {selectedRank.legRank} →</>
                      ) : (
                        <>Zaplanuj {selectedRank.legRank} →</>
                      )}
                    </button>
                    {/* Szczegóły planu jeśli zapisany */}
                    {leg.subPlanSaved && leg.subPlanData && (
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Nogi:</span>
                          <span className={leg.subPlanData.legsMet === leg.subPlanData.totalLegs ? 'text-green-600' : 'text-gray-600'}>
                            {leg.subPlanData.legsMet} / {leg.subPlanData.totalLegs}
                          </span>
                        </div>
                        {leg.subPlanData.targetOV && (
                          <div className="flex justify-between">
                            <span>Planowane OV:</span>
                            <span className={leg.subPlanData.totalPlannedOV >= leg.subPlanData.targetOV ? 'text-green-600' : 'text-gray-600'}>
                              {formatPV(leg.subPlanData.totalPlannedOV)} / {formatPV(leg.subPlanData.targetOV)}
                              {leg.subPlanData.totalPlannedOV < leg.subPlanData.targetOV && (
                                <span className="text-gray-400 ml-1">
                                  (brakuje {formatPV(leg.subPlanData.targetOV - leg.subPlanData.totalPlannedOV)})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Sekcja "Inne w strukturze" - tylko dla rang z totalOV (Premier) */}
          {selectedRank.totalOV && (
            <div
              className="p-4 rounded-lg bg-blue-50/30 border-2 border-blue-200"
              style={{ gridColumn: `span ${Math.min(selectedRank.legs, 3)}` }}
            >
              <div className="text-sm font-medium text-blue-700 mb-3">Inne w strukturze</div>

              {/* Osoby do przeniesienia - ukryte gdy brak dostępnych i brak wybranych */}
              {(() => {
                const allAssignedIds = [
                  ...legs.flatMap(leg => leg.movedRegistrations.map(r => r.id)),
                  ...otherMovedRegistrations.map(r => r.id)
                ]
                const available = AVAILABLE_REGISTRATIONS.filter(r => !allAssignedIds.includes(r.id))
                const hasAvailable = available.length > 0
                const hasSelected = otherMovedRegistrations.length > 0

                // Pokaż sekcję tylko gdy są dostępne osoby LUB już wybrane
                if (!hasAvailable && !hasSelected) return null

                return (
                  <div className="space-y-2 mb-4">
                    <span className="text-xs text-gray-500 block">Osoby do przeniesienia:</span>
                    {hasAvailable && (
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            addOtherMovedRegistration(e.target.value)
                          }
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Wybierz osobę do przeniesienia...</option>
                        {available.map(reg => (
                          <option key={reg.id} value={reg.id}>
                            {reg.name} ({formatPV(reg.pv)} PV)
                          </option>
                        ))}
                      </select>
                    )}
                    {otherMovedRegistrations.map((reg) => (
                      <div key={reg.id} className="group relative">
                        <div className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-xs">
                          <span className="font-medium text-gray-700">{reg.name}</span>
                          <span className="text-gray-500">{formatPV(reg.pv)} PV</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeOtherMovedRegistration(reg.id)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-300 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {hasSelected && (
                      <div className="flex justify-between text-xs text-blue-600 px-2 py-1 border-t border-gray-100">
                        <span>Suma:</span>
                        <span>{formatPV(getOtherMovedOVTotal())} PV</span>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Planowane zamówienia */}
              <div className="space-y-2">
                <span className="text-xs text-gray-500 block">Planowane zamówienia:</span>
                <button
                  type="button"
                  onClick={addOtherPlannedOrder}
                  className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-500 text-left hover:border-blue-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Dodaj zamówienie...
                </button>
                {otherPlannedOrders.map((order) => (
                  <div key={order.id} className="group relative">
                    <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded">
                      <input
                        type="text"
                        placeholder="Opis"
                        value={order.description}
                        onChange={(e) => updateOtherPlannedOrder(order.id, 'description', e.target.value)}
                        className="flex-1 bg-transparent text-xs text-gray-700 font-medium focus:outline-none"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0"
                          value={order.value}
                          onChange={(e) => {
                            const val = e.target.value
                            if (val === '' || /^[\d,]*$/.test(val)) {
                              updateOtherPlannedOrder(order.id, 'value', val)
                            }
                          }}
                          className="w-16 bg-transparent text-xs text-gray-500 text-right focus:outline-none"
                        />
                        <span className="text-xs text-gray-500">PV</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOtherPlannedOrder(order.id)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-300 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {otherPlannedOrders.length > 0 && (
                  <div className="flex justify-between text-xs text-blue-600 px-2 py-1 border-t border-gray-100">
                    <span>Suma:</span>
                    <span>{formatPV(getOtherPlannedOVTotal())} PV</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Podsumowanie */}
          <div
            className={`p-4 rounded-lg border-2 ${isOVMet ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}
            style={{ gridColumn: `span ${Math.min(selectedRank.legs, 3)}` }}
          >
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
                      {legs.filter(isLegRequirementMet).length} / {selectedRank.legs}
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
                      : `${Math.min((legs.filter(isLegRequirementMet).length / selectedRank.legs) * 100, 100)}%`
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
        </div>
      )}

      {/* Modal do zagnieżdżonego planowania */}
      {subPlannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSubPlannerModal(null)}
          />

          {/* Modal content */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Planowanie {subPlannerModal.targetRank}: {subPlannerModal.memberName}
                </h2>
                <div className="text-sm text-gray-500">
                  Aktualny OV: <span className="font-medium text-gray-700">{subPlannerModal.memberOV.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSubPlannerModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Body - zagnieżdżony planner */}
            <div className="flex-1 overflow-y-auto p-6">
              <SubRankPlanner
                targetRankId={subPlannerModal.targetRankId}
                structureMembers={structureMembers}
                memberOV={subPlannerModal.memberOV}
                initialData={subPlannerModal.existingData}
                onSavePlan={(data) => {
                  // Zapisz dane planu i oznacz nogę jako zaplanowaną
                  setLegs(prev => prev.map((leg, i) =>
                    i === subPlannerModal.legIndex
                      ? { ...leg, subPlanSaved: true, subPlanData: data }
                      : leg
                  ))
                  setSubPlannerModal(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Komponent zagnieżdżonego planowania (dla modala)
interface SubRankPlannerProps {
  targetRankId: string
  structureMembers: StructureMember[]
  memberOV: number // OV osoby dla której planujemy rangę
  onSavePlan: (data: SubPlanData) => void // callback do zapisania planu z danymi
  initialData?: SubPlanData // początkowe dane do edycji
}

function SubRankPlanner({ targetRankId, structureMembers, memberOV, onSavePlan, initialData }: SubRankPlannerProps) {
  const selectedRank = RANK_REQUIREMENTS.find(r => r.id === targetRankId)

  // Inicjalizuj nogi - użyj initialData jeśli istnieje, w przeciwnym razie puste nogi
  const [legs, setLegs] = useState<LegAssignment[]>(() => {
    if (initialData?.legs) {
      return initialData.legs
    }
    if (selectedRank) {
      return Array.from({ length: selectedRank.legs }, (_, i) => ({
        index: i,
        memberId: null,
        memberName: '',
        memberOV: 0,
        plannedOrders: [],
        movedRegistrations: [],
      }))
    }
    return []
  })
  const [openLegDropdown, setOpenLegDropdown] = useState<number | null>(null)
  const newOrderInputRef = useRef<HTMLInputElement>(null)
  const [nestedPlannerModal, setNestedPlannerModal] = useState<SubPlannerModal | null>(null)

  // State dla zamówień/przeniesień poza nogami (tylko dla rang z totalOV jak Premier)
  const [otherPlannedOrders, setOtherPlannedOrders] = useState<PlannedOrder[]>(
    () => initialData?.otherPlannedOrders || []
  )
  const [otherMovedRegistrations, setOtherMovedRegistrations] = useState<MovedRegistration[]>(
    () => initialData?.otherMovedRegistrations || []
  )

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
            { id: crypto.randomUUID(), description: '', value: '' }
          ]
        }
      }
      return l
    }))
    setTimeout(() => newOrderInputRef.current?.focus(), 0)
  }

  const updatePlannedOrder = (legIndex: number, orderId: string, field: 'description' | 'value', value: string) => {
    setLegs(prev => prev.map((leg, i) => {
      if (i === legIndex) {
        return {
          ...leg,
          plannedOrders: leg.plannedOrders.map(order =>
            order.id === orderId
              ? { ...order, [field]: value }
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

  // Funkcje dla przeniesionych rejestracji
  const getAllAssignedRegistrationIds = () => {
    return legs.flatMap(leg => leg.movedRegistrations.map(r => r.id))
  }

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

  // Funkcje dla "Inne w strukturze" (poza nogami)
  const addOtherPlannedOrder = () => {
    setOtherPlannedOrders(prev => [
      ...prev,
      { id: crypto.randomUUID(), description: '', value: '' }
    ])
  }

  const updateOtherPlannedOrder = (orderId: string, field: 'description' | 'value', value: string) => {
    setOtherPlannedOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, [field]: value } : order
    ))
  }

  const removeOtherPlannedOrder = (orderId: string) => {
    setOtherPlannedOrders(prev => prev.filter(order => order.id !== orderId))
  }

  const addOtherMovedRegistration = (registrationId: string) => {
    const registration = AVAILABLE_REGISTRATIONS.find(r => r.id === registrationId)
    if (!registration) return
    setOtherMovedRegistrations(prev => [
      ...prev,
      { id: registration.id, name: registration.name, pv: registration.pv }
    ])
  }

  const removeOtherMovedRegistration = (registrationId: string) => {
    setOtherMovedRegistrations(prev => prev.filter(r => r.id !== registrationId))
  }

  const getOtherPlannedOVTotal = () => otherPlannedOrders.reduce((sum, o) => sum + (parseFloat(o.value.replace(',', '.')) || 0), 0)
  const getOtherMovedOVTotal = () => otherMovedRegistrations.reduce((sum, r) => sum + r.pv, 0)

  const getPlannedOVTotal = (leg: LegAssignment) => leg.plannedOrders.reduce((sum, o) => sum + (parseFloat(o.value.replace(',', '.')) || 0), 0)
  const getMovedOVTotal = (leg: LegAssignment) => leg.movedRegistrations.reduce((sum, r) => sum + r.pv, 0)
  const getLegTotalOV = (leg: LegAssignment) => leg.memberOV + getPlannedOVTotal(leg) + getMovedOVTotal(leg)

  const formatPV = (value: number) =>
    value.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

  if (!selectedRank) return null

  // Sprawdź czy nogi wymagają sub-rangi (np. Gold wymaga Premier)
  const requiresSubRank = RANK_REQUIREMENTS.find(r => r.name === selectedRank.legRank)

  // requiresOV = true tylko gdy legOV jest ustawiony I noga NIE wymaga sub-rangi
  // Dla Gold (wymaga Premier) → requiresOV = false (dodawanie zamówień tylko w Premierze)
  // Dla Premier (wymaga Executive, które nie jest w RANK_REQUIREMENTS) → requiresOV = true
  const requiresOV = selectedRank.legOV !== null && !requiresSubRank

  return (
    <div className="space-y-4">
      {/* Nagłówek z informacją o randze - identyczny format jak w głównym planerze */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: selectedRank.color }}
          />
          <span className="font-medium">{selectedRank.name}</span>
          <span className="text-sm text-gray-500">
            ({selectedRank.totalOV ? `${formatPV(selectedRank.totalOV)} OV, ` : ''}{selectedRank.legs} nogi × {selectedRank.legOV ? `${formatPV(selectedRank.legOV)} OV (${selectedRank.legRank})` : selectedRank.legRank}{selectedRank.personallyEnrolled ? '*' : ''})
          </span>
        </div>
      </div>

      {/* Karty nóg */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {legs.map((leg, index) => {
          const legTotal = getLegTotalOV(leg)
          // Noga jest spełniona:
          // - Dla rang wymagających sub-rangi (Gold → Premier): gdy subPlanData.isComplete = true
          // - Dla rang z OV (Premier): gdy memberId + OV >= legOV
          // - Dla innych: gdy memberId jest przypisany
          const isLegMet = requiresSubRank
            ? leg.subPlanData?.isComplete === true
            : requiresOV
              ? leg.memberId !== null && legTotal >= (selectedRank.legOV || 0)
              : leg.memberId !== null

          return (
            <div
              key={index}
              className="p-4 rounded-lg bg-white transition-colors"
              style={{
                border: isLegMet ? '2px solid #22c55e' : '2px solid #e5e7eb'
              }}
            >
              {/* Nagłówek nogi */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">Noga {index + 1}</span>
                <span className="text-xs text-gray-400">
                  (cel: {selectedRank.legOV ? `${formatPV(selectedRank.legOV)} OV` : selectedRank.legRank})
                </span>
              </div>

              {/* Wybór WA */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 relative">
                  <button
                    type="button"
                    onClick={() => setOpenLegDropdown(openLegDropdown === index ? null : index)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      leg.memberId
                        ? 'bg-green-100 hover:bg-green-200 text-green-800'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <span className="truncate">
                      {leg.memberName || 'Wybierz WA...'}
                    </span>
                    <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform ${openLegDropdown === index ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {openLegDropdown === index && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenLegDropdown(null)}
                      />
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-20 py-2 max-h-48 overflow-y-auto">
                        {structureMembers.length > 0 ? (
                          structureMembers.map(member => (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => {
                                handleLegAssignment(index, member.id)
                                setOpenLegDropdown(null)
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                            >
                              <div>
                                <div className="text-sm font-medium text-gray-800">{member.name}</div>
                                <div className="text-xs text-gray-500">{formatPV(member.totalPV)} OV</div>
                              </div>
                              {leg.memberId === member.id && (
                                <Check className="h-4 w-4 text-green-600" />
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            Brak dostępnych osób w strukturze
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {leg.memberId && (
                  <div className="text-right min-w-[90px]">
                    <div className="text-sm text-gray-600">{formatPV(leg.memberOV)} OV</div>
                    <div className="text-xs text-gray-400">aktualny OV</div>
                  </div>
                )}
              </div>

              {/* Rejestracje do przeniesienia - tylko gdy wymagane jest OV i przypisany WA */}
              {leg.memberId && requiresOV && (
                <div className={`space-y-2 mt-3 rounded-lg p-3 ${isLegMet ? 'bg-white' : 'bg-white/60'}`}>
                  <span className="text-xs text-gray-500 block mb-1 px-5">Osoby do przeniesienia:</span>

                  {/* Dropdown do wyboru rejestracji */}
                  {getAvailableRegistrations().length > 0 && (
                    <div className="px-5">
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            addMovedRegistration(index, e.target.value)
                            e.target.value = ''
                          }
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Wybierz osobę do przeniesienia...</option>
                        {getAvailableRegistrations().map(reg => (
                          <option key={reg.id} value={reg.id}>
                            {reg.name} ({formatPV(reg.pv)} PV)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Lista przeniesionych rejestracji */}
                  {leg.movedRegistrations.map((reg) => (
                    <div key={reg.id} className="group relative px-5">
                      <div className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-xs">
                        <span className="font-medium text-gray-700">{reg.name}</span>
                        <span className="text-gray-500">{formatPV(reg.pv)} PV</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMovedRegistration(index, reg.id)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-300 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {leg.movedRegistrations.length > 0 && (
                    <div className="px-5">
                      <div className="flex justify-between text-xs text-blue-600 px-2 py-1 pt-1 mt-1 border-t border-gray-100">
                        <span>Suma:</span>
                        <span>{formatPV(getMovedOVTotal(leg))} PV</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Planowane zamówienia - tylko gdy wymagane jest OV i przypisany WA */}
              {leg.memberId && requiresOV && (
                <div className={`space-y-2 mt-3 rounded-lg p-3 ${isLegMet ? 'bg-white' : 'bg-white/60'}`}>
                  <span className="text-xs text-gray-500 block mb-1 px-5">Planowane zamówienia:</span>
                  <div className="px-5">
                    <button
                      type="button"
                      onClick={() => addPlannedOrder(index)}
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-500 text-left hover:border-blue-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Dodaj zamówienie...
                    </button>
                  </div>
                  {leg.plannedOrders.map((order, orderIndex) => (
                    <div key={order.id} className="group relative px-5">
                      <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded">
                        <input
                          ref={orderIndex === leg.plannedOrders.length - 1 ? newOrderInputRef : null}
                          type="text"
                          placeholder="Opis"
                          value={order.description}
                          onChange={(e) => updatePlannedOrder(index, order.id, 'description', e.target.value)}
                          className="flex-1 bg-transparent text-xs text-gray-700 font-medium focus:outline-none"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0"
                            value={order.value}
                            onChange={(e) => {
                              const val = e.target.value
                              if (val === '' || /^[\d,]*$/.test(val)) {
                                updatePlannedOrder(index, order.id, 'value', val)
                              }
                            }}
                            className="w-16 bg-transparent text-xs text-gray-500 text-right focus:outline-none"
                          />
                          <span className="text-xs text-gray-500">PV</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePlannedOrder(index, order.id)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-300 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {leg.plannedOrders.length > 0 && (
                    <div className="px-5">
                      <div className="flex justify-between text-xs text-blue-600 px-2 py-1 pt-1 mt-1 border-t border-gray-100">
                        <span>Suma:</span>
                        <span>{formatPV(getPlannedOVTotal(leg))} PV</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Suma OV - tylko gdy wymagane jest OV i przypisany WA */}
              {leg.memberId && requiresOV && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Suma OV:</span>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">
                      {formatPV(legTotal)} OV
                    </div>
                    <div className="text-xs">
                      {isLegMet ? (
                        <span className="text-gray-500">cel osiągnięty</span>
                      ) : (
                        <span className="text-gray-500">brakuje {formatPV((selectedRank.legOV || 0) - legTotal)}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Przycisk do zagnieżdżonego planowania - tylko gdy legRank jest rangą do zaplanowania */}
              {selectedRank.legRank && leg.memberId && RANK_REQUIREMENTS.find(r => r.name === selectedRank.legRank) && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      const targetRank = RANK_REQUIREMENTS.find(r => r.name === selectedRank.legRank)
                      if (targetRank) {
                        setNestedPlannerModal({
                          legIndex: index,
                          memberId: leg.memberId!,
                          memberName: leg.memberName,
                          memberOV: leg.memberOV,
                          targetRank: selectedRank.legRank,
                          targetRankId: targetRank.id,
                          existingData: leg.subPlanData
                        })
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      leg.subPlanData?.isComplete
                        ? 'bg-green-100 hover:bg-green-200 text-green-700'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                    }`}
                  >
                    {leg.subPlanData?.isComplete ? (
                      <>
                        <Check className="h-4 w-4" />
                        Plan {selectedRank.legRank} spełniony
                      </>
                    ) : leg.subPlanSaved ? (
                      <>Plan {selectedRank.legRank} →</>
                    ) : (
                      <>Zaplanuj {selectedRank.legRank} →</>
                    )}
                  </button>
                  {/* Szczegóły planu jeśli zapisany */}
                  {leg.subPlanSaved && leg.subPlanData && (
                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Nogi:</span>
                        <span className={leg.subPlanData.legsMet === leg.subPlanData.totalLegs ? 'text-green-600' : 'text-gray-600'}>
                          {leg.subPlanData.legsMet} / {leg.subPlanData.totalLegs}
                        </span>
                      </div>
                      {leg.subPlanData.targetOV && (
                        <div className="flex justify-between">
                          <span>Planowane OV:</span>
                          <span className={leg.subPlanData.totalPlannedOV >= leg.subPlanData.targetOV ? 'text-green-600' : 'text-gray-600'}>
                            {formatPV(leg.subPlanData.totalPlannedOV)} / {formatPV(leg.subPlanData.targetOV)}
                            {leg.subPlanData.totalPlannedOV < leg.subPlanData.targetOV && (
                              <span className="text-gray-400 ml-1">
                                (brakuje {formatPV(leg.subPlanData.targetOV - leg.subPlanData.totalPlannedOV)})
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sekcja "Inne w strukturze" - tylko dla rang z totalOV (Premier) */}
      {selectedRank.totalOV && (
        <div className="p-4 rounded-lg bg-blue-50/30 border-2 border-blue-200">
          <div className="text-sm font-medium text-blue-700 mb-3">Inne w strukturze</div>

          {/* Osoby do przeniesienia - ukryte gdy brak dostępnych i brak wybranych */}
          {(() => {
            const allAssignedIds = [
              ...legs.flatMap(leg => leg.movedRegistrations.map(r => r.id)),
              ...otherMovedRegistrations.map(r => r.id)
            ]
            const available = AVAILABLE_REGISTRATIONS.filter(r => !allAssignedIds.includes(r.id))
            const hasAvailable = available.length > 0
            const hasSelected = otherMovedRegistrations.length > 0

            // Pokaż sekcję tylko gdy są dostępne osoby LUB już wybrane
            if (!hasAvailable && !hasSelected) return null

            return (
              <div className="space-y-2 mb-4">
                <span className="text-xs text-gray-500 block">Osoby do przeniesienia:</span>
                {hasAvailable && (
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        addOtherMovedRegistration(e.target.value)
                      }
                    }}
                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Wybierz osobę do przeniesienia...</option>
                    {available.map(reg => (
                      <option key={reg.id} value={reg.id}>
                        {reg.name} ({formatPV(reg.pv)} PV)
                      </option>
                    ))}
                  </select>
                )}
                {otherMovedRegistrations.map((reg) => (
                  <div key={reg.id} className="group relative">
                    <div className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-xs">
                      <span className="font-medium text-gray-700">{reg.name}</span>
                      <span className="text-gray-500">{formatPV(reg.pv)} PV</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOtherMovedRegistration(reg.id)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-300 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {hasSelected && (
                  <div className="flex justify-between text-xs text-blue-600 px-2 py-1 border-t border-gray-100">
                    <span>Suma:</span>
                    <span>{formatPV(getOtherMovedOVTotal())} PV</span>
                  </div>
                )}
              </div>
            )
          })()}

          {/* Planowane zamówienia */}
          <div className="space-y-2">
            <span className="text-xs text-gray-500 block">Planowane zamówienia:</span>
            <button
              type="button"
              onClick={addOtherPlannedOrder}
              className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-500 text-left hover:border-blue-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Dodaj zamówienie...
            </button>
            {otherPlannedOrders.map((order) => (
              <div key={order.id} className="group relative">
                <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded">
                  <input
                    type="text"
                    placeholder="Opis"
                    value={order.description}
                    onChange={(e) => updateOtherPlannedOrder(order.id, 'description', e.target.value)}
                    className="flex-1 bg-transparent text-xs text-gray-700 font-medium focus:outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      value={order.value}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === '' || /^[\d,]*$/.test(val)) {
                          updateOtherPlannedOrder(order.id, 'value', val)
                        }
                      }}
                      className="w-16 bg-transparent text-xs text-gray-500 text-right focus:outline-none"
                    />
                    <span className="text-xs text-gray-500">PV</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeOtherPlannedOrder(order.id)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-300 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {otherPlannedOrders.length > 0 && (
              <div className="flex justify-between text-xs text-blue-600 px-2 py-1 border-t border-gray-100">
                <span>Suma:</span>
                <span>{formatPV(getOtherPlannedOVTotal())} PV</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Podsumowanie - identyczne jak w głównym RankPlanner */}
      {legs.length > 0 && (() => {
        const totalPlannedOV = legs.reduce((sum, leg) => sum + getPlannedOVTotal(leg), 0)
        // memberOV = OV osoby dla której planujemy (już zawiera OV osób ze struktury)
        // Dodajemy tylko planowane zamówienia (nogi + inne) - przeniesienia NIE zwiększają total OV
        const grandTotalOV = memberOV + totalPlannedOV + getOtherPlannedOVTotal()
        // Noga jest spełniona:
        // - Dla rang wymagających sub-rangi: subPlanData.isComplete = true
        // - Dla rang z OV: memberId + OV >= legOV
        // - Dla innych: memberId przypisany
        const legsMet = legs.filter(leg => requiresSubRank
          ? leg.subPlanData?.isComplete === true
          : requiresOV
            ? leg.memberId !== null && getLegTotalOV(leg) >= (selectedRank.legOV || 0)
            : leg.memberId !== null
        ).length
        const allLegsMet = legsMet === selectedRank.legs
        const totalOVMet = selectedRank.totalOV
          ? grandTotalOV >= selectedRank.totalOV && allLegsMet
          : allLegsMet
        const isOVMet = totalOVMet

        return (
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
                      {formatPV(grandTotalOV)} OV
                    </div>
                    <div className="text-xs text-gray-500">
                      cel: {formatPV(selectedRank.totalOV)} OV
                      {!isOVMet && grandTotalOV > 0 && (
                        <span className="text-gray-500 ml-1">
                          (brakuje {formatPV(selectedRank.totalOV - grandTotalOV)})
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`text-xl font-bold ${isOVMet ? 'text-green-600' : 'text-gray-800'}`}>
                      {legsMet} / {selectedRank.legs}
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
                      ? `${Math.min((grandTotalOV / selectedRank.totalOV) * 100, 100)}%`
                      : `${Math.min((legsMet / selectedRank.legs) * 100, 100)}%`
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
        )
      })()}

      {/* Przycisk zapisania planu */}
      <button
        type="button"
        onClick={() => {
          // Oblicz podsumowanie planu
          const totalPlannedOV = legs.reduce((sum, leg) => sum + getPlannedOVTotal(leg), 0)
          const grandTotalOV = memberOV + totalPlannedOV + getOtherPlannedOVTotal()
          const legsMet = legs.filter(leg => requiresSubRank
            ? leg.subPlanData?.isComplete === true
            : requiresOV
              ? leg.memberId !== null && getLegTotalOV(leg) >= (selectedRank.legOV || 0)
              : leg.memberId !== null
          ).length
          const allLegsMet = legsMet === selectedRank.legs
          const isComplete = selectedRank.totalOV
            ? grandTotalOV >= selectedRank.totalOV && allLegsMet
            : allLegsMet

          onSavePlan({
            legs,
            otherPlannedOrders,
            otherMovedRegistrations,
            isComplete,
            totalPlannedOV: grandTotalOV,
            legsMet,
            totalLegs: selectedRank.legs,
            targetOV: selectedRank.totalOV || undefined,
            targetLegOV: selectedRank.legOV || undefined,
          })
        }}
        className="w-full mt-4 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Check className="h-5 w-5" />
        Zapisz plan
      </button>

      {/* Modal do zagnieżdżonego planowania (np. Gold → Premier) */}
      {nestedPlannerModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setNestedPlannerModal(null)}
          />

          {/* Modal content */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Planowanie {nestedPlannerModal.targetRank}: {nestedPlannerModal.memberName}
                </h2>
                <div className="text-sm text-gray-500">
                  Aktualny OV: <span className="font-medium text-gray-700">{nestedPlannerModal.memberOV.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNestedPlannerModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Body - zagnieżdżony planner */}
            <div className="flex-1 overflow-y-auto p-6">
              <SubRankPlanner
                targetRankId={nestedPlannerModal.targetRankId}
                structureMembers={structureMembers}
                memberOV={nestedPlannerModal.memberOV}
                initialData={nestedPlannerModal.existingData}
                onSavePlan={(data) => {
                  // Zapisz dane planu i oznacz nogę jako zaplanowaną
                  setLegs(prev => prev.map((leg, i) =>
                    i === nestedPlannerModal.legIndex
                      ? { ...leg, subPlanSaved: true, subPlanData: data }
                      : leg
                  ))
                  setNestedPlannerModal(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
