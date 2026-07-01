'use client'

import { 
  Users, DollarSign, Target, ListTodo, 
  TrendingUp, Clock, ArrowUpRight, ArrowDownRight,
  Video, Calendar, CheckCircle2, MoreVertical
} from "lucide-react"

// 1. IMPORTAMOS RECHARTS
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts'

interface DashboardStats {
  contactsCount: number;
  dealsCount: number;
  tasksCount: number;
  pipelineValue: number;
  recentDeals: any[];
  pipelineByStage?: { stage: string, value: number }[];
  recentTasks: any[]; // Agregamos esto
}

export function DashboardView({ stats }: { stats?: DashboardStats }) {

  const data = stats || {
    contactsCount: 0, 
    dealsCount: 0, 
    tasksCount: 0, 
    pipelineValue: 0, 
    recentDeals: [], 
    pipelineByStage: [],
    recentTasks: [] // <--- ¡Esto es lo que pedía TypeScript!
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value)
  }

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(date)
  }

  const getStageBadge = (stage: string) => {
    switch(stage) {
      case 'WON': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Ganado</span>;
      case 'NEGOTIATION': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">En Negociación</span>;
      case 'PROPOSAL': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Propuesta</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Prospecto</span>;
    }
  }

  // ==========================================
  // CONFIGURACIÓN DEL GRÁFICO (RECHARTS)
  // ==========================================
  
  // Mapa de nombres y colores para el gráfico
  const stageConfig: Record<string, { name: string, color: string }> = {
    'PROSPECTING': { name: 'Leads', color: '#fbbf24' },      // Amber
    'PROPOSAL': { name: 'Propuestas', color: '#60a5fa' },    // Blue
    'NEGOTIATION': { name: 'Negociación', color: '#c084fc' }, // Purple
    'WON': { name: 'Ganado', color: '#34d399' }              // Emerald
  }

  // Preparamos la data asegurando que todas las etapas existan (incluso si tienen $0)
  const chartData = Object.keys(stageConfig).map(stageKey => {
    const found = data.pipelineByStage?.find(item => item.stage === stageKey)
    return {
      name: stageConfig[stageKey].name,
      value: found ? found.value : 0,
      color: stageConfig[stageKey].color
    }
  })

  // Tooltip personalizado para mostrar la moneda bonita al pasar el mouse
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-zinc-200 p-3 rounded-xl shadow-lg">
          <p className="text-xs font-bold text-zinc-500 mb-1">{label}</p>
          <p className="text-sm font-bold" style={{ color: payload[0].payload.color }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // ==========================================
  // KPIS y AGENDA
  // ==========================================
  const kpis = [
    { label: 'Oportunidades', value: data.dealsCount.toString(), trend: '+2', trendUp: true, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Valor en Pipeline', value: formatCurrency(data.pipelineValue), trend: '+15%', trendUp: true, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Tareas Pendientes', value: data.tasksCount.toString(), trend: '-3', trendUp: true, icon: ListTodo, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Contactos', value: data.contactsCount.toString(), trend: '+12', trendUp: true, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Panel de Control</h1>
          <p className="text-sm text-zinc-500">Bienvenido, Wilmer. Aquí está el resumen operativo de Marea.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-500 bg-white border border-zinc-200 px-4 py-2 rounded-lg shadow-sm capitalize">
            {new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(new Date())}
          </span>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            + Nueva Acción
          </button>
        </div>
      </div>

      {/* METRICAS CLAVE (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpis.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between hover:border-zinc-300 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-zinc-500 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</h3>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              {stat.trendUp ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.trend}
              </span>
              <span className="text-xs text-zinc-400">vs mes anterior</span>
            </div>
          </div>
        ))}
      </div>

      {/* SECCION CENTRAL: Gráficos y Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICO RECHARTS (Ocupa 2 columnas) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-zinc-900">Proyección de Ventas</h3>
              <p className="text-xs text-zinc-500">Ingresos estimados por etapa del pipeline</p>
            </div>
            <TrendingUp className="h-5 w-5 text-zinc-400" />
          </div>
          
          {/* Contenedor del Gráfico */}
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                {/* Cuadrícula sutil de fondo */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                
                {/* Eje X (Nombres de las etapas) */}
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#71717a', fontWeight: 500 }} 
                  dy={10} 
                />
                
                {/* Eje Y (Valores en Millones para no ocupar mucho espacio) */}
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#a1a1aa' }}
                  tickFormatter={(val) => val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : `$${val/1000}k`}
                />
                
                <Tooltip cursor={{ fill: '#f4f4f5', opacity: 0.4 }} content={<CustomTooltip />} />
                
                {/* Barras redondeadas en la parte superior con colores dinámicos */}
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60} minPointSize={5}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resumen de Contenido Digital */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-zinc-900">Rendimiento Contenido</h3>
              <p className="text-xs text-zinc-500">Métricas de Meta & TikTok</p>
            </div>
            <Video className="h-5 w-5 text-indigo-500" />
          </div>
          
          <div className="space-y-5 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg"><Calendar className="h-4 w-4 text-indigo-600"/></div>
                <span className="text-sm font-medium text-zinc-700">Programados esta semana</span>
              </div>
              <span className="text-sm font-bold text-zinc-900">14</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg"><CheckCircle2 className="h-4 w-4 text-emerald-600"/></div>
                <span className="text-sm font-medium text-zinc-700">Publicados con éxito</span>
              </div>
              <span className="text-sm font-bold text-zinc-900">28</span>
            </div>
            
            <div className="pt-4 border-t border-zinc-100">
              <p className="text-xs text-zinc-500 mb-2">Impacto Total (Mensual)</p>
              <div className="flex items-end gap-2">
                <h4 className="text-3xl font-bold text-zinc-900">245k</h4>
                <span className="text-sm text-emerald-500 font-medium mb-1">+12%</span>
              </div>
              <p className="text-xs text-zinc-400">Vistas acumuladas en todas las redes</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECCION INFERIOR: Tablas y Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Oportunidades Recientes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
            <h3 className="font-bold text-zinc-900">Oportunidades Recientes</h3>
            <button className="text-sm text-blue-600 font-medium hover:underline">Ver todas</button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Cliente / Proyecto</th>
                  <th className="px-6 py-3 font-medium">Monto</th>
                  <th className="px-6 py-3 font-medium">Etapa</th>
                  <th className="px-6 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.recentDeals.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                      Aún no hay oportunidades registradas.
                    </td>
                  </tr>
                )}
                {data.recentDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900">
                        {deal.contact?.company || `${deal.contact?.firstName || ''} ${deal.contact?.lastName || ''}`}
                      </p>
                      <p className="text-xs text-zinc-500">{deal.title}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      {formatCurrency(deal.value)}
                    </td>
                    <td className="px-6 py-4">
                      {getStageBadge(deal.stage)}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs capitalize">
                      {formatDate(deal.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Agenda Inmediata (Conectada a la BD) */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-zinc-900">Agenda Inmediata</h3>
            <button className="text-zinc-400 hover:text-zinc-600"><MoreVertical className="h-5 w-5" /></button>
          </div>
          <div className="space-y-1 flex-1">
            {data.recentTasks.length === 0 ? (
              <div className="text-sm text-zinc-500 text-center py-6 bg-zinc-50 rounded-xl border border-zinc-100">
                No tienes tareas pendientes. ¡Día libre!
              </div>
            ) : (
              data.recentTasks.map((task) => (
                <div key={task.id} className="flex gap-3 items-start p-3 hover:bg-zinc-50 rounded-xl transition-colors border border-transparent hover:border-zinc-100 cursor-pointer">
                  {/* Círculo de prioridad */}
                  <div className={`mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                    task.priority === 'HIGH' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 
                    task.priority === 'LOW' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-zinc-800 line-clamp-1">{task.title}</p>
                    <div className="flex items-center gap-1 mt-1 text-zinc-500">
                      <Clock className="h-3 w-3" />
                      <p className="text-xs font-medium">
                        {task.dueDate ? formatDate(task.dueDate) : 'Sin fecha'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="w-full mt-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
            Ver Calendario Completo
          </button>
        </div>

      </div>
    </div>
  )
}