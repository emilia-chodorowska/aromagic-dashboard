import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react'

interface MonthSelectorProps {
  currentMonth: Date
  onPrevious: () => void
  onNext: () => void
}

export function MonthSelector({ currentMonth, onPrevious, onNext }: MonthSelectorProps) {
  const monthName = currentMonth.toLocaleDateString('pl-PL', {
    month: 'long',
    year: 'numeric',
  })

  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={onPrevious}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium min-w-[140px] text-center">
        {capitalizedMonth}
      </span>
      <Button variant="ghost" size="icon" onClick={onNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  )
}
