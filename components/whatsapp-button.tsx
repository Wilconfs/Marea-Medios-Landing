"use client"

import { useState } from "react"
import { MessageCircle, Send, X } from "lucide-react"

export const WhatsappButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  
  const phone = "573044444261" // Número sin el + para el link

  const handleSend = () => {
    if (!message.trim()) return
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
    setIsOpen(false)
    setMessage("")
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Mini Ventana de Chat */}
      {isOpen && (
        <div className="mb-4 w-[320px] overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-5 duration-300">
          {/* Cabecera */}
          <div className="bg-[#25D366] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 fill-current" />
              </div>
              <div>
                <p className="font-bold text-sm">Soporte Tienda Marea</p>
                <p className="text-[10px] opacity-90">En línea ahora</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-black/10 rounded-full p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cuerpo / Input */}
          <div className="p-4 bg-slate-50">
            <p className="text-xs text-slate-500 mb-3 bg-white p-3 rounded-lg shadow-sm">
              Hola 👋 ¿En qué podemos ayudarte hoy? Escribe tu mensaje aquí abajo.
            </p>
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="w-full rounded-xl border-slate-200 bg-white p-3 pr-10 text-sm focus:border-[#25D366] focus:ring-[#25D366] min-h-[100px] resize-none outline-none border"
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              />
              <button 
                onClick={handleSend}
                disabled={!message.trim()}
                className="absolute bottom-3 right-3 text-[#25D366] disabled:text-slate-300 hover:scale-110 transition-transform"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón Flotante Principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-110 active:scale-95 ${
          isOpen ? "bg-slate-800 rotate-90" : "bg-[#25D366]"
        }`}
      >
        {isOpen ? <X className="h-8 w-8" /> : <MessageCircle className="h-8 w-8 fill-current" />}
        
        {!isOpen && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 rounded-full bg-green-500"></span>
          </span>
        )}
      </button>
    </div>
  )
}