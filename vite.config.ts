import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE permite trocar o host sem alterar código:
//   GitHub Pages → VITE_BASE=/sap-onepager-app/
//   Vercel/Netlify → deixar em branco (cai em '/')
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/sap-onepager-app/',
})
