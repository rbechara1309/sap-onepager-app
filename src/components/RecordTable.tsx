import { OnePagerRecord } from '../types'
import { ExternalLink, FileText } from 'lucide-react'

interface RecordTableProps {
  records: OnePagerRecord[]
  loading: boolean
  error: string | null
}

const BADGE_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  ativo: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  rascunho: 'bg-yellow-100 text-yellow-700',
  archived: 'bg-gray-100 text-gray-600',
  arquivado: 'bg-gray-100 text-gray-600',
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null
  const cls = BADGE_COLORS[status.toLowerCase()] ?? 'bg-blue-100 text-blue-700'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}

export function RecordTable({ records, loading, error }: RecordTableProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <div className="w-10 h-10 border-4 border-sap-blue border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm">Carregando dados do SharePoint…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <p className="font-semibold text-red-700 mb-1">Erro ao carregar dados</p>
        <p className="text-sm text-red-600">{error}</p>
        <p className="text-xs text-red-400 mt-3">
          Verifique as configurações do Azure AD e as permissões da Graph API.
        </p>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <FileText size={48} className="mb-4 opacity-30" />
        <p className="text-sm">Nenhum registro encontrado</p>
        <p className="text-xs mt-1">Tente ajustar os filtros</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-sap-light border-b border-blue-100">
            <th className="text-left px-4 py-3 font-semibold text-sap-dark whitespace-nowrap">Parceiro</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark whitespace-nowrap">Tipo</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark whitespace-nowrap">Solução</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark whitespace-nowrap">País</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark whitespace-nowrap">Idioma</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark whitespace-nowrap">Indústria</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark whitespace-nowrap">Status</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark whitespace-nowrap">Arquivo</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr
              key={r.id}
              className={`border-b border-gray-50 hover:bg-sap-light/50 transition-colors ${
                i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
              }`}
            >
              <td className="px-4 py-3 font-medium text-sap-dark max-w-[200px] truncate" title={r.partner}>
                {r.partner || '—'}
              </td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.partnerType || '—'}</td>
              <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate" title={r.solution}>
                {r.solution || '—'}
              </td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.country || '—'}</td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.language || '—'}</td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.industry || '—'}</td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-4 py-3">
                {r.fileUrl ? (
                  <a
                    href={r.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sap-blue hover:text-sap-dark font-medium transition-colors"
                    title={r.fileName}
                  >
                    <ExternalLink size={14} />
                    <span className="max-w-[140px] truncate text-xs">{r.fileName || 'Abrir'}</span>
                  </a>
                ) : r.fileName ? (
                  <span className="text-gray-500 text-xs truncate max-w-[140px] block">{r.fileName}</span>
                ) : (
                  <span className="text-gray-300 text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
