import { PriceStatsCards } from './PriceStatsCards'
import { TopChangesChart } from './TopChangesChart'
import { PriceChangesTable } from './PriceChangesTable'
import { priceChangesData } from '@/data/priceChangesData'

export function PricingView() {
  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Zmiany cen produktów</h1>
        <p className="text-gray-500 text-sm mt-1">
          Ostatnia aktualizacja: {priceChangesData[0]?.changeDate || 'brak danych'}
        </p>
      </div>

      {/* Karty statystyk */}
      <PriceStatsCards data={priceChangesData} />

      {/* Wykres top 10 zmian */}
      <TopChangesChart data={priceChangesData} />

      {/* Tabela zmian */}
      <PriceChangesTable data={priceChangesData} />
    </div>
  )
}
