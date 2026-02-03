import { useState } from 'react'
import { Sidebar } from '@/components/layout'
import { MetricsRow, FilterSection, StructureTable, PersonDetailView } from '@/components/dashboard'
import { PricingView } from '@/components/pricing'
import { currentUser, dashboardMetrics, structureMembers, filterTabs } from '@/data/mockData'
import type { StructureMember } from '@/types'

interface WAMember {
  id: string
  name: string
}

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [selectedPerson, setSelectedPerson] = useState(currentUser.name)
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1))
  const [selectedMember, setSelectedMember] = useState<StructureMember | null>(null)

  const handleChangePerson = (person: WAMember) => {
    setSelectedPerson(person.name)
    console.log('Zmieniono osobę na:', person.name, 'ID:', person.id)
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleViewChange = (view: string) => {
    setActiveView(view)
    // Resetuj selectedMember przy zmianie widoku (w tym przy kliknięciu logo)
    if (view === 'dashboard') {
      setSelectedMember(null)
    }
  }

  // Znajdź osobę w strukturze po ID i otwórz jej widok szczegółowy
  const handlePersonLinkClick = (person: WAMember) => {
    // Szukaj w strukturze
    const member = structureMembers.find((m) => m.id === person.id)
    if (member) {
      setSelectedMember(member)
      return
    }

    // Jeśli to currentUser, stwórz obiekt z jego danych
    if (person.id === currentUser.id) {
      const userAsMember: StructureMember = {
        id: currentUser.id,
        name: currentUser.name,
        ordersCount: 1,
        totalPV: dashboardMetrics.ov.pv,
        pvStatus: 'normal',
        lastOrderDate: new Date(),
        sponsor: currentUser.sponsor || { id: '', name: '' },
        enroller: currentUser.enroller || { id: '', name: '' },
        membershipType: 'WA',
        fastStart: { daysRemaining: null, status: 'none' },
        remainingPGVMonths: null,
      }
      setSelectedMember(userAsMember)
      return
    }

    // Jeśli to sponsor/enroller currentUser, stwórz obiekt z ich danych
    if (currentUser.sponsor && person.id === currentUser.sponsor.id) {
      const sponsorAsMember: StructureMember = {
        id: currentUser.sponsor.id,
        name: currentUser.sponsor.name,
        ordersCount: 0,
        totalPV: 0,
        pvStatus: 'normal',
        lastOrderDate: null,
        sponsor: { id: '', name: '' },
        enroller: { id: '', name: '' },
        membershipType: 'WA',
        fastStart: { daysRemaining: null, status: 'none' },
        remainingPGVMonths: null,
      }
      setSelectedMember(sponsorAsMember)
      return
    }

    console.log('Osoba nie znaleziona w strukturze:', person.name, person.id)
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar activeView={activeView} onViewChange={handleViewChange} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {activeView === 'dashboard' && !selectedMember && (
              <div className="max-w-[1600px] mx-auto space-y-6">
                <MetricsRow
                  personName={selectedPerson}
                  metrics={dashboardMetrics}
                  userProfile={currentUser}
                  onChangePerson={handleChangePerson}
                  onPersonLinkClick={handlePersonLinkClick}
                  currentMonth={currentMonth}
                  onPreviousMonth={handlePreviousMonth}
                  onNextMonth={handleNextMonth}
                />

                <FilterSection
                  tabs={filterTabs}
                />

                <div className="bg-white rounded-lg border">
                  <StructureTable
                    members={structureMembers}
                    onMemberClick={(member) => setSelectedMember(member)}
                  />
                </div>
              </div>
            )}

            {activeView === 'dashboard' && selectedMember && (
              <div className="max-w-[1600px] mx-auto">
                <PersonDetailView
                  member={selectedMember}
                  currentMonth={currentMonth}
                  onPreviousMonth={handlePreviousMonth}
                  onNextMonth={handleNextMonth}
                  structureMembers={structureMembers}
                  onMemberClick={(m) => setSelectedMember(m)}
                />
              </div>
            )}

            {activeView === 'pricing' && (
              <div className="max-w-[1600px] mx-auto space-y-6">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Cennik produktów</h1>
                  <p className="text-gray-600">Przeglądaj naszą ofertę produktów aromaterapeutycznych</p>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center text-gray-500">
                  Sekcja Pricing - do zaimplementowania
                </div>
              </div>
            )}

            {activeView === 'price-changes' && (
              <div className="max-w-[1600px] mx-auto">
                <PricingView />
              </div>
            )}

            {activeView === 'calculator' && (
              <div className="max-w-[1600px] mx-auto space-y-6">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Kalkulator zamówienia</h1>
                  <p className="text-gray-600">Dodaj produkty i oblicz koszt zamówienia</p>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center text-gray-500">
                  Sekcja Kalkulator - do zaimplementowania
                </div>
              </div>
            )}

            {activeView === 'settings' && (
              <div className="max-w-[1600px] mx-auto space-y-6">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Ustawienia</h1>
                  <p className="text-gray-600">Zarządzaj ustawieniami aplikacji</p>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center text-gray-500">
                  Sekcja Ustawienia - do zaimplementowania
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
