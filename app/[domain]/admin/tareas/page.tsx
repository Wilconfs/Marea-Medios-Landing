import { CheckCircle2, Circle, AlertCircle, Calendar } from "lucide-react"

export default function TareasPage() {
  const tareas = [
    { id: 1, titulo: "Llamar a Carlos para cierre", cliente: "Carlos Mendoza", fecha: "Hoy, 5:00 PM", prioridad: "alta" },
    { id: 2, titulo: "Enviar propuesta técnica", cliente: "Laura Gómez", fecha: "Mañana", prioridad: "media" },
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Mi Agenda de Seguimiento</h1>
      
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm">
        {tareas.map((tarea) => (
          <div key={tarea.id} className="flex items-center gap-4 p-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
            <button className="text-zinc-400 hover:text-blue-600">
              <Circle className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <p className="font-semibold text-zinc-900">{tarea.titulo}</p>
              <p className="text-xs text-zinc-500">{tarea.cliente} • <span className="text-rose-500 font-medium">{tarea.fecha}</span></p>
            </div>
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${tarea.prioridad === 'alta' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
              {tarea.prioridad}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}