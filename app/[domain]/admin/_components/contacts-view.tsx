'use client'

import { useState, useTransition, useEffect } from "react"
import { Search, Filter, Plus, MoreHorizontal, Mail, Phone, Building2, X, Loader2, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react"
import { Contact } from "@prisma/client"
import { createContact } from "../actions/contacts"

interface ContactsViewProps {
  initialContacts: Contact[] | any[]; 
  tenantId: string;
  domain: string;
}

export function ContactsView({ initialContacts, tenantId, domain }: ContactsViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  
  // Estado para controlar qué contacto está expandido en la vista móvil
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Limpiar mensaje de éxito después de 3 segundos
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMsg])

  const getInitials = (firstName: string, lastName?: string | null) => {
    const first = firstName ? firstName.charAt(0) : ''
    const last = lastName ? lastName.charAt(0) : ''
    return (first + last).toUpperCase() || '?'
  }

  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700',
      'bg-amber-100 text-amber-700', 'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700'
    ]
    const index = id.charCodeAt(id.length - 1) % colors.length
    return colors[index]
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      LEAD: 'bg-amber-100 text-amber-800 border-amber-200',
      QUALIFIED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      CUSTOMER: 'bg-blue-100 text-blue-800 border-blue-200',
      LOST: 'bg-zinc-100 text-zinc-600 border-zinc-200'
    }
    const labels: Record<string, string> = {
      LEAD: 'Prospecto', QUALIFIED: 'Calificado',
      CUSTOMER: 'Cliente', LOST: 'Perdido'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border whitespace-nowrap ${styles[status] || styles.LOST}`}>
        {labels[status] || status}
      </span>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await createContact(formData, tenantId, domain)
      if (result.success) {
        setIsModalOpen(false)
        setSuccessMsg("¡Contacto guardado correctamente!")
      } else {
        setError(result.error || "Ocurrió un error inesperado.")
      }
    })
  }

  return (
    <div className="relative p-4 sm:p-6 w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 min-h-[calc(100vh-4rem)]">
      
      {/* ALERTA DE ÉXITO FLOTANTE */}
      {successMsg && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <CheckCircle2 className="h-5 w-5" />
          <p className="text-sm font-semibold">{successMsg}</p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Directorio de Contactos</h1>
          <p className="text-sm text-zinc-500 mt-1 sm:mt-0">Gestiona tus clientes y prospectos.</p>
        </div>
        <button 
          onClick={() => { setError(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors shadow-sm w-full sm:w-fit"
        >
          <Plus className="h-4 w-4" />
          Nuevo Contacto
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 sm:py-2 border border-zinc-200 rounded-lg bg-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
            placeholder="Buscar por nombre, correo o empresa..."
          />
        </div>
        <button className="flex items-center justify-center gap-2 bg-white border border-zinc-200 px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm w-full sm:w-auto">
          <Filter className="h-4 w-4 text-zinc-500" />
          Filtros
        </button>
      </div>

      {/* ==========================================
          VISTA RESPONSIVE (MÓVIL): ACORDEÓN
          ========================================== */}
      <div className="block md:hidden space-y-3 mt-4">
        {initialContacts.length === 0 && (
          <div className="p-8 text-center text-zinc-500 font-medium bg-zinc-50 rounded-2xl border border-zinc-200">
            No hay contactos registrados.
          </div>
        )}
        
        {initialContacts.map((contact) => (
          <div key={contact.id} className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm transition-all">
            {/* Cabecera del Acordeón (Siempre visible) */}
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-50 active:bg-zinc-100 transition-colors"
              onClick={() => setExpandedId(expandedId === contact.id ? null : contact.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${getAvatarColor(contact.id)}`}>
                  {getInitials(contact.firstName, contact.lastName)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-900 text-sm truncate">{contact.firstName} {contact.lastName}</p>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                    <Building2 className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{contact.company || 'Sin empresa'}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
                {getStatusBadge(contact.status)}
                {expandedId === contact.id ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
              </div>
            </div>

            {/* Cuerpo del Acordeón (Datos adicionales) */}
            {expandedId === contact.id && (
              <div className="px-4 pb-4 pt-3 border-t border-zinc-100 bg-zinc-50/50 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Mail className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                    <span className="text-sm truncate">{contact.email || 'Sin correo'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Phone className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                    <span className="text-sm">{contact.phone || 'Sin teléfono'}</span>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                    Opciones
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ==========================================
          VISTA ESCRITORIO (PC): TABLA CLÁSICA
          ========================================== */}
      <div className="hidden md:block bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Nombre y Empresa</th>
                <th className="px-6 py-4 font-semibold">Datos de Contacto</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {initialContacts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 font-medium">
                    No hay contactos registrados. Haz clic en "Nuevo Contacto" para empezar.
                  </td>
                </tr>
              )}
              {initialContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${getAvatarColor(contact.id)}`}>
                        {getInitials(contact.firstName, contact.lastName)}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900">{contact.firstName} {contact.lastName}</p>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                          <Building2 className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{contact.company || 'Sin empresa'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-zinc-600">
                        <Mail className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                        <span className="text-sm truncate max-w-[200px]">{contact.email || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-600">
                        <Phone className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                        <span className="text-sm">{contact.phone || '-'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(contact.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
          MODAL CENTRAL RESPONSIVE: NUEVO CONTACTO
          ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => { if(!isPending) setIsModalOpen(false) }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[100dvh] sm:max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 sm:p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50 rounded-t-2xl flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Agregar Nuevo Contacto</h2>
                <p className="text-xs text-zinc-500">Ingresa los datos para guardarlos en tu CRM.</p>
              </div>
              <button 
                disabled={isPending}
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 uppercase">Nombre *</label>
                  <input required disabled={isPending} type="text" name="firstName" className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-zinc-50/50 disabled:opacity-60" placeholder="Ej: Carlos" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 uppercase">Apellido</label>
                  <input disabled={isPending} type="text" name="lastName" className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-zinc-50/50 disabled:opacity-60" placeholder="Ej: Mendoza" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase">Correo Electrónico</label>
                <input disabled={isPending} type="email" name="email" className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-zinc-50/50 disabled:opacity-60" placeholder="correo@empresa.com" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase">Teléfono / WhatsApp</label>
                <input disabled={isPending} type="text" name="phone" className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-zinc-50/50 disabled:opacity-60" placeholder="+57 300 123 4567" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase">Empresa / Organización</label>
                <input disabled={isPending} type="text" name="company" className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-zinc-50/50 disabled:opacity-60" placeholder="Ej: TechCorp S.A.S" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase">Estado Inicial del Lead</label>
                <select disabled={isPending} name="status" className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-zinc-50/50 disabled:opacity-60">
                  <option value="LEAD">Prospecto (Lead Inicial)</option>
                  <option value="QUALIFIED">Calificado (Interesado)</option>
                  <option value="CUSTOMER">Cliente Actual</option>
                  <option value="LOST">Oportunidad Perdida</option>
                </select>
              </div>

              <div className="pt-6 mt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-2">
                <button 
                  type="button"
                  disabled={isPending}
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:bg-blue-400"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Contacto"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}