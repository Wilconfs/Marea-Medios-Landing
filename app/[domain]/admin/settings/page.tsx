'use client'

import { useState } from 'react'
import { Settings, ShieldAlert, CheckCircle2, RefreshCw, Key, Facebook, Instagram } from 'lucide-react'

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [metaAppId, setMetaAppId] = useState('123456789012345') // Mock de tu cuenta de prueba
  const [metaAppSecret, setMetaAppSecret] = useState('••••••••••••••••••••••••••••••••')
  const [pageAccessToken, setPageAccessToken] = useState('EAAb....TEST_TOKEN....Z9ZD')

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    // Simulación de guardado en base de datos (Prisma)
    setTimeout(() => {
      setIsSaving(false)
      alert('Configuración de Meta (Entorno de Prueba) guardada correctamente.')
    }, 1000)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-zinc-700" /> Configuración del Sistema
        </h1>
        <p className="text-sm text-zinc-500">
          Gestiona las credenciales de la API de Meta y el entorno de pruebas para Marea Medios.
        </p>
      </div>

      {/* Alerta de Entorno de Pruebas */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
        <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-amber-800">Modo Sandbox / Desarrollador Activo</h3>
          <p className="text-xs text-amber-700 mt-0.5">
            Actualmente estás operando con cuentas de prueba de Meta. Los videos publicados solo serán visibles para los administradores y usuarios de prueba registrados en tu Meta Business Suite.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna Izquierda: Formulario de Credenciales API */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-500" /> Credenciales de Meta Developer
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-600">Meta App ID (Identificador de la Aplicación)</label>
              <input
                type="text"
                value={metaAppId}
                onChange={(e) => setMetaAppId(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-600">Meta App Secret</label>
              <input
                type="password"
                value={metaAppSecret}
                onChange={(e) => setMetaAppSecret(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-600">System User / Page Access Token (Larga Duración)</label>
              <textarea
                value={pageAccessToken}
                onChange={(e) => setPageAccessToken(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-zinc-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Actualizar Credenciales API'}
            </button>
          </form>
        </div>

        {/* Columna Derecha: Canales y Cuentas Vinculadas Activas */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-zinc-900">Canales de Prueba</h2>
            <button className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Página Facebook de Prueba */}
            <div className="p-4 border border-zinc-100 bg-zinc-50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Facebook className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900">Marea Test Page</h4>
                  <p className="text-[11px] text-zinc-500">ID: 987654321</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" /> OK
              </span>
            </div>

            {/* Cuenta de Instagram de Prueba */}
            <div className="p-4 border border-zinc-100 bg-zinc-50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                  <Instagram className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900">@marea_media_test</h4>
                  <p className="text-[11px] text-zinc-500">Instagram Business</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" /> OK
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <p className="text-[11px] text-zinc-400 text-center">
              Vinculado a través de Meta Graph API v20.0
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}