import { Plus, MoreHorizontal } from "lucide-react"

export default function OportunidadesPage() {
  const columnas = [
    { id: 'nuevo', nombre: 'Nuevos Leads', color: 'bg-zinc-100' },
    { id: 'negociacion', nombre: 'En Negociación', color: 'bg-blue-50' },
    { id: 'ganado', nombre: 'Ganado', color: 'bg-emerald-50' },
  ]

  return (
    <div className="p-6 w-full h-full space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Pipeline de Ventas</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nueva Oportunidad
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {columnas.map((col) => (
          <div key={col.id} className={`${col.color} p-4 rounded-2xl border border-zinc-200 min-h-[500px]`}>
            <h2 className="font-bold text-zinc-700 mb-4">{col.nombre}</h2>
            
            {/* Card de ejemplo (esto luego será un componente) */}
            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm cursor-grab hover:shadow-md transition-shadow">
              <p className="font-bold text-sm text-zinc-900">Proyecto Web Marea</p>
              <p className="text-xs text-zinc-500 mt-1">Carlos Mendoza</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm font-bold text-blue-600">$1,200,000</span>
                <MoreHorizontal className="h-4 w-4 text-zinc-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}