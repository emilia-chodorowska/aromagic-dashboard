import { TrendingUp, TrendingDown, Percent, Award } from 'lucide-react'
import type { PriceChange } from '@/types'

interface PriceStatsCardsProps {
  data: PriceChange[]
}

export function PriceStatsCards({ data }: PriceStatsCardsProps) {
  const priceIncreases = data.filter(item => item.changePercent > 0.5)
  const priceDecreases = data.filter(item => item.changePercent < -0.5)

  const avgChange = data.length > 0
    ? data.reduce((sum, item) => sum + item.changePercent, 0) / data.length
    : 0

  const maxChange = data.reduce((max, item) =>
    Math.abs(item.differencePln) > Math.abs(max.differencePln) ? item : max
  , data[0])

  const formatPln = (value: number) =>
    value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Wzrosty */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Podwyżki cen</p>
            <p className="text-3xl font-bold text-red-600">{priceIncreases.length}</p>
            <p className="text-xs text-gray-400 mt-1">produktów podrożało</p>
          </div>
          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Spadki */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Obniżki cen</p>
            <p className="text-3xl font-bold text-green-600">{priceDecreases.length}</p>
            <p className="text-xs text-gray-400 mt-1">produktów potaniało</p>
          </div>
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Średnia zmiana */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Średnia zmiana</p>
            <p className={`text-3xl font-bold ${avgChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">średnio na produkt</p>
          </div>
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Największa zmiana */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Największa zmiana</p>
            <p className={`text-2xl font-bold ${maxChange?.differencePln >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {maxChange?.differencePln >= 0 ? '+' : ''}{formatPln(maxChange?.differencePln || 0)} zł
            </p>
            <p className="text-xs text-gray-400 mt-1 truncate max-w-[180px]" title={maxChange?.productName}>
              {maxChange?.productName}
            </p>
          </div>
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  )
}
