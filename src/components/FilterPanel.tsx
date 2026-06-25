import { FilterState } from '../types'
import { Search, X } from 'lucide-react'

interface FilterPanelProps {
  filters: FilterState
  setFilters: (f: FilterState) => void
  options: {
    countries: string[]
    solutions: string[]
    languages: string[]
    industries: string[]
    partnerTypes: string[]
    statuses: string[]
  }
  totalRecords: number
  filteredCount: number
}

interface SelectProps {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}

function FilterSelect({ label, value, options, onChange }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sap-blue focus:border-transparent"
      >
        <option value="">Todos</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

export function FilterPanel({ filters, setFilters, options, totalRecords, filteredCount }: FilterPanelProps) {
  const hasActiveFilters = Object.values(filters).some(Boolean)

  const clearAll = () =>
    setFilters({ search: '', country: '', solution: '', language: '', industry: '', partnerType: '', status: '' })

  const update = (key: keyof FilterState) => (value: string) =>
    setFilters({ ...filters, [key]: value })

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 py-4">
        {/* Search bar */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por parceiro, solução, país, arquivo…"
            value={filters.search}
            onChange={(e) => update('search')(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sap-blue focus:border-transparent"
          />
          {filters.search && (
            <button
              onClick={() => update('search')('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <FilterSelect label="País" value={filters.country} options={options.countries} onChange={update('country')} />
          <FilterSelect label="Solução" value={filters.solution} options={options.solutions} onChange={update('solution')} />
          <FilterSelect label="Idioma" value={filters.language} options={options.languages} onChange={update('language')} />
          <FilterSelect label="Indústria" value={filters.industry} options={options.industries} onChange={update('industry')} />
          <FilterSelect label="Tipo de Parceiro" value={filters.partnerType} options={options.partnerTypes} onChange={update('partnerType')} />
          <FilterSelect label="Status" value={filters.status} options={options.statuses} onChange={update('status')} />
        </div>

        {/* Result count + clear */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Exibindo <strong className="text-sap-dark">{filteredCount}</strong> de{' '}
            <strong className="text-sap-dark">{totalRecords}</strong> registros
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-sap-blue hover:text-sap-dark text-xs font-medium transition-colors"
            >
              <X size={13} />
              Limpar filtros
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
