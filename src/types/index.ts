// Types for SAP One Pager inventory data
export interface OnePagerRecord {
  id: string
  partner?: string
  partnerType?: string
  solution?: string
  country?: string
  language?: string
  industry?: string
  topic?: string
  fileName?: string
  fileUrl?: string
  lastUpdated?: string
  owner?: string
  status?: string
  [key: string]: string | undefined
}

export interface FilterState {
  search: string
  country: string
  solution: string
  language: string
  industry: string
  partnerType: string
  status: string
}

export interface ColumnMapping {
  partner: number
  partnerType: number
  solution: number
  country: number
  language: number
  industry: number
  topic: number
  fileName: number
  fileUrl: number
  lastUpdated: number
  owner: number
  status: number
}
