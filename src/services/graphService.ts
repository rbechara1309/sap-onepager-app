import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser'
import { LOGIN_REQUEST, SHAREPOINT_CONFIG } from './authConfig'
import { OnePagerRecord } from '../types'

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0'

async function getToken(instance: IPublicClientApplication, account: AccountInfo): Promise<string> {
  const response = await instance.acquireTokenSilent({
    ...LOGIN_REQUEST,
    account,
  })
  return response.accessToken
}

// Fetch the SharePoint site ID via Graph API
async function getSiteId(token: string): Promise<string> {
  const url = `${GRAPH_BASE}/sites/${SHAREPOINT_CONFIG.siteHostname}:${SHAREPOINT_CONFIG.sitePath}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`Failed to get site: ${res.statusText}`)
  const data = await res.json()
  return data.id as string
}

// Resolve driveId from the site (first document library) or use env var
async function getDriveId(token: string, siteId: string): Promise<string> {
  if (SHAREPOINT_CONFIG.driveId) return SHAREPOINT_CONFIG.driveId

  const url = `${GRAPH_BASE}/sites/${siteId}/drives`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`Failed to get drives: ${res.statusText}`)
  const data = await res.json()
  // Use drive named "Documents" or first available
  const drive = (data.value as { name: string; id: string }[]).find(
    (d) => d.name === 'Documents' || d.name === 'Shared Documents'
  ) ?? data.value[0]
  return drive.id as string
}

// Get worksheets from the Excel file
async function getWorksheets(token: string, driveId: string, itemId: string): Promise<{ id: string; name: string }[]> {
  const url = `${GRAPH_BASE}/drives/${driveId}/items/${itemId}/workbook/worksheets`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`Failed to get worksheets: ${res.statusText}`)
  const data = await res.json()
  return data.value as { id: string; name: string }[]
}

// Fetch Excel table/used-range rows from Graph API
async function fetchSheetRows(
  token: string,
  driveId: string,
  itemId: string,
  worksheetName: string
): Promise<string[][]> {
  const sheetSegment = encodeURIComponent(worksheetName)
  const url = `${GRAPH_BASE}/drives/${driveId}/items/${itemId}/workbook/worksheets/${sheetSegment}/usedRange`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`Failed to read sheet: ${res.statusText}`)
  const data = await res.json()
  return data.values as string[][]
}

// Map raw rows to OnePagerRecord objects using the header row
function mapRowsToRecords(rows: string[][]): OnePagerRecord[] {
  if (rows.length < 2) return []
  const headers = rows[0].map((h) => String(h).trim())

  return rows.slice(1).map((row, idx) => {
    const record: OnePagerRecord = { id: String(idx + 1) }
    headers.forEach((header, colIdx) => {
      const key = normalizeKey(header)
      record[key] = String(row[colIdx] ?? '').trim()
    })
    return record
  })
}

// Normalize column header to camelCase key
function normalizeKey(header: string): string {
  const map: Record<string, string> = {
    'partner name': 'partner',
    partner: 'partner',
    'partner type': 'partnerType',
    type: 'partnerType',
    solution: 'solution',
    'solution area': 'solution',
    country: 'country',
    language: 'language',
    industry: 'industry',
    topic: 'topic',
    'file name': 'fileName',
    filename: 'fileName',
    'file url': 'fileUrl',
    url: 'fileUrl',
    link: 'fileUrl',
    'last updated': 'lastUpdated',
    updated: 'lastUpdated',
    owner: 'owner',
    status: 'status',
  }
  return map[header.toLowerCase()] ?? header.toLowerCase().replace(/\s+/g, '_')
}

// Main entry point: loads all One Pager records from the Excel file
export async function loadOnePagerData(
  instance: IPublicClientApplication,
  account: AccountInfo
): Promise<OnePagerRecord[]> {
  const token = await getToken(instance, account)
  const siteId = await getSiteId(token)
  const driveId = await getDriveId(token, siteId)

  // Find the file by item ID (the `d=` value in the SharePoint URL)
  const itemId = SHAREPOINT_CONFIG.fileItemId

  // Determine worksheet
  let worksheetName = SHAREPOINT_CONFIG.worksheetName
  if (!worksheetName) {
    const sheets = await getWorksheets(token, driveId, itemId)
    worksheetName = sheets[0]?.name ?? 'Sheet1'
  }

  const rows = await fetchSheetRows(token, driveId, itemId, worksheetName)
  return mapRowsToRecords(rows)
}

// Lists all files in the One Pager folder (for browsing)
export async function listOnePagerFiles(
  instance: IPublicClientApplication,
  account: AccountInfo
): Promise<{ name: string; webUrl: string; lastModified: string }[]> {
  const token = await getToken(instance, account)
  const siteId = await getSiteId(token)
  const driveId = await getDriveId(token, siteId)

  // Folder path relative to Shared Documents
  const folderPath = 'Region LAC Latin America and Caribbean (Pablo)/2026/One Pager'
  const encodedPath = encodeURIComponent(folderPath)
  const url = `${GRAPH_BASE}/drives/${driveId}/root:/${encodedPath}:/children`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`Failed to list files: ${res.statusText}`)
  const data = await res.json()

  return (data.value as { name: string; webUrl: string; lastModifiedDateTime: string }[]).map((f) => ({
    name: f.name,
    webUrl: f.webUrl,
    lastModified: f.lastModifiedDateTime?.split('T')[0] ?? '',
  }))
}
