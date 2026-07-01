'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createTask, updateTaskStatus, deleteTask } from '@/app/[domain]/admin/actions/tareas'
import { 
  Plus, CheckCircle2, Circle, Calendar, 
  Trash2, Search, Filter, Clock, Loader2, AlertCircle, CheckSquare, Users
} from 'lucide-react'

interface Tarea {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: Date | string | null
  assignedTo?: { id: string, name: string | null } | null
}

interface TasksViewProps {
  initialTasks: Tarea[];
  teamMembers: { id: string, name: string | null }[]; // Recibimos el equipo
  tenantId: string;
  domain: string;
}

export function TasksView({ initialTasks, teamMembers, tenantId, domain }: TasksViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [tareas, setTareas] = useState<Tarea[]>(initialTasks)
  
  useEffect(() => {
    setTareas(initialTasks)
  }, [initialTasks])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null) 
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPriority, setNewPriority] = useState<string>('MEDIUM')
  const [newDueDate, setNewDueDate] = useState('')
  const [newAssignedTo, setNewAssignedTo] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // ==========================================
  // ACCIONES
  // ==========================================
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsSaving(true)
    
    const res = await createTask({
      title: newTitle,
      description: newDescription,
      priority: newPriority,
      dueDate: newDueDate,
      assignedToId: newAssignedTo || undefined,
      tenantId: tenantId
    })
    
    if (res.success) {
      startTransition(() => { router.refresh() })
      setIsModalOpen(false)
      setNewTitle('')
      setNewDescription('')
      setNewDueDate('')
      setNewAssignedTo('')
    } else {
      setErrorMessage(res.error || "Ocurrió un error inesperado")
    }
    setIsSaving(false)
  }

  const handleStatusChange = async (id: string, nuevoEstado: string) => {
    setTareas(tareas.map(t => t.id === id ? { ...t, status: nuevoEstado } : t))
    const res = await updateTaskStatus(id, nuevoEstado)
    if (res.success) {
      startTransition(() => { router.refresh() })
    } else {
      setTareas(initialTasks)
    }
  }

  const handleCheck = async (id: string, currentStatus: string) => {
    const nextStatus: Record<string, string> = {
      PENDING: 'IN_PROGRESS',
      IN_PROGRESS: 'COMPLETED',
      COMPLETED: 'PENDING'
    }
    const nuevoEstado = nextStatus[currentStatus] || 'PENDING'
    handleStatusChange(id, nuevoEstado)
  }

  const confirmDelete = async () => {
    if (!taskToDelete) return
    setIsDeleting(true)
    setTareas(tareas.filter(t => t.id !== taskToDelete))
    const res = await deleteTask(taskToDelete)
    if (res.success) {
      startTransition(() => { router.refresh() })
      setTaskToDelete(null)
    } else {
      setTareas(initialTasks)
    }
    setIsDeleting(false)
  }

  // ==========================================
  // RENDERIZADO Y MÉTRICAS
  // ==========================================
  const filteredTareas = tareas.filter(tarea => {
    const desc = tarea.description || ""
    const matchesSearch = tarea.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          desc.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || tarea.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Contadores independientes
  const countPending = tareas.filter(t => t.status === 'PENDING').length
  const countInProgress = tareas.filter(t => t.status === 'IN_PROGRESS').length
  const countCompleted = tareas.filter(t => t.status === 'COMPLETED').length

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      HIGH: 'text-red-700 bg-red-50', MEDIUM: 'text-amber-700 bg-amber-50', LOW: 'text-emerald-700 bg-emerald-50'
    }
    const labels: Record<string, string> = { HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' }
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-[11px] font-medium ${styles[priority] || styles.LOW}`}>
        {labels[priority] || priority}
      </span>
    )
  }

  return (
    <div className="p-4 sm:p-6 w-full max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Mis Tareas</h1>
          <p className="text-sm text-zinc-500">Vista tipo lista para máxima productividad.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Nueva Tarea
        </button>
      </div>

      {/* METRICAS SEPARADAS */}
      <div className="flex flex-wrap gap-3">
        {/* Total */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg shadow-sm text-sm">
          <Clock className="h-4 w-4 text-zinc-400" />
          <span className="font-medium text-zinc-700">{tareas.length}</span>
          <span className="text-zinc-500">Total</span>
        </div>
        
        {/* Pendientes */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg shadow-sm text-sm">
          <AlertCircle className="h-4 w-4 text-zinc-500" />
          <span className="font-medium text-zinc-700">{countPending}</span>
          <span className="text-zinc-500">Pendientes</span>
        </div>
        
        {/* En Progreso */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 rounded-lg shadow-sm text-sm">
          <Loader2 className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-blue-700">{countInProgress}</span>
          <span className="text-blue-600">En Progreso</span>
        </div>
        
        {/* Completadas */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-200 rounded-lg shadow-sm text-sm">
          <CheckSquare className="h-4 w-4 text-emerald-500" />
          <span className="font-medium text-emerald-700">{countCompleted}</span>
          <span className="text-emerald-600">Completadas</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-2 border-b border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-zinc-400" />
            <input type="text" placeholder="Buscar tareas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-1.5 bg-white border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-zinc-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm bg-white border border-zinc-200 rounded-md px-2 py-1.5 text-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-auto">
              <option value="ALL">Todas las tareas</option>
              <option value="PENDING">Pendientes</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="COMPLETED">Completadas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-zinc-200 text-zinc-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2 w-10 text-center font-medium"></th>
                <th className="px-4 py-2 font-medium">Nombre de la tarea</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2 font-medium">Asignado a</th>
                <th className="px-4 py-2 font-medium">Prioridad</th>
                <th className="px-4 py-2 font-medium">Vencimiento</th>
                <th className="px-4 py-2 w-16 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredTareas.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-zinc-500">No se encontraron tareas.</td></tr>
              ) : (
                filteredTareas.map((tarea) => {
                  const isCompleted = tarea.status === 'COMPLETED'
                  return (
                    <tr key={tarea.id} className={`group transition-colors ${isCompleted ? 'bg-zinc-50/50 hover:bg-zinc-50' : 'bg-white hover:bg-zinc-50'}`}>
                      <td className="px-4 py-3 text-center align-top pt-4">
                        <button 
                          onClick={() => handleCheck(tarea.id, tarea.status)} 
                          className="text-zinc-300 hover:text-emerald-500 transition-colors focus:outline-none flex items-center justify-center w-full"
                          title="Avanzar estado"
                        >
                          {tarea.status === 'COMPLETED' ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : tarea.status === 'IN_PROGRESS' ? (
                            <Clock className="h-5 w-5 text-blue-500" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 min-w-[200px]">
                        <div className="flex flex-col">
                          <span className={`font-medium text-sm ${isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>{tarea.title}</span>
                          {tarea.description && <span className="text-xs text-zinc-400 truncate max-w-[200px] mt-0.5">{tarea.description}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select value={tarea.status} onChange={(e) => handleStatusChange(tarea.id, e.target.value)} className={`text-xs font-semibold rounded-md px-2 py-1 outline-none cursor-pointer border hover:shadow-sm transition-all appearance-none pr-6 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M3%204.5l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_4px_center] ${tarea.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : tarea.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-zinc-100 text-zinc-700 border-zinc-200'}`}>
                          <option value="PENDING">Pendiente</option>
                          <option value="IN_PROGRESS">En Progreso</option>
                          <option value="COMPLETED">Completada</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-zinc-400" />
                          <span className={`text-xs ${isCompleted ? 'text-zinc-400' : 'text-zinc-600'}`}>{tarea.assignedTo?.name || 'Sin asignar'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getPriorityBadge(tarea.priority)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-zinc-500">
                          {tarea.dueDate ? (
                            <><Calendar className="h-3.5 w-3.5 text-zinc-400" /><span className={`text-xs ${isCompleted ? 'text-zinc-400' : ''}`}>{new Date(tarea.dueDate).toLocaleDateString()}</span></>
                          ) : <span className="text-xs text-zinc-400 italic">-</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setTaskToDelete(tarea.id)} className="p-1.5 text-zinc-400 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALES */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xl w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600"><div className="p-2 bg-red-50 rounded-full"><Trash2 className="h-5 w-5" /></div><h2 className="text-base font-bold text-zinc-900">¿Eliminar tarea?</h2></div>
            <p className="text-sm text-zinc-500">Esta acción no se puede deshacer.</p>
            <div className="flex items-center gap-2 pt-2">
              <button onClick={() => setTaskToDelete(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">Cancelar</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm disabled:bg-red-300">{isDeleting ? "Borrando..." : "Sí, eliminar"}</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-zinc-100 bg-zinc-50"><h2 className="text-base font-bold text-zinc-900">Crear Nueva Tarea</h2></div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Título de la tarea <span className="text-red-500">*</span></label>
                <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Descripción (Opcional)</label>
                <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Asignar a</label>
                <select value={newAssignedTo} onChange={(e) => setNewAssignedTo(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                  <option value="">Sin asignar</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Prioridad <span className="text-red-500">*</span></label>
                  <select required value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                    <option value="LOW">Baja</option><option value="MEDIUM">Media</option><option value="HIGH">Alta</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Fecha límite <span className="text-red-500">*</span></label>
                  <input type="date" required value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              {errorMessage && <div className="p-3 mb-4 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100 font-medium">{errorMessage}</div>}
              <div className="flex items-center justify-end gap-2 pt-4 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors" disabled={isSaving}>Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 flex items-center gap-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors shadow-sm">
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}