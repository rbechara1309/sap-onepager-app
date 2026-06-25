import { useState, useEffect, useCallback } from 'react'
import { OnePagerRecord, FilterState } from '../types'
import { loadOnePagerData, applyFilters } from '../services/dataService'

const INITIAL_FILTERS: FilterState = {
  search: '',
  country: '',
  solution: '',
  language: '',
  industry: '',
  partnerType: '',
  status: '',
}

export function useOnePagerData() {
  const [allRecords, setAllRecords] = useState<OnePagerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [source, setSource] = useState<string>('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const manifest = await loadOnePagerData()
      setAllRecords(manifest.records)
      setLastUpdated(manifest.lastUpdated)
      setSource(manifest.source)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const records = applyFilters(allRecords, filters)

  const options = {
    countries: [...new Set(allRecords.map((r) => r.country).filter(Boolean))].sort() as string[],
    solutions: [...new Set(allRecords.map((r) => r.solution).filter(Boolean))].sort() as string[],
    languages: [...new Set(allRecords.map((r) => r.language).filter(Boolean))].sort() as string[],
    industries: [...new Set(allRecords.map((r) => r.industry).filter(Boolean))].sort() as string[],
    partnerTypes: [...new Set(allRecords.map((r) => r.partnerType).filter(Boolean))].sort() as string[],
    statuses: [...new Set(allRecords.map((r) => r.status).filter(Boolean))].sort() as string[],
  }

  return {
    records,
    totalRecords: allRecords.length,
    loading,
    error,
    filters,
    setFilters,
    options,
    reload: loadData,
    lastUpdated,
    source,
  }
}
