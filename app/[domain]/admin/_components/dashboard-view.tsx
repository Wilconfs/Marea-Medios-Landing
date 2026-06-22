'use client'

import { Users, DollarSign, Target, ListTodo, TrendingUp, Clock } from "lucide-react"

export function DashboardView() {
  // Ajustamos el estado para que sea más flexible
  // Por ahora, simularemos que no hay carga para evitar el error de fetch
  const stats = {
    oportunidades: 12,
    valor: "$45.2M",
    tareas: 8,
    contactos: 156
  }

  return (
    <div className="p-6 w-full h-full space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Panel de Control</h1>
        <p className="text-zinc-500">Bienvenido, Wilmer. Resumen operativo de Marea.</p>
      </div>

      {/* METRICAS CLAVE (KPIs) - Reemplazamos KpiCard por divs nativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Oportunidades', value: stats.oportunidades, icon: Target, color: 'text-blue-600' },
          { label: 'Valor en Pipeline', value: stats.valor, icon: DollarSign, color: 'text-emerald-600' },
          { label: 'Tareas Pendientes', value: stats.tareas, icon: ListTodo, color: 'text-amber-600' },
          { label: 'Contactos', value: stats.contactos, icon: Users, color: 'text-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-zinc-500 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</h3>
              </div>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* SECCION CENTRAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico Placeholder */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Actividad del Pipeline</h3>
            <TrendingUp className="h-5 w-5 text-zinc-400" />
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-xl text-zinc-400">
            Gráfico de Proyección (Próximamente)
          </div>
        </div>

        {/* Agenda Inmediata */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Agenda Inmediata</h3>
          <div className="space-y-4">
            <div className="flex gap-3 items-center p-3 hover:bg-zinc-50 rounded-lg">
              <Clock className="h-4 w-4 text-zinc-400" />
              <div>
                <p className="text-sm font-semibold">Llamar a Carlos Mendoza</p>
                <p className="text-xs text-zinc-500">Hoy, 5:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}