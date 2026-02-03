import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import type { PriceChange } from '@/types'

interface TopChangesChartProps {
  data: PriceChange[]
}

export function TopChangesChart({ data }: TopChangesChartProps) {
  // Pobierz top 5 wzrostów i top 5 spadków (po % zmianie)
  const significantChanges = data.filter(item => Math.abs(item.changePercent) > 0.5)

  const topIncreases = [...significantChanges]
    .filter(item => item.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5)

  const topDecreases = [...significantChanges]
    .filter(item => item.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 5)

  const chartData = [...topDecreases, ...topIncreases].map(item => ({
    name: item.productName.length > 25
      ? item.productName.substring(0, 25) + '...'
      : item.productName,
    fullName: item.productName,
    change: item.changePercent,
    differencePln: item.differencePln,
  }))

  const formatPln = (value: number) =>
    value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Top 10 zmian cen</h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">Spadki</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600">Wzrosty</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={['dataMin - 2', 'dataMax + 2']}
              tickFormatter={(value) => `${value}%`}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#374151', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value, _name, props) => {
                const numValue = Number(value)
                const payload = props.payload as { fullName: string; differencePln: number }
                return [
                  <div key="tooltip" className="space-y-1">
                    <div className="font-medium">{payload.fullName}</div>
                    <div>Zmiana: <span className={numValue >= 0 ? 'text-red-600' : 'text-green-600'}>{numValue >= 0 ? '+' : ''}{numValue.toFixed(2)}%</span></div>
                    <div>Różnica: <span className={payload.differencePln >= 0 ? 'text-red-600' : 'text-green-600'}>{payload.differencePln >= 0 ? '+' : ''}{formatPln(payload.differencePln)} zł</span></div>
                  </div>,
                  ''
                ]
              }}
              labelStyle={{ display: 'none' }}
            />
            <ReferenceLine x={0} stroke="#d1d5db" />
            <Bar dataKey="change" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.change >= 0 ? '#ef4444' : '#22c55e'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
