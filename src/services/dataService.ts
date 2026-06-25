import { OnePagerRecord, FilterState } from '../types'

export interface DataManifest {
  lastUpdated: string
  source: string
  records: OnePagerRecord[]
}

export async function loadOnePagerData(): Promise<DataManifest> {
  const base = import.meta.env.BASE_URL ?? '/'
  const url = `${base}data.json`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Não foi possível carregar os dados (${res.status}).`)
  return await res.json() as DataManifest
}

export function applyFilters(records: OnePagerRecord[], filters: FilterState): OnePagerRecord[] {
  return records.filter((r) => {
    const q = filters.search.toLowerCase()
    if (q && !Object.values(r).some((v) => v?.toLowerCase().includes(q))) return false
    if (filters.country && r.country?.toLowerCase() !== filters.country.toLowerCase()) return false
    if (filters.sap_region && r.sap_region?.toLowerCase() !== filters.sap_region.toLowerCase()) return false
    if (filters.relationship2 && r.relationship2?.toLowerCase() !== filters.relationship2.toLowerCase()) return false
    return true
  })
}
