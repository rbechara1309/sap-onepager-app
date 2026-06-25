import { Header } from './Header'
import { FilterPanel } from './FilterPanel'
import { RecordTable } from './RecordTable'
import { useOnePagerData } from '../hooks/useOnePagerData'

export function Dashboard() {
  const { records, totalRecords, loading, error, filters, setFilters, options, reload, lastUpdated, source } =
    useOnePagerData()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onReload={reload} loading={loading} lastUpdated={lastUpdated} source={source} />
      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        options={options}
        totalRecords={totalRecords}
        filteredCount={records.length}
      />
      <main className="flex-1 max-w-screen-xl w-full mx-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <RecordTable records={records} loading={loading} error={error} />
        </div>
      </main>
    </div>
  )
}
