// Converte onepapers-files.json (exportado pelo browser) → public/files.json
// Uso: node scripts/convert-files.mjs <onepapers-files.json>

import { readFile, writeFile } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const [,, inputPath] = process.argv
if (!inputPath) { console.error('Uso: node scripts/convert-files.mjs <onepapers-files.json>'); process.exit(1) }

const raw = JSON.parse(await readFile(resolve(inputPath), 'utf-8'))
const files = Array.isArray(raw) ? raw : raw.files ?? []

const out = {
  lastUpdated: new Date().toISOString().split('T')[0],
  files,
}
const outPath = resolve(__dirname, '../public/files.json')
await writeFile(outPath, JSON.stringify(out, null, 2), 'utf-8')
console.log(`✓ ${files.length} arquivos → ${outPath}`)
