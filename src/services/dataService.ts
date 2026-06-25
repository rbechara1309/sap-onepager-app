import { OnePagerRecord, FilterState } from '../types'

export interface RecordsManifest {
  lastUpdated: string
  source: string
  records: OnePagerRecord[]
}

export interface FilesManifest {
  lastUpdated: string
  files: { name: string; url: string }[]
}

function extractId(name: string): string | null {
  const m = name.match(/\((\d+)\)/)
  return m ? m[1] : null
}

function crossReference(records: OnePagerRecord[], files: { name: string; url: string }[]): OnePagerRecord[] {
  const byId: Record<string, { name: string; url: string }[]> = {}
  for (const f of files) {
    const id = extractId(f.name)
    if (id) {
      if (!byId[id]) byId[id] = []
      byId[id].push(f)
    }
  }

  return records.map(r => {
    const match = (r.prm_id && byId[r.prm_id]) ? byId[r.prm_id]
                : (r.crm_id && byId[r.crm_id]) ? byId[r.crm_id]
                : null
    if (!match) return r
    return {
      ...r,
      onePagerUrl:   match[0].url,
      onePagerName:  match[0].name,
      onePagerCount: String(match.length),
    }
  })
}

async function fetchJson<T>(path: string): Promise<T> {
  const base = import.meta.env.BASE_URL ?? '/'
  const res = await fetch(`${base}${path}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Erro ao carregar ${path} (HTTP ${res.status})`)
  return res.json() as Promise<T>
}

export async function loadOnePagerData(): Promise<{ records: OnePagerRecord[]; lastUpdated: string; source: string }> {
  const [rec, fil] = await Promise.all([
    fetchJson<RecordsManifest>('records.json'),
    fetchJson<FilesManifest>('files.json'),
  ])

  const records = crossReference(rec.records, fil.files)
  return {
    records,
    lastUpdated: rec.lastUpdated || fil.lastUpdated,
    source: rec.source,
  }
}

export function applyFilters(records: OnePagerRecord[], filters: FilterState): OnePagerRecord[] {
  return records.filter(r => {
    const q = filters.search.toLowerCase()
    if (q && !Object.values(r).some(v => v?.toLowerCase().includes(q))) return false
    if (filters.country    && r.country?.toLowerCase()     !== filters.country.toLowerCase())    return false
    if (filters.sap_region && r.sap_region?.toLowerCase()  !== filters.sap_region.toLowerCase()) return false
    if (filters.relationship2 && r.relationship2?.toLowerCase() !== filters.relationship2.toLowerCase()) return false
    return true
  })
}
