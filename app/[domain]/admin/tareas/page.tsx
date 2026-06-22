'use client'

import { useState, useEffect } from 'react'
import { createTask, getTasks, updateTaskStatus, deleteTask } from '@/app/[domain]/admin/actions/tareas'
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  AlertCircle, 
  Trash2, 
  Search, 
  Filter,
  CheckSquare,
  Clock,
  Loader2
} from 'lucide-react'

// Interfaz adaptada a lo que devuelve Prisma
interface Tarea {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: Date | string | null
}

export default function TareasPage({ params }: { params: { domain: string } }) {
  const tenantId = params.domain; // <-- ¡Aquí capturas el valor real (ej: "tienda1")!
  //console.log("Tenant actual:", tenantId)
  // 1. Declaración de TODOS los estados al principio
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null) // ID de la tarea a borrar
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Estados para el formulario de nueva tarea
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPriority, setNewPriority] = useState<string>('MEDIUM')
  const [newDueDate, setNewDueDate] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const initiateDelete = (id: string) => {
      setTaskToDelete(id)
    }
        const confirmDelete = async () => {
    if (!taskToDelete) return
    
    setIsDeleting(true)
    const res = await deleteTask(taskToDelete)
    if (res.success) {
      await loadTareas()
      setTaskToDelete(null)
    }
    setIsDeleting(false)
  }

  // 2. Función para cargar tareas desde la BD
  const loadTareas = async () => {
    setLoading(true)
    const res = await getTasks(tenantId)
    if (res.success && res.tasks) {
      setTareas(res.tasks)
    }
    setLoading(false)
  }

  // Cargar al inicio
  useEffect(() => {
    if (tenantId) {
      loadTareas()
    }
  }, [tenantId])

  // 3. Funciones conectadas a la base de datos
const handleCreateTask = async (e: React.FormEvent) => {
  e.preventDefault()
  console.log("Enviando con TenantID:", tenantId); // <--- MIRA ESTO EN LA CONSOLA
  setErrorMessage(null) // Limpiar errores previos
  setIsSaving(true)
  
  const res = await createTask({
    title: newTitle,
    description: newDescription,
    priority: newPriority,
    dueDate: newDueDate,
    tenantId: tenantId
  })
  
  if (res.success) {
    await loadTareas()
    setIsModalOpen(false)
    setNewTitle('')
    setNewDescription('')
  } else {
    // En lugar de alert, guardamos el mensaje para mostrarlo en el UI
    setErrorMessage(res.error || "Ocurrió un error inesperado")
  }
  setIsSaving(false)
}

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus: Record<string, string> = {
      PENDING: 'IN_PROGRESS',
      IN_PROGRESS: 'COMPLETED',
      COMPLETED: 'PENDING'
    }
    const nuevoEstado = nextStatus[currentStatus] || 'PENDING'

    // Actualización optimista: Cambiamos la UI primero para que se sienta rápido
    setTareas(tareas.map(t => t.id === id ? { ...t, status: nuevoEstado } : t))

    // Confirmamos en la BD de fondo
    const res = await updateTaskStatus(id, nuevoEstado)
    if (!res.success) {
      // Si falla en BD, revertimos cargando la lista real de nuevo
      loadTareas()
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta tarea?")) return

    // Actualización optimista
    setTareas(tareas.filter(t => t.id !== id))

    // Ejecución en BD
    const res = await deleteTask(id)
    if (!res.success) {
      loadTareas()
    }
  }

  // 4. Lógica de filtrado
  const filteredTareas = tareas.filter(tarea => {
    const desc = tarea.description || ""
    const matchesSearch = tarea.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          desc.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || tarea.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const countPending = tareas.filter(t => t.status !== 'COMPLETED').length
  const countCompleted = tareas.filter(t => t.status === 'COMPLETED').length

  // Mostrar un indicador de carga inicial si es necesario
  if (loading && tareas.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-8xl mx-auto space-y-6">
      {/* Encabezado e Invocador de Modal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Gestor de Tareas</h1>
          <p className="text-sm text-zinc-500">Organiza y ejecuta el trabajo diario de la plataforma.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Nueva Tarea
        </button>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Clock className="h-5 w-5" /></div>
          <div>
            <p className="text-xs font-medium text-zinc-500">Total Asignadas</p>
            <p className="text-xl font-bold text-zinc-900">{tareas.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><AlertCircle className="h-5 w-5" /></div>
          <div>
            <p className="text-xs font-medium text-zinc-500">Pendientes / En Curso</p>
            <p className="text-xl font-bold text-zinc-900">{countPending}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckSquare className="h-5 w-5" /></div>
          <div>
            <p className="text-xs font-medium text-zinc-500">Completadas</p>
            <p className="text-xl font-bold text-zinc-900">{countCompleted}</p>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar tarea por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0">
          <Filter className="h-4 w-4 text-zinc-400 ml-2" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-transparent border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Todos los estados</option>
            <option value="PENDING">Pendientes</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="COMPLETED">Completadas</option>
          </select>
        </div>
      </div>

      {/* Lista de Tareas */}
      <div className="space-y-3">
        {filteredTareas.length === 0 ? (
          <div className="bg-zinc-50 border border-dashed border-zinc-200 text-center py-12 rounded-2xl text-zinc-500 text-sm">
            {tareas.length === 0 ? "Aún no tienes tareas creadas." : "No se encontraron tareas con los filtros actuales."}
          </div>
        ) : (
          filteredTareas.map((tarea) => {
            const isCompleted = tarea.status === 'COMPLETED'
            const isInProgress = tarea.status === 'IN_PROGRESS'

            return (
              <div 
                key={tarea.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border rounded-2xl shadow-sm transition-all gap-4 ${isCompleted ? 'border-zinc-100 opacity-70 bg-zinc-50/50' : 'border-zinc-200 hover:border-zinc-300'}`}
              >
                {/* Checkbox y Contenido */}
                <div className="flex items-start gap-3 flex-1">
                  <button 
                    onClick={() => handleToggleStatus(tarea.id, tarea.status)}
                    className="mt-0.5 text-zinc-400 hover:text-blue-600 transition-colors flex-shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : isInProgress ? (
                      <Clock className="h-5 w-5 text-amber-500 animate-pulse" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                  
                  <div className="space-y-1">
                    <h3 className={`text-sm font-semibold text-zinc-900 ${isCompleted ? 'line-through text-zinc-400' : ''}`}>
                      {tarea.title}
                    </h3>
                    {tarea.description && (
                      <p className={`text-xs ${isCompleted ? 'text-zinc-400' : 'text-zinc-500'} max-w-2xl`}>
                        {tarea.description}
                      </p>
                    )}
                    
                    {/* Badges de Información */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tarea.priority === 'HIGH' ? 'bg-red-50 text-red-700 border border-red-100' :
                        tarea.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-zinc-100 text-zinc-600'
                      }`}>
                        {tarea.priority === 'HIGH' ? 'ALTA' : tarea.priority === 'MEDIUM' ? 'MEDIA' : 'BAJA'}
                      </span>
                      {tarea.dueDate && (
                        <span className="flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded-full border border-zinc-100">
                          <Calendar className="h-3 w-3" /> 
                          {new Date(tarea.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        tarea.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                        tarea.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700' :
                        'bg-zinc-100 text-zinc-700'
                      }`}>
                        {tarea.status === 'PENDING' ? 'Pendiente' : tarea.status === 'IN_PROGRESS' ? 'En Progreso' : 'Completado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 flex-shrink-0">
                  <button 
                    onClick={() => initiateDelete(tarea.id)} // Cambiamos el evento
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {taskToDelete && (
  <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center gap-3 text-red-600">
        <div className="p-2 bg-red-50 rounded-full"><Trash2 className="h-5 w-5" /></div>
        <h2 className="text-base font-bold text-zinc-900">¿Eliminar tarea?</h2>
      </div>
      <p className="text-sm text-zinc-500">Esta acción no se puede deshacer. La tarea será borrada permanentemente del sistema.</p>
      
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={() => setTaskToDelete(null)}
          className="flex-1 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={confirmDelete}
          disabled={isDeleting}
          className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors shadow-sm disabled:bg-red-300"
        >
          {isDeleting ? "Borrando..." : "Sí, eliminar"}
        </button>
      </div>
    </div>
  </div>
)}

      {/* MODAL / FORMULARIO FLOTANTE PARA CREAR TAREA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-zinc-100">
              <h2 className="text-base font-bold text-zinc-900">Crear Nueva Tarea</h2>
              <p className="text-xs text-zinc-500">Asigna actividades internas en tu CRM.</p>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600">Título de la tarea</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Subir Reel de testimonios"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600">Descripción (Opcional)</label>
                <textarea
                  placeholder="Añade detalles específicos..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-600">Prioridad</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-600">Fecha límite</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

                 {errorMessage && (
                    <div className="p-3 mb-4 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
                      {errorMessage}
                    </div>
                  )}
              {/* Botones de acción del modal */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
                
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 rounded-xl transition-colors"
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 flex items-center gap-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors shadow-sm"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSaving ? "Guardando..." : "Guardar Tarea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}