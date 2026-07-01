'use client'

import { AlertTriangle, KeyRound, Save, RefreshCw, Facebook, Instagram, Link as LinkIcon } from "lucide-react"

export function SettingsView() {
  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Configuración del Sistema</h1>
          <p className="text-sm text-zinc-500">Gestiona las credenciales de la API de Meta y el entorno de pruebas.</p>
        </div>
      </div>

      {/* ALERTA SANDBOX */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-amber-800">Modo Sandbox / Desarrollador Activo</h4>
          <p className="text-sm text-amber-700 mt-1">
            Actualmente estás operando con cuentas de prueba de Meta. Los videos publicados solo serán visibles para los administradores y usuarios de prueba registrados en tu Meta Business Suite.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CREDENCIALES API */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-zinc-900">Credenciales de Meta Developer</h3>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Meta App ID (Identificador de la Aplicación)</label>
            <input type="text" defaultValue="123456789012345" className="w-full p-3 border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 bg-zinc-50/50" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Meta App Secret</label>
            <input type="password" defaultValue="••••••••••••••••••••••••••••••••" className="w-full p-3 border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 bg-zinc-50/50" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">System User / Page Access Token (Larga Duración)</label>
            <textarea rows={3} defaultValue="EAAb....TEST_TOKEN....Z9ZD" className="w-full p-3 border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 bg-zinc-50/50 resize-none text-sm font-mono text-zinc-600" />
          </div>

          <button className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 font-medium text-sm text-white hover:bg-zinc-800 transition-all shadow-sm">
            <Save className="h-4 w-4" /> Actualizar Credenciales API
          </button>
        </div>

        {/* CANALES DE PRUEBA */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-zinc-900">Canales de Prueba</h3>
            <button className="text-zinc-400 hover:text-blue-600 transition-colors"><RefreshCw className="h-4 w-4" /></button>
          </div>

          <div className="space-y-3 flex-1">
            <div className="p-4 border border-zinc-200 rounded-xl flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Facebook className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">Marea Test Page</p>
                  <p className="text-[11px] text-zinc-500 font-mono">ID: 987654321</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><LinkIcon className="h-3 w-3"/> OK</span>
            </div>

            <div className="p-4 border border-zinc-200 rounded-xl flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg text-pink-600"><Instagram className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">@marea_media_test</p>
                  <p className="text-[11px] text-zinc-500">Instagram Business</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><LinkIcon className="h-3 w-3"/> OK</span>
            </div>
          </div>
          
          <p className="text-xs text-center text-zinc-400 mt-6 pt-4 border-t border-zinc-100">Vinculado a través de Meta Graph API v20.0</p>
        </div>
      </div>
    </div>
  )
}