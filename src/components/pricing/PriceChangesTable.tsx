import { useState, useMemo } from 'react'
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { PriceChange } from '@/types'

interface PriceChangesTableProps {
  data: PriceChange[]
}

type SortKey = 'productName' | 'oldPrice' | 'newPrice' | 'differencePln' | 'changePercent'
type SortDirection = 'asc' | 'desc'
type FilterType = 'all' | 'increases' | 'decreases'

export function PriceChangesTable({ data }: PriceChangesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortKey, setSortKey] = useState<SortKey>('changePercent')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(0)
  const pageSize = 50

  const formatPln = (value: number) =>
    value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const filteredAndSortedData = useMemo(() => {
    let result = [...data]

    // Filtrowanie po nazwie
    if (searchTerm) {
      result = result.filter(item =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrowanie po typie zmiany
    if (filter === 'increases') {
      result = result.filter(item => item.changePercent > 0.5)
    } else if (filter === 'decreases') {
      result = result.filter(item => item.changePercent < -0.5)
    }

    // Sortowanie
    result.sort((a, b) => {
      const aValue = a[sortKey]
      const bValue = b[sortKey]

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })

    return result
  }, [data, searchTerm, filter, sortKey, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize)
  const paginatedData = filteredAndSortedData.slice(page * pageSize, (page + 1) * pageSize)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="w-4 h-4 text-purple-600" />
      : <ArrowDown className="w-4 h-4 text-purple-600" />
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Header z wyszukiwarką i filtrami */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Lista zmian cen</h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Wyszukiwarka */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Szukaj produktu..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0) }}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filtry */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => { setFilter('all'); setPage(0) }}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === 'all'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Wszystkie
              </button>
              <button
                onClick={() => { setFilter('increases'); setPage(0) }}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === 'increases'
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Wzrosty
              </button>
              <button
                onClick={() => { setFilter('decreases'); setPage(0) }}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === 'decreases'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Spadki
              </button>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-2">
          Wyświetlono {filteredAndSortedData.length} z {data.length} produktów
        </p>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('productName')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Produkt
                  <SortIcon columnKey="productName" />
                </button>
              </th>
              <th className="text-right px-4 py-3">
                <button
                  onClick={() => handleSort('oldPrice')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-800 ml-auto"
                >
                  Stara cena
                  <SortIcon columnKey="oldPrice" />
                </button>
              </th>
              <th className="text-right px-4 py-3">
                <button
                  onClick={() => handleSort('newPrice')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-800 ml-auto"
                >
                  Nowa cena
                  <SortIcon columnKey="newPrice" />
                </button>
              </th>
              <th className="text-right px-4 py-3">
                <button
                  onClick={() => handleSort('differencePln')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-800 ml-auto"
                >
                  Różnica
                  <SortIcon columnKey="differencePln" />
                </button>
              </th>
              <th className="text-right px-4 py-3">
                <button
                  onClick={() => handleSort('changePercent')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-800 ml-auto"
                >
                  Zmiana %
                  <SortIcon columnKey="changePercent" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => {
              const isIncrease = item.changePercent > 0.5
              const isDecrease = item.changePercent < -0.5

              return (
                <tr
                  key={`${item.itemId}-${index}`}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    isIncrease ? 'bg-red-50/30' : isDecrease ? 'bg-green-50/30' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800 text-sm">{item.productName}</div>
                    <div className="text-xs text-gray-400">ID: {item.itemId}</div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {formatPln(item.oldPrice)} zł
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-800">
                    {formatPln(item.newPrice)} zł
                  </td>
                  <td className={`px-4 py-3 text-right text-sm font-medium ${
                    isIncrease ? 'text-red-600' : isDecrease ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {item.differencePln >= 0 ? '+' : ''}{formatPln(item.differencePln)} zł
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      isIncrease
                        ? 'bg-red-100 text-red-700'
                        : isDecrease
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 flex items-center justify-between border-t border-gray-200">
          <span className="text-sm text-gray-500">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filteredAndSortedData.length)} z {filteredAndSortedData.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 0}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-sm text-gray-600 px-2">{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
