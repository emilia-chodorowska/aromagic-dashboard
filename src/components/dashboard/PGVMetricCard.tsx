import { TrendingUp, CheckCircle, MinusCircle } from 'lucide-react'
import type { PGVMetric } from '@/types'

interface PGVMetricCardProps {
  metric: PGVMetric
}

export function PGVMetricCard({ metric }: PGVMetricCardProps) {
  const formatPV = (value: number) =>
    value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-bold text-2xl text-gray-800">{formatPV(metric.currentPV)} PV</h3>
          <p className="text-xs font-medium text-gray-500">PGV</p>
        </div>
        <div className="w-10 h-10 bg-gray-100 text-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-6 h-6" />
        </div>
      </div>
      <div className="space-y-2 text-xs mt-4">
        {metric.goals.map((goal, index) => (
          <div key={index} className="flex items-center text-gray-600">
            {goal.isAchieved ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500 mr-1.5 flex-shrink-0" />
                <span>{goal.label}</span>
              </>
            ) : (
              <>
                <MinusCircle className="w-4 h-4 text-gray-400 mr-1.5 flex-shrink-0" />
                <span>{goal.label}, brakuje: {formatPV(goal.remaining || 0)} PV</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
