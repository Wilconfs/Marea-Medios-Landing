'use client'

import { useState } from 'react'
import { Building2, Briefcase, Settings, ShieldCheck, Zap } from "lucide-react"

export default function ConfigSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', label: 'Empresa', icon: Building2 },
    { id: 'pipeline', label: 'Pipeline Ventas', icon: Briefcase },
    { id: 'integraciones', label: 'Integraciones', icon: Zap },
    { id: 'seguridad', label: 'Seguridad', icon: ShieldCheck },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">Configuración del Sistema</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar de Configuración */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panel de Contenido */}
        <div className="flex-1 bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">Información de la Empresa</h2>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Razón Social" className="p-3 border rounded-xl text-sm w-full" />
                <input placeholder="NIT / ID Fiscal" className="p-3 border rounded-xl text-sm w-full" />
                <input placeholder="Dirección" className="p-3 border rounded-xl text-sm w-full col-span-2" />
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">Configuración de Etapas</h2>
              <p className="text-sm text-zinc-500">Define las fases de tu proceso comercial.</p>
              <div className="space-y-3">
                {['Contacto Inicial', 'Cotización Enviada', 'Negociación', 'Ganado'].map((etapa) => (
                  <div key={etapa} className="flex items-center gap-3 p-3 border rounded-xl bg-zinc-50">
                    <span className="text-sm font-medium">{etapa}</span>
                  </div>
                ))}
              </div>
              <button className="text-blue-600 text-sm font-medium">+ Agregar nueva etapa</button>
            </div>
          )}

          {activeTab === 'integraciones' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">API & Conexiones</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase">WhatsApp API Key</label>
                  <input className="w-full p-3 border rounded-xl mt-1 text-sm font-mono" placeholder="sk_live_..." />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase">Bold API Token</label>
                  <input className="w-full p-3 border rounded-xl mt-1 text-sm font-mono" placeholder="bold_..." />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seguridad' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">Roles y Accesos</h2>
              <p className="text-sm text-zinc-500">Define quién puede ver qué secciones.</p>
              <div className="border rounded-xl p-4 divide-y">
                <div className="py-3 flex justify-between">
                  <span className="text-sm font-medium">Administrador</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Acceso Total</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-sm font-medium">Auxiliar</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Acceso Limitado</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t flex justify-end">
            <button className="bg-zinc-900 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-zinc-800">
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}