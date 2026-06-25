import { useState, useEffect, useCallback } from 'react'
import { OnePagerRecord, FilterState } from '../types'
import { loadOnePagerData, applyFilters } from '../services/dataService'

const INITIAL_FILTERS: FilterState = {
  search: '', country: '', sap_region: '', relationship2: '',
}

export function useOnePagerData() {
  const [allRecords, setAllRecords] = useState<OnePagerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [source, setSource] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await loadOnePagerData()
      setAllRecords(data.records)
      setLastUpdated(data.lastUpdated)
      setSource(data.source)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const records = applyFilters(allRecords, filters)

  const options = {
    countries:     [...new Set(allRecords.map(r => r.country).filter(Boolean))].sort() as string[],
    sap_regions:   [...new Set(allRecords.map(r => r.sap_region).filter(Boolean))].sort() as string[],
    relationships: [...new Set(allRecords.map(r => r.relationship2).filter(Boolean))].sort() as string[],
  }

  return { records, totalRecords: allRecords.length, loading, error,
           filters, setFilters, options, reload: loadData, lastUpdated, source }
}
