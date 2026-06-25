// Converte Excel → public/records.json
// Uso: node scripts/convert-records.mjs <arquivo.xlsx>

import { readFile, writeFile } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'

const __dirname = dirname(fileURLToPath(import.meta.url))

const COL_MAP = {
  'partner name': 'partner', 'partner': 'partner',
  'partner type': 'partnerType', 'type': 'partnerType',
  'solution': 'solution', 'solution area': 'solution',
  'country': 'country', 'language': 'language', 'idioma': 'language',
  'industry': 'industry', 'indústria': 'industry', 'industria': 'industry',
  'prm_id': 'prm_id', 'prm id': 'prm_id',
  'crm_id': 'crm_id', 'crm id': 'crm_id',
  'sap_region': 'sap_region', 'sap region': 'sap_region',
  'sap_sub_region_/_market_unit': 'sap_sub_region_/_market_unit',
  'sap sub region / market unit': 'sap_sub_region_/_market_unit',
  'relationship': 'relationship', 'relationship2': 'relationship2',
  'relationship_with_(name)': 'relationship_with_name',
  'relationship with (name)': 'relationship_with_name',
  'relationship_with_email_id': 'relationship_with_email_id',
  'relationship with email id': 'relationship_with_email_id',
  'partner_group_id': 'partner_group_id',
}

function normalizeKey(h) {
  const lower = String(h).trim().toLowerCase()
  return COL_MAP[lower] ?? lower.replace(/\s+/g, '_').replace(/[()\/]/g, '_')
}

const [,, excelPath] = process.argv
if (!excelPath) { console.error('Uso: node scripts/convert-records.mjs <arquivo.xlsx>'); process.exit(1) }

const buf = await readFile(resolve(excelPath))
const wb = XLSX.read(buf, { type: 'buffer' })
const ws = wb.Sheets[wb.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

const headers = rows[0].map(normalizeKey)
const records = rows.slice(1)
  .filter(row => row.some(c => String(c).trim()))
  .map((row, i) => {
    const rec = { id: String(i + 1) }
    headers.forEach((k, j) => { rec[k] = String(row[j] ?? '').trim() })
    return rec
  })

const out = {
  lastUpdated: new Date().toISOString().split('T')[0],
  source: excelPath.split(/[/\\]/).pop(),
  records,
}
const outPath = resolve(__dirname, '../public/records.json')
await writeFile(outPath, JSON.stringify(out, null, 2), 'utf-8')
console.log(`✓ ${records.length} registros → ${outPath}`)
