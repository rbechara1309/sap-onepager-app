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
      <table className="text-sm border-collapse" style={{ minWidth: '1000px', width: '100%' }}>
        <colgroup>
          <col style={{ width: '18%' }} />  {/* Parceiro */}
          <col style={{ width: '7%' }} />   {/* PRM ID */}
          <col style={{ width: '10%' }} />  {/* País */}
          <col style={{ width: '8%' }} />   {/* Região */}
          <col style={{ width: '9%' }} />   {/* Sub-Região */}
          <col style={{ width: '14%' }} />  {/* Tipo */}
          <col style={{ width: '10%' }} />  {/* Contato */}
          <col style={{ width: '15%' }} />  {/* E-mail */}
          <col style={{ width: '9%' }} />   {/* One Pager */}
        </colgroup>
        <thead>
          <tr className="bg-sap-light border-b border-blue-100">
            <th className="text-left px-4 py-3 font-semibold text-sap-dark">Parceiro</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark">PRM ID</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark">País</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark">Região SAP</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark">Sub-Região</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark">Tipo</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark">Contato SAP</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark">E-mail</th>
            <th className="text-left px-4 py-3 font-semibold text-sap-dark">One Pager</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr
              key={r.id}
              className={`border-b border-gray-100 hover:bg-sap-light/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
            >
              <td className="px-4 py-3 font-medium text-sap-dark">
                <span className="block truncate" title={r.partner}>{r.partner || '—'}</span>
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{r.prm_id || '—'}</td>
              <td className="px-4 py-3 text-gray-600 text-xs">
                <span className="block truncate" title={r.country}>{r.country || '—'}</span>
              </td>
              <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{r.sap_region || '—'}</td>
              <td className="px-4 py-3 text-gray-600 text-xs">
                <span className="block truncate" title={r['sap_sub_region_/_market_unit']}>{r['sap_sub_region_/_market_unit'] || '—'}</span>
              </td>
              <td className="px-4 py-3 text-gray-600 text-xs">
                <span className="block truncate" title={r.relationship2}>{r.relationship2 || '—'}</span>
              </td>
              <td className="px-4 py-3 text-gray-600 text-xs">
                <span className="block truncate" title={r.relationship_with_name}>{r.relationship_with_name || '—'}</span>
              </td>
              <td className="px-4 py-3">
                {r.relationship_with_email_id ? (
                  <a
                    href={`mailto:${r.relationship_with_email_id}`}
                    className="flex items-center gap-1 text-sap-blue hover:text-sap-dark transition-colors text-xs"
                    title={r.relationship_with_email_id}
                  >
                    <Mail size={12} className="shrink-0" />
                    <span className="truncate">{r.relationship_with_email_id}</span>
                  </a>
                ) : <span className="text-gray-300">—</span>}
              </td>
              <td className="px-4 py-3">
                {r.onePagerUrl ? (
                  <a
                    href={r.onePagerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={r.onePagerName}
                    className="inline-flex items-center gap-1.5 bg-sap-blue hover:bg-sap-dark text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap w-full justify-center"
                  >
                    <FileText size={13} className="shrink-0" />
                    Ver
                    {r.onePagerCount && Number(r.onePagerCount) > 1 && (
                      <span className="bg-white/25 rounded px-1 ml-0.5">{r.onePagerCount}</span>
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
