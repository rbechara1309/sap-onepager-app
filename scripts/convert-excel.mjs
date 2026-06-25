// Script de conversão local: Excel → public/data.json
// Uso: node scripts/convert-excel.mjs caminho/para/arquivo.xlsx
// Requer: npm install xlsx (já incluído em devDependencies)

import { readFile } from 'fs/promises'
import { writeFile } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'

const __dirname = dirname(fileURLToPath(import.meta.url))

const COLUMN_MAP = {
  'partner name': 'partner',
  'partner': 'partner',
  'partner type': 'partnerType',
  'type': 'partnerType',
  'solution': 'solution',
  'solution area': 'solution',
  'country': 'country',
  'language': 'language',
  'idioma': 'language',
  'industry': 'industry',
  'indústria': 'industry',
  'industria': 'industry',
  'topic': 'topic',
  'tópico': 'topic',
  'topico': 'topic',
  'file name': 'fileName',
  'filename': 'fileName',
  'nome do arquivo': 'fileName',
  'file url': 'fileUrl',
  'url': 'fileUrl',
  'link': 'fileUrl',
  'last updated': 'lastUpdated',
  'updated': 'lastUpdated',
  'atualizado': 'lastUpdated',
  'owner': 'owner',
  'responsável': 'owner',
  'responsavel': 'owner',
  'status': 'status',
}

function normalizeKey(header) {
  const lower = String(header).trim().toLowerCase()
  return COLUMN_MAP[lower] ?? lower.replace(/\s+/g, '_')
}

async function convert(excelPath) {
  const absPath = resolve(excelPath)
  console.log(`Lendo: ${absPath}`)

  const buf = await readFile(absPath)
  const wb = XLSX.read(buf, { type: 'buffer' })

  // Use first worksheet
  const sheetName = wb.SheetNames[0]
  console.log(`Aba: ${sheetName}`)

  const ws = wb.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

  if (rows.length < 2) {
    console.error('Planilha vazia ou sem linhas de dados.')
    process.exit(1)
  }

  const headers = rows[0].map(normalizeKey)
  const records = rows.slice(1)
    .filter(row => row.some(cell => String(cell).trim()))  // skip empty rows
    .map((row, idx) => {
      const rec = { id: String(idx + 1) }
      headers.forEach((key, i) => {
        rec[key] = String(row[i] ?? '').trim()
      })
      return rec
    })

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
  console.error('Uso: node scripts/convert-excel.mjs <caminho-do-arquivo.xlsx>')
  process.exit(1)
}

convert(args[0]).catch(err => {
  console.error('Erro:', err.message)
  process.exit(1)
})
