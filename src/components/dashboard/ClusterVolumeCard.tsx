import { BarChart3, CheckCircle, MinusCircle } from 'lucide-react'
import type { ClusterVolumeMetric } from '@/types'

interface ClusterVolumeCardProps {
  metric: ClusterVolumeMetric
}

export function ClusterVolumeCard({ metric }: ClusterVolumeCardProps) {
  const formatPV = (value: number) =>
    value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-bold text-2xl text-gray-800">{formatPV(metric.volumePV)} PV</h3>
          <p className="text-xs font-medium text-gray-500">
            Wolumen Klastra {metric.clusterType}
          </p>
        </div>
        <div className="w-10 h-10 bg-gray-100 text-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <BarChart3 className="w-6 h-6" />
        </div>
      </div>
      <div className="space-y-2 text-xs mt-4">
        <div className="flex items-center text-gray-600">
          {metric.lrpGoalAchieved ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500 mr-1.5 flex-shrink-0" />
              <span>{metric.lrpGoalLabel}</span>
            </>
          ) : (
            <>
              <MinusCircle className="w-4 h-4 text-gray-400 mr-1.5 flex-shrink-0" />
              <span>{metric.lrpGoalLabel}</span>
            </>
          )}
        </div>

        {metric.nextGoal && (
          <div className="flex items-center text-gray-600">
            <MinusCircle className="w-4 h-4 text-gray-400 mr-1.5 flex-shrink-0" />
            <span>
              Cel {metric.nextGoal.target}, brakuje: {formatPV(metric.nextGoal.remaining)} PV
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
