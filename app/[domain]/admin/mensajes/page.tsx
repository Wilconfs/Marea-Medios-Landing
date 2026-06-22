import { Search, Send, User, MoreVertical } from "lucide-react"

export default function MensajesPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden max-w-7xl mx-auto border-l border-r border-zinc-200 bg-white">
      {/* Columna Izquierda: Lista de Chats */}
      <div className="w-1/3 border-r border-zinc-200 flex flex-col">
        <div className="p-4 border-b border-zinc-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Buscar chat..." 
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Item de Chat de Ejemplo */}
          <div className="p-4 border-b border-zinc-50 hover:bg-zinc-50 cursor-pointer flex gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">C</div>
            <div>
              <p className="text-sm font-bold text-zinc-900">Carlos Mendoza</p>
              <p className="text-xs text-zinc-500 truncate">Perfecto, quedo pendiente de la propuesta...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Chat Activo */}
      <div className="w-2/3 flex flex-col bg-zinc-50/50">
        <div className="p-4 border-b border-zinc-200 bg-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">C</div>
            <p className="font-bold text-sm text-zinc-900">Carlos Mendoza</p>
          </div>
          <MoreVertical className="h-5 w-5 text-zinc-400" />
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-sm border border-zinc-100 text-sm">
            Hola Wilmer, ¿cómo va el desarrollo del proyecto?
          </div>
          <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm max-w-sm self-end ml-auto text-sm">
            Hola Carlos, estamos terminando los últimos ajustes. ¡Te envío avances hoy!
          </div>
        </div>

        <div className="p-4 bg-white border-t border-zinc-200">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Escribe un mensaje..." 
              className="flex-1 px-4 py-2.5 bg-zinc-100 rounded-xl text-sm focus:outline-none"
            />
            <button className="bg-blue-600 text-white p-2.5 rounded-xl">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}