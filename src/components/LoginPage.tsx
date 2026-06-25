import { useMsal } from '@azure/msal-react'
import { LOGIN_REQUEST } from '../services/authConfig'
import { LogIn } from 'lucide-react'

export function LoginPage() {
  const { instance } = useMsal()

  const handleLogin = () => {
    instance.loginPopup(LOGIN_REQUEST).catch(console.error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sap-dark via-sap-blue to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        {/* SAP Logo area */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-sap-blue rounded-2xl mb-4">
            <span className="text-white font-bold text-3xl tracking-tight">SAP</span>
          </div>
          <h1 className="text-2xl font-bold text-sap-dark">One Pager Hub</h1>
          <p className="text-gray-500 mt-1 text-sm">Region LAC — Partner Portal</p>
        </div>

        <p className="text-gray-600 mb-8 text-sm leading-relaxed">
          Acesse o inventário de One Pagers de parceiros SAP para a região da América Latina e Caribe.
          Faça login com sua conta Microsoft corporativa.
        </p>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-sap-blue hover:bg-sap-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          <LogIn size={20} />
          Entrar com Microsoft
        </button>

        <p className="mt-6 text-xs text-gray-400">
          Autenticado via Microsoft Azure AD · SAP SE
        </p>
      </div>
    </div>
  )
}
