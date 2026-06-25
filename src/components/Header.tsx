import { RefreshCw, Database } from 'lucide-react'

interface HeaderProps {
  onReload: () => void
  loading: boolean
  lastUpdated: string | null
  source: string
}

export function Header({ onReload, loading, lastUpdated, source }: HeaderProps) {
  return (
    <header className="bg-sap-dark text-white shadow-lg">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 bg-sap-blue rounded-lg shrink-0">
            <span className="text-white font-bold text-sm">SAP</span>
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">One Pager Hub</h1>
            <p className="text-blue-300 text-xs">Region LAC · SPM & PCSM</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-blue-300">
              <Database size={12} />
              <span>Dados de: {lastUpdated}</span>
            </div>
          )}
          {source && (
            <span className="hidden lg:inline text-xs text-blue-400 max-w-[200px] truncate" title={source}>
              {source}
            </span>
          )}
          <button
            onClick={onReload}
            disabled={loading}
            title="Recarregar dados"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    </header>
  )
}
