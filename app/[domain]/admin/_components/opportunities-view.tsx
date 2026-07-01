'use client'

import { useState, useTransition, useEffect } from "react"
import { Plus, MoreHorizontal, Building2, X, Loader2, CheckCircle2 } from "lucide-react"
import { Deal, Contact, DealStage } from "@prisma/client"
import { createDeal, updateDealStage } from "../actions/deals"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"

type DealWithContact = Deal & { contact: Contact }

interface OpportunitiesViewProps {
  initialDeals: DealWithContact[] | any[];
  contacts: Contact[] | any[];
  tenantId: string;
  domain: string;
}

export function OpportunitiesView({ initialDeals, contacts, tenantId, domain }: OpportunitiesViewProps) {
  // Estado local para los deals (permite el Drag&Drop instantáneo)
  const safeDeals = Array.isArray(initialDeals) ? initialDeals : []
  const [deals, setDeals] = useState<DealWithContact[]>(safeDeals)
  
  // Evitar errores de hidratación con @hello-pangea/dnd
  const [isMounted, setIsMounted] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Sincronizar estado local si cambian los props desde el servidor
  useEffect(() => {
    setDeals(safeDeals)
  }, [initialDeals])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMsg])

  const stages = [
    { id: 'PROSPECTING', title: 'Nuevos Leads', color: 'border-amber-200 bg-amber-50 text-amber-800' },
    { id: 'PROPOSAL', title: 'Propuesta Enviada', color: 'border-blue-200 bg-blue-50 text-blue-800' },
    { id: 'NEGOTIATION', title: 'En Negociación', color: 'border-purple-200 bg-purple-50 text-purple-800' },
    { id: 'WON', title: 'Ganado', color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await createDeal(formData, tenantId, domain)
      if (result.success) {
        setIsModalOpen(false)
        setSuccessMsg("¡Oportunidad guardada correctamente!")
      } else {
        setError(result.error || "Ocurrió un error inesperado.")
      }
    })
  }

  // ==========================================
  // LÓGICA DE DRAG & DROP
  // ==========================================
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    // Si soltó fuera de una columna o en el mismo lugar exacto, no hacemos nada
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    const newStage = destination.droppableId as DealStage

    // 1. Actualización Optimista (UI Inmediata)
    const newDeals = Array.from(deals)
    const draggedDealIndex = newDeals.findIndex(d => d.id === draggableId)
    
    if (draggedDealIndex > -1) {
      // Clonamos el trato y le cambiamos la etapa
      newDeals[draggedDealIndex] = { ...newDeals[draggedDealIndex], stage: newStage }
      setDeals(newDeals) // La UI se actualiza al instante
      
      // 2. Ejecutar la acción en segundo plano para la BD
      startTransition(async () => {
        const response = await updateDealStage(draggableId, newStage, domain)
        if (!response.success) {
          // Si falla, revertimos al estado original (props)
          setDeals(safeDeals)
          setSuccessMsg(null)
          alert("Error al mover la oportunidad. Intenta de nuevo.")
        }
      })
    }
  }

  // Prevenir renderizado hasta que el cliente monte (Regla de oro con dnd)
  if (!isMounted) return null

  return (
    <div className="relative p-4 sm:p-6 w-full h-[calc(100vh-4rem)] flex flex-col space-y-4 sm:space-y-6">
      
      {successMsg && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <CheckCircle2 className="h-5 w-5" />
          <p className="text-sm font-semibold">{successMsg}</p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Pipeline de Ventas</h1>
          <p className="text-sm text-zinc-500 mt-1 sm:mt-0">Arrastra las oportunidades para actualizarlas.</p>
        </div>
        <button 
          onClick={() => { setError(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors shadow-sm w-full sm:w-fit"
        >
          <Plus className="h-4 w-4" />
          Nueva Oportunidad
        </button>
      </div>

      {/* TABLERO KANBAN DRAG & DROP */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex gap-4 sm:gap-6 h-full min-w-max">
            {stages.map((stage) => {
              const stageDeals = deals.filter(d => d.stage === stage.id)
              
              return (
                <div key={stage.id} className="w-[280px] sm:w-[320px] flex flex-col h-full bg-zinc-50/80 rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                  
                  {/* Cabecera de Columna */}
                  <div className="p-3 sm:p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
                    <div className={`px-3 py-1 rounded-full border text-xs font-bold tracking-wide uppercase ${stage.color}`}>
                      {stage.title}
                    </div>
                    <span className="text-sm font-semibold text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded-md">
                      {stageDeals.length}
                    </span>
                  </div>

                  {/* Zona donde se sueltan las tarjetas */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`p-3 flex-1 overflow-y-auto space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-zinc-100/80' : ''}`}
                      >
                        {stageDeals.map((deal, index) => (
                          <Draggable key={deal.id} draggableId={deal.id} index={index}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white p-4 rounded-xl border shadow-sm transition-all group select-none
                                  ${snapshot.isDragging ? 'border-blue-400 shadow-xl scale-105 rotate-2' : 'border-zinc-200 hover:border-blue-300 hover:shadow-md'}
                                `}
                                style={{ ...provided.draggableProps.style }}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-semibold text-zinc-900 text-sm leading-tight pr-4">
                                    {deal.title}
                                  </h3>
                                  <button className="text-zinc-400 hover:text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </button>
                                </div>
                                
                                <div className="space-y-3 mt-3">
                                  <div className="flex items-center gap-2 text-xs text-zinc-600 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                                    <Building2 className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                                    <span className="truncate font-medium">{deal.contact?.company || `${deal.contact?.firstName} ${deal.contact?.lastName || ''}`}</span>
                                  </div>
                                  
                                  <div className="flex items-center justify-between pt-1">
                                    <div className="text-sm font-bold text-emerald-600">
                                      {formatCurrency(deal.value)}
                                    </div>
                                    <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                                      ID: {deal.id.slice(-4)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </div>
      </DragDropContext>

      {/* MODAL CREAR OPORTUNIDAD (Permanece igual) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => { if(!isPending) setIsModalOpen(false) }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[100dvh] sm:max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 sm:p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50 rounded-t-2xl flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Nueva Oportunidad</h2>
              </div>
              <button disabled={isPending} onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">{error}</div>}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase">Nombre del Proyecto / Trato *</label>
                <input required disabled={isPending} type="text" name="title" className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-zinc-50/50" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 uppercase">Valor Estimado (COP)</label>
                  <input disabled={isPending} type="number" name="value" defaultValue={0} className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-zinc-50/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 uppercase">Etapa Inicial</label>
                  <select disabled={isPending} name="stage" className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-zinc-50/50">
                    <option value="PROSPECTING">Nuevos Leads</option>
                    <option value="PROPOSAL">Propuesta Enviada</option>
                    <option value="NEGOTIATION">En Negociación</option>
                    <option value="WON">Ganado</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase">Contacto / Empresa Asociada *</label>
                <select required disabled={isPending || contacts.length === 0} name="contactId" className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-zinc-50/50">
                  <option value="">Selecciona un contacto...</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.company ? `${c.company} (${c.firstName})` : `${c.firstName} ${c.lastName || ''}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-6 mt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-2">
                <button type="button" disabled={isPending} onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending || contacts.length === 0} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm disabled:opacity-50">
                  {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}