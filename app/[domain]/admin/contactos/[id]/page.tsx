'use client'

import { useState } from 'react'
import { 
  ArrowLeft, Mail, Phone, Building2, MapPin, 
  Wallet, CalendarDays, CheckCircle2, MessageCircle, 
  Plus, Edit3, Briefcase, ListTodo, FileText
} from 'lucide-react'
import Link from 'next/link'

export default function ContactoPerfilPage() {
  // Estado para controlar qué pestaña está activa
  const [activeTab, setActiveTab] = useState('resumen')

  // Datos simulados del cliente
  const cliente = {
    nombre: "Carlos Mendoza",
    empresa: "TechCorp Solutions",
    cargo: "Director de Compras",
    email: "carlos@techcorp.com",
    telefono: "+57 300 123 4567",
    ciudad: "Bogotá, Colombia",
    estado: "Cliente VIP",
    origen: "Campaña Instagram",
    ltv: "$4,500,000",
    pedidosTotales: 8,
    ultimaCompra: "15 Jun 2026",
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* Botón Volver */}
      <Link href="/admin/contactos" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver al directorio
      </Link>

      {/* HEADER DEL PERFIL */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        {/* Decoración de fondo sutil */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-50" />
        
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-md shadow-blue-600/20 shrink-0">
              {cliente.nombre.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{cliente.nombre}</h1>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-100 text-purple-700">
                  {cliente.estado}
                </span>
              </div>
              <p className="text-sm text-zinc-500 font-medium">{cliente.cargo} en <span className="text-zinc-800">{cliente.empresa}</span></p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-blue-600/20">
              <Plus className="h-4 w-4" />
              Nueva Tarea
            </button>
          </div>
        </div>
      </div>

      {/* MÉTRICAS RÁPIDAS (LTV) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Wallet className="h-6 w-6" /></div>
          <div>
            <p className="text-sm text-zinc-500 font-medium">Valor del Cliente (LTV)</p>
            <p className="text-2xl font-bold text-zinc-900">{cliente.ltv}</p>
          </div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><CheckCircle2 className="h-6 w-6" /></div>
          <div>
            <p className="text-sm text-zinc-500 font-medium">Negocios / Compras</p>
            <p className="text-2xl font-bold text-zinc-900">{cliente.pedidosTotales} <span className="text-sm font-normal text-zinc-400">cierres</span></p>
          </div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><CalendarDays className="h-6 w-6" /></div>
          <div>
            <p className="text-sm text-zinc-500 font-medium">Última Actividad</p>
            <p className="text-xl font-bold text-zinc-900">{cliente.ultimaCompra}</p>
          </div>
        </div>
      </div>

      {/* SISTEMA DE PESTAÑAS (TABS) */}
      <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="flex overflow-x-auto border-b border-zinc-100 hide-scrollbar">
          {[
            { id: 'resumen', label: 'Resumen', icon: FileText },
            { id: 'oportunidades', label: 'Oportunidades (2)', icon: Briefcase },
            { id: 'tareas', label: 'Tareas (1)', icon: ListTodo },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
                  isActive 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/30' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* CONTENIDO DE LA PESTAÑA: RESUMEN */}
        {activeTab === 'resumen' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Columna Izquierda: Datos */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Datos de Contacto</h3>
                <button className="text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 className="h-4 w-4" /></button>
              </div>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Correo Electrónico</p>
                    <p className="text-sm font-medium text-zinc-900">{cliente.email}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Teléfono Directo</p>
                    <p className="text-sm font-medium text-zinc-900">{cliente.telefono}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Empresa / Razón Social</p>
                    <p className="text-sm font-medium text-zinc-900">{cliente.empresa}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Ubicación</p>
                    <p className="text-sm font-medium text-zinc-900">{cliente.ciudad}</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Columna Derecha: Notas Rápidas */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">Notas Internas</h3>
              <div className="bg-yellow-50/50 border border-yellow-200/60 rounded-2xl p-4 text-sm text-yellow-900/80 leading-relaxed shadow-inner">
                <p>⚠️ <strong>Atención:</strong> Cliente muy exigente con los tiempos de entrega. Siempre contactar al número directo de celular, no suele leer los correos con rapidez.</p>
                <p className="mt-2 text-xs text-yellow-700/60 font-medium">— Nota dejada por Wilmer el 10 Jun</p>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO DE LA PESTAÑA: OPORTUNIDADES (Mockup) */}
        {activeTab === 'oportunidades' && (
          <div className="p-6">
            <div className="border border-zinc-200 rounded-xl p-4 flex items-center justify-between hover:border-blue-300 transition-colors cursor-pointer group">
              <div>
                <p className="font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">Cotización Proyecto Marea</p>
                <p className="text-sm text-zinc-500 mt-1">Etapa: <span className="font-medium text-blue-600">En Negociación</span> • Creado hace 2 días</p>
              </div>
              <p className="text-lg font-bold text-zinc-900">$1,200,000</p>
            </div>
          </div>
        )}

        {/* CONTENIDO DE LA PESTAÑA: TAREAS (Mockup) */}
        {activeTab === 'tareas' && (
          <div className="p-6">
            <div className="flex gap-3 items-start">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-600" />
              <div>
                <p className="font-medium text-zinc-900">Llamar para confirmar recepción de la propuesta</p>
                <p className="text-sm text-rose-500 font-medium mt-0.5">Vence hoy a las 5:00 PM</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}