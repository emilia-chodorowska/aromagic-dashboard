import { Zap } from 'lucide-react'
import type { OVMetric } from '@/types'

interface OVMetricCardProps {
  metric: OVMetric
}

export function OVMetricCard({ metric }: OVMetricCardProps) {
  const formatPV = (value: number) =>
    value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-2xl text-gray-800">{formatPV(metric.totalPV)} PV</h3>
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
            {formatPV(metric.lrpVolume)} PV ({metric.lrpPercentage}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-orange-400 h-1.5 rounded-full transition-all"
            style={{ width: `${metric.lrpPercentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
