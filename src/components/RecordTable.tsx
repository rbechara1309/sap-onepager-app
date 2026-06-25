import { OnePagerRecord } from '../types'
import { Mail, Users, FileText } from 'lucide-react'

interface RecordTableProps {
  records: OnePagerRecord[]
  loading: boolean
  error: string | null
}

export function RecordTable({ records, loading, error }: RecordTableProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <div className="w-10 h-10 border-4 border-sap-blue border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm">Carregando dados…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <p className="font-semibold text-red-700 mb-1">Erro ao carregar dados</p>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <Users size={48} className="mb-4 opacity-30" />
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
            <th className="text-left px-4 py-3 font-semibold text-sap-dark whitespace-nowrap">PRM ID</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark whitespace-nowrap">País</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark whitespace-nowrap">Região SAP</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark whitespace-nowrap">Sub-Região</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark whitespace-nowrap">Tipo</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark whitespace-nowrap">Contato SAP</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark whitespace-nowrap">E-mail</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark whitespace-nowrap">One Pager</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={r.id} className={`border-b border-gray-50 hover:bg-sap-light/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
              <td className="px-4 py-3 font-medium text-sap-dark max-w-[200px] truncate" title={r.partner}>
                {r.partner || '—'}
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">{r.prm_id || '—'}</td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.country || '—'}</td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.sap_region || '—'}</td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">{r['sap_sub_region_/_market_unit'] || '—'}</td>
              <td className="px-4 py-3 text-gray-600 text-xs max-w-[160px] truncate" title={r.relationship2}>
                {r.relationship2 || '—'}
              </td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.relationship_with_name || '—'}</td>
              <td className="px-4 py-3">
                {r.relationship_with_email_id ? (
                  <a href={`mailto:${r.relationship_with_email_id}`}
                    className="flex items-center gap-1.5 text-sap-blue hover:text-sap-dark transition-colors text-xs">
                    <Mail size={13} />
                    <span className="truncate max-w-[160px]">{r.relationship_with_email_id}</span>
                  </a>
                ) : '—'}
              </td>
              <td className="px-4 py-3">
                {r.onePagerUrl ? (
                  <a href={r.onePagerUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-sap-blue hover:bg-sap-dark text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    title={r.onePagerName}>
                    <FileText size={13} />
                    Ver One Pager
                    {r.onePagerCount && Number(r.onePagerCount) > 1 && (
                      <span className="bg-white/20 rounded px-1">{r.onePagerCount}</span>
                    )}
                  </a>
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
