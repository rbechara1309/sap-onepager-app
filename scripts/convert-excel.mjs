// Script de conversão: Excel + onepapers-files.json → public/data.json
// Uso: node scripts/convert-excel.mjs <arquivo.xlsx> [onepapers-files.json]
// Exemplo: node scripts/convert-excel.mjs "Downloads/SPM.xlsx" "Downloads/onepapers-files.json"

import { readFile, writeFile } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'

const __dirname = dirname(fileURLToPath(import.meta.url))

const COLUMN_MAP = {
  'partner name': 'partner', 'partner': 'partner',
  'partner type': 'partnerType', 'type': 'partnerType',
  'solution': 'solution', 'solution area': 'solution',
  'country': 'country', 'language': 'language', 'idioma': 'language',
  'industry': 'industry', 'indústria': 'industry', 'industria': 'industry',
  'topic': 'topic', 'tópico': 'topic', 'topico': 'topic',
  'file name': 'fileName', 'filename': 'fileName', 'nome do arquivo': 'fileName',
  'file url': 'fileUrl', 'url': 'fileUrl', 'link': 'fileUrl',
  'last updated': 'lastUpdated', 'updated': 'lastUpdated', 'atualizado': 'lastUpdated',
  'owner': 'owner', 'responsável': 'owner', 'responsavel': 'owner',
  'status': 'status',
}

function normalizeKey(header) {
  const lower = String(header).trim().toLowerCase()
  return COLUMN_MAP[lower] ?? lower.replace(/\s+/g, '_').replace(/[()\/]/g, '_')
}

// Extrai PRM ID do nome do arquivo: "062025_Deloitte_(25577).pdf" → "25577"
function extractPrmId(filename) {
  const match = filename.match(/\((\d+)\)/)
  return match ? match[1] : null
}

async function convert(excelPath, filesJsonPath) {
  const absExcel = resolve(excelPath)
  console.log(`Lendo Excel: ${absExcel}`)

  const buf = await readFile(absExcel)
  const wb = XLSX.read(buf, { type: 'buffer' })
  const sheetName = wb.SheetNames[0]
  console.log(`Aba: ${sheetName}`)

  const ws = wb.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

  if (rows.length < 2) { console.error('Planilha vazia.'); process.exit(1) }

  const headers = rows[0].map(normalizeKey)
  const records = rows.slice(1)
    .filter(row => row.some(cell => String(cell).trim()))
    .map((row, idx) => {
      const rec = { id: String(idx + 1) }
      headers.forEach((key, i) => { rec[key] = String(row[i] ?? '').trim() })
      return rec
    })

  // Cruza com a lista de arquivos do SharePoint se fornecida
  if (filesJsonPath) {
    const absFiles = resolve(filesJsonPath)
    console.log(`Cruzando com lista de arquivos: ${absFiles}`)
    const filesRaw = await readFile(absFiles, 'utf-8')
    const files = JSON.parse(filesRaw)

    // Índice por ID (aceita PRM ID e CRM ID)
    const byId = {}
    for (const f of files) {
      const id = extractPrmId(f.name)
      if (id) {
        if (!byId[id]) byId[id] = []
        byId[id].push(f)
      }
    }

    let matchedPrm = 0, matchedCrm = 0
    for (const rec of records) {
      const prmId = rec.prm_id || rec.prmid || rec.prm
      const crmId = rec.crm_id || rec.crmid || rec.crm

      // Prioridade: PRM ID, depois CRM ID
      const match = (prmId && byId[prmId]) ? { files: byId[prmId], via: 'prm' }
                  : (crmId && byId[crmId]) ? { files: byId[crmId], via: 'crm' }
                  : null

      if (match) {
        rec.onePagerUrl = match.files[0].url
        rec.onePagerName = match.files[0].name
        rec.onePagerCount = String(match.files.length)
        if (match.via === 'prm') matchedPrm++; else matchedCrm++
      }
    }
    console.log(`✓ ${matchedPrm + matchedCrm} de ${records.length} registros com One Pager vinculado`)
    console.log(`  → ${matchedPrm} via PRM ID, ${matchedCrm} via CRM ID`)
  }

  const manifest = {
    lastUpdated: new Date().toISOString().split('T')[0],
    source: excelPath.split(/[/\\]/).pop(),
    records,
  }

  const outPath = resolve(__dirname, '../public/data.json')
  await writeFile(outPath, JSON.stringify(manifest, null, 2), 'utf-8')
  console.log(`✓ ${records.length} registros salvos em: ${outPath}`)
}

const args = process.argv.slice(2)
if (!args[0]) {
  console.error('Uso: node scripts/convert-excel.mjs <arquivo.xlsx> [onepapers-files.json]')
  process.exit(1)
}

convert(args[0], args[1] || null).catch(err => {
  console.error('Erro:', err.message)
  process.exit(1)
})
