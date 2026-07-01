'use client'

import { Search, Plus, MoreHorizontal, Shield, ShieldAlert, User as UserIcon, Mail } from "lucide-react"

export function TeamView() {
  // ==========================================
  // DATOS DE PRUEBA (MOCK DATA)
  // Basados en el enum Role de Prisma
  // ==========================================
  const team = [
    { id: '1', name: 'Wilmer', email: 'wilmer@mareamedios.com', role: 'SUPERADMIN', status: 'ACTIVE', initials: 'W' },
    { id: '2', name: 'Andrea Gómez', email: 'andrea@mareamedios.com', role: 'ADMIN', status: 'ACTIVE', initials: 'AG' },
    { id: '3', name: 'Camilo Pérez', email: 'camilo@mareamedios.com', role: 'AUXILIAR', status: 'ACTIVE', initials: 'CP' },
    { id: '4', name: 'Juliana Restrepo', email: 'juliana@mareamedios.com', role: 'AUXILIAR', status: 'INACTIVE', initials: 'JR' },
  ]

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200"><ShieldAlert className="h-3 w-3"/> Propietario</span>
      case 'ADMIN': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"><Shield className="h-3 w-3"/> Administrador</span>
      case 'AUXILIAR': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200"><UserIcon className="h-3 w-3"/> Auxiliar</span>
      default: return null
    }
  }

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Equipo de Trabajo</h1>
          <p className="text-sm text-zinc-500">Gestiona los accesos y roles de tu agencia Marea.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Invitar Miembro
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Usuario</th>
                <th className="px-6 py-4 font-semibold">Rol de Acceso</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-zinc-800 text-white flex items-center justify-center font-bold text-sm">
                      {member.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900">{member.name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                        <Mail className="h-3 w-3" /> {member.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(member.role)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${member.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {member.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
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