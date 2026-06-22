import { UserPlus, ShieldCheck, MoreHorizontal, Mail } from "lucide-react"

export default function EquipoPage() {
  const equipo = [
    { id: 1, nombre: "Wilmer", email: "wilmer@marea.com", rol: "Super Admin", estado: "Activo" },
    { id: 2, nombre: "Ana García", email: "ana@marea.com", rol: "Administrador", estado: "Activo" },
    { id: 3, nombre: "Carlos Ruiz", email: "carlos@marea.com", rol: "Auxiliar", estado: "Invitación enviada" },
  ]

  return (
    <div className="p-6 w-full h-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Equipo de Trabajo</h1>
          <p className="text-sm text-zinc-500">Gestiona los accesos y roles de tu organización.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          <UserPlus className="h-4 w-4" />
          Invitar miembro
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-zinc-600">Miembro</th>
              <th className="px-6 py-4 font-semibold text-zinc-600">Rol</th>
              <th className="px-6 py-4 font-semibold text-zinc-600">Estado</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {equipo.map((miembro) => (
              <tr key={miembro.id} className="hover:bg-zinc-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-600 text-xs">
                      {miembro.nombre[0]}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900">{miembro.nombre}</p>
                      <p className="text-xs text-zinc-500">{miembro.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-600">{miembro.rol}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${miembro.estado === 'Activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {miembro.estado === 'Activo' && <ShieldCheck className="h-3 w-3" />}
                    {miembro.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-zinc-400 hover:text-zinc-600">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}