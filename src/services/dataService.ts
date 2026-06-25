import { OnePagerRecord, FilterState } from '../types'

// Data is served from public/data.json — updated by Power Automate or manual convert script
export interface DataManifest {
  lastUpdated: string
  source: string
  records: OnePagerRecord[]
}

export async function loadOnePagerData(): Promise<DataManifest> {
  const base = import.meta.env.BASE_URL ?? '/'
  const url = `${base}data.json`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Não foi possível carregar os dados (${res.status}). Verifique se data.json está publicado.`)
  const json = await res.json() as DataManifest
  return json
}

export function applyFilters(records: OnePagerRecord[], filters: FilterState): OnePagerRecord[] {
  return records.filter((r) => {
    const q = filters.search.toLowerCase()
    if (q && !Object.values(r).some((v) => v?.toLowerCase().includes(q))) return false
    if (filters.country && r.country?.toLowerCase() !== filters.country.toLowerCase()) return false
    if (filters.solution && r.solution?.toLowerCase() !== filters.solution.toLowerCase()) return false
    if (filters.language && r.language?.toLowerCase() !== filters.language.toLowerCase()) return false
    if (filters.industry && r.industry?.toLowerCase() !== filters.industry.toLowerCase()) return false
    if (filters.partnerType && r.partnerType?.toLowerCase() !== filters.partnerType.toLowerCase()) return false
    if (filters.status && r.status?.toLowerCase() !== filters.status.toLowerCase()) return false
    return true
  })
}
