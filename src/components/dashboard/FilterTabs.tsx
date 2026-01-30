import { cn } from '@/lib/utils'
import type { FilterTab, FilterTabKey } from '@/types'

interface FilterTabsProps {
  tabs: FilterTab[]
  activeTab: FilterTabKey
  onTabChange: (tab: FilterTabKey) => void
}

export function FilterTabs({ tabs, activeTab, onTabChange }: FilterTabsProps) {
  return (
    <div className="flex gap-1 border-b">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors relative',
            activeTab === tab.key
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
          {activeTab === tab.key && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      ))}
    </div>
  )
}
