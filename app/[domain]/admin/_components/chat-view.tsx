'use client'

import { useState } from "react"
import { Search, Send, MoreVertical, Paperclip, Smile, Phone, Video, Info, Check, CheckCheck } from "lucide-react"

// Datos de prueba (Mocks)
const mockChats = [
  { id: 1, name: "Carlos Mendoza", lastMessage: "Perfecto, quedo pendiente de la propuesta...", time: "10:42 AM", unread: 2, online: true, initials: "CM", color: "bg-blue-100 text-blue-700" },
  { id: 2, name: "Ana Ramírez", lastMessage: "¡Gracias Wilmer! El diseño quedó increíble.", time: "Ayer", unread: 0, online: false, initials: "AR", color: "bg-emerald-100 text-emerald-700" },
  { id: 3, name: "Tech Solutions Inc.", lastMessage: "¿Podemos agendar una reunión para el viernes?", time: "Lunes", unread: 0, online: true, initials: "TS", color: "bg-purple-100 text-purple-700" },
  { id: 4, name: "Miguel Rojas", lastMessage: "Vale, lo reviso y te aviso.", time: "Lunes", unread: 0, online: false, initials: "MR", color: "bg-amber-100 text-amber-700" },
]

const mockMessages = [
  { id: 1, text: "Hola Wilmer, ¿cómo va el desarrollo del proyecto?", sender: "client", time: "10:30 AM", status: "read" },
  { id: 2, text: "¡Hola Carlos! Todo va excelente. Estamos terminando los últimos ajustes en el panel de administración.", sender: "me", time: "10:35 AM", status: "read" },
  { id: 3, text: "¿Crees que podamos revisarlo hoy en la tarde?", sender: "client", time: "10:38 AM", status: "read" },
  { id: 4, text: "Claro que sí. Te envío un enlace de Google Meet para las 4:00 PM. ¿Te parece bien?", sender: "me", time: "10:40 AM", status: "read" },
  { id: 5, text: "Perfecto, quedo pendiente de la propuesta...", sender: "client", time: "10:42 AM", status: "read" },
]

export function ChatView() {
  const [activeChat, setActiveChat] = useState<number | null>(1) // Por defecto abrimos el chat 1
  const [messageText, setMessageText] = useState("")

  const activeChatData = mockChats.find(c => c.id === activeChat)

  return (
    // EL CONTENEDOR AHORA TOMA EL 100% DEL ANCHO Y ALTO DEL PADRE
    <div className="h-full w-full flex bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      
      {/* ==========================================
          COLUMNA IZQUIERDA: LISTA DE CHATS
          ========================================== */}
      <div className="w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-zinc-200 flex flex-col bg-white">
        
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <h2 className="text-lg font-bold text-zinc-900">Mensajes</h2>
          <button className="text-zinc-500 hover:text-zinc-700 p-2 rounded-full hover:bg-zinc-100 transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3 border-b border-zinc-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Buscar o empezar un chat..." 
              className="w-full pl-9 pr-4 py-2 bg-zinc-100 border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {mockChats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`p-3 cursor-pointer flex gap-3 transition-colors border-b border-zinc-50 ${activeChat === chat.id ? 'bg-blue-50/50' : 'hover:bg-zinc-50'}`}
            >
              <div className="relative flex-shrink-0">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${chat.color}`}>
                  {chat.initials}
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-sm font-semibold text-zinc-900 truncate">{chat.name}</h3>
                  <span className={`text-xs ${chat.unread > 0 ? 'text-blue-600 font-semibold' : 'text-zinc-400'}`}>
                    {chat.time}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-sm truncate pr-2 ${chat.unread > 0 ? 'text-zinc-900 font-medium' : 'text-zinc-500'}`}>
                    {chat.lastMessage}
                  </p>
                  {chat.unread > 0 && (
                    <span className="h-5 w-5 bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full flex-shrink-0">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==========================================
          COLUMNA DERECHA: ÁREA DE CHAT
          ========================================== */}
      <div className="flex-1 flex flex-col bg-[#efeae2] relative hidden md:flex">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png")', backgroundRepeat: 'repeat' }}></div>

        {activeChatData ? (
          <>
            <div className="h-16 px-4 border-b border-zinc-200 bg-white flex justify-between items-center z-10 shadow-sm">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${activeChatData.color}`}>
                  {activeChatData.initials}
                </div>
                <div>
                  <h2 className="font-semibold text-zinc-900 text-sm">{activeChatData.name}</h2>
                  <p className="text-xs text-emerald-600 font-medium">{activeChatData.online ? 'En línea' : 'Últ. vez hoy 10:42 AM'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-zinc-500">
                <button className="hover:text-zinc-700 transition-colors"><Video className="h-5 w-5" /></button>
                <button className="hover:text-zinc-700 transition-colors"><Phone className="h-5 w-5" /></button>
                <div className="w-px h-6 bg-zinc-200 mx-1"></div>
                <button className="hover:text-zinc-700 transition-colors"><Search className="h-5 w-5" /></button>
                <button className="hover:text-zinc-700 transition-colors"><MoreVertical className="h-5 w-5" /></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 z-10 flex flex-col">
              <div className="flex justify-center mb-4">
                <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-medium text-zinc-500 shadow-sm">
                  HOY
                </span>
              </div>

              {mockMessages.map((msg) => {
                const isMe = msg.sender === 'me'
                return (
                  <div key={msg.id} className={`flex flex-col max-w-[75%] md:max-w-[65%] ${isMe ? 'self-end' : 'self-start'}`}>
                    <div 
                      className={`relative px-4 py-2 shadow-sm ${
                        isMe 
                          ? 'bg-[#d9fdd3] text-zinc-900 rounded-2xl rounded-tr-sm' 
                          : 'bg-white text-zinc-900 rounded-2xl rounded-tl-sm'
                      }`}
                    >
                      <p className="text-[14px] leading-relaxed break-words">{msg.text}</p>
                      
                      <div className={`flex items-center justify-end gap-1 mt-1 -mb-1 ${isMe ? 'text-emerald-700/70' : 'text-zinc-400'}`}>
                        <span className="text-[10px] font-medium">{msg.time}</span>
                        {isMe && (
                          <CheckCheck className={`h-3.5 w-3.5 ${msg.status === 'read' ? 'text-blue-500' : ''}`} />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-3 bg-zinc-100 flex items-end gap-2 z-10">
              <div className="flex gap-2 pb-2 pl-2">
                <button className="text-zinc-500 hover:text-zinc-700 transition-colors"><Smile className="h-6 w-6" /></button>
                <button className="text-zinc-500 hover:text-zinc-700 transition-colors"><Paperclip className="h-6 w-6" /></button>
              </div>
              <div className="flex-1 relative bg-white rounded-xl shadow-sm border border-transparent focus-within:border-zinc-300 transition-colors">
                <textarea 
                  rows={1}
                  placeholder="Escribe un mensaje..." 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full max-h-32 px-4 py-3 bg-transparent text-sm resize-none outline-none scrollbar-thin"
                />
              </div>
              <div className="pb-1 pr-1">
                {messageText.trim() ? (
                  <button className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 w-10 rounded-full flex items-center justify-center transition-colors shadow-sm">
                    <Send className="h-4 w-4 ml-1" />
                  </button>
                ) : (
                  <button className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 w-10 rounded-full flex items-center justify-center transition-colors shadow-sm">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50 p-8 text-center z-10">
            <div className="h-48 w-48 mb-6 bg-zinc-200 rounded-full flex items-center justify-center">
               <Phone className="h-16 w-16 text-zinc-400" />
            </div>
            <h2 className="text-2xl font-light text-zinc-700 mb-2">WhatsApp Web CRM</h2>
            <p className="text-zinc-500 max-w-sm text-sm">
              Selecciona un chat de la izquierda para ver la conversación. Próximamente integrado con la API oficial de Meta.
            </p>
          </div>
        )}
      </div>

    </div>
  )
}