import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { FilterTabs } from './FilterTabs'
import { Plus, Search } from 'lucide-react'
import type { FilterTab, FilterTabKey } from '@/types'

interface FilterSectionProps {
  tabs: FilterTab[]
}

export function FilterSection({ tabs }: FilterSectionProps) {
  const [activeTab, setActiveTab] = useState<FilterTabKey>('paid')
  const [searchValue, setSearchValue] = useState('')

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-white">
        <button className="p-1 hover:bg-gray-100 rounded">
          <Plus className="h-4 w-4 text-gray-400" />
        </button>
        <Input
          type="text"
          placeholder="Szukaj lub dodaj filtr"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="border-0 shadow-none focus-visible:ring-0 flex-1 bg-transparent"
        />
        <button className="p-1 hover:bg-gray-100 rounded">
          <Search className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Tabs */}
      <FilterTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
