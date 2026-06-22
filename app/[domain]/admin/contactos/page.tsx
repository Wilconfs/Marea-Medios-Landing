import { Search, Plus, Filter, MoreHorizontal, Mail, Phone } from "lucide-react"

export default function ContactosPage() {
  // Datos simulados (Mocks) solo para maquetar lo visual
  const contactos = [
    { id: 1, nombre: "Carlos Mendoza", empresa: "TechCorp", email: "carlos@techcorp.com", telefono: "+57 300 123 4567", estado: "Cliente", color: "bg-emerald-100 text-emerald-700" },
    { id: 2, nombre: "Laura Gómez", empresa: "Freelance", email: "laura.g@gmail.com", telefono: "+57 312 987 6543", estado: "Lead Caliente", color: "bg-orange-100 text-orange-700" },
    { id: 3, nombre: "Andrés Silva", empresa: "Myn Detalles", email: "andres@myn.com", telefono: "+57 315 555 7777", estado: "VIP", color: "bg-purple-100 text-purple-700" },
  ]

  return (
    <div className="p-6 w-full h-full space-y-6">
      {/* Header de la sección */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Directorio de Contactos</h1>
          <p className="text-sm text-zinc-500 mt-1">Gestiona tus clientes, prospectos y empresas en un solo lugar.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-blue-600/20">
          <Plus className="h-4 w-4" />
          Nuevo Contacto
        </button>
      </div>

      {/* Barra de herramientas (Búsqueda y Filtros) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, correo o empresa..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Filter className="h-4 w-4" />
          Filtros
        </button>
      </div>

      {/* Tabla de Datos */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Nombre y Empresa</th>
                <th className="px-6 py-4 font-semibold">Datos de Contacto</th>
                <th className="px-6 py-4 font-semibold">Etiqueta</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {contactos.map((contacto) => (
                <tr key={contacto.id} className="hover:bg-zinc-50/50 transition-colors group cursor-pointer">
                  {/* Columna Nombre */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {contacto.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">{contacto.nombre}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{contacto.empresa}</p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Columna Contacto */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-zinc-600">
                        <Mail className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="text-xs">{contacto.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-600">
                        <Phone className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="text-xs">{contacto.telefono}</span>
                      </div>
                    </div>
                  </td>

                  {/* Columna Etiqueta */}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${contacto.color}`}>
                      {contacto.estado}
                    </span>
                  </td>

                  {/* Columna Acciones */}
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}