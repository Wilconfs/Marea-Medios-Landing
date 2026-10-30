'use client'

import { useState, useEffect } from 'react'
import { X, Send, MessageCircle } from 'lucide-react'

export function WhatsAppWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', business: '', msg: ''
  })
  const [chatMsg, setChatMsg] = useState('Hola Marea Medios, estoy interesad@ en recibir más información sobre sus servicios de marketing y contenido digital.')

  const numeroAgenciaWhatsApp = "573024467328" 

  // Intercepta clics en cualquier botón de "Agendar" en toda la página
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("button, a")
      if (target) {
        const text = target.textContent?.toUpperCase() || ""
        if (
          text.includes("AGENDA") || text.includes("MENSAJE") ||
          text.includes("EMPEZAR AHORA") || text.includes("CONTACTANOS") ||
          text.includes("EL MÁS POPULAR") || text.includes("QUIERO EL PREMIUM")
        ) {
          // 👇 EXCEPCIÓN AGREGADA AQUÍ (submit-agenda)
          if (target.id === "widget-toggle" || target.id === "widget-send" || target.id === "close-modal" || target.id === "submit-agenda") return;
          
          e.preventDefault()
          e.stopPropagation()
          setIsModalOpen(true)
        }
      }
    }
    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [])

  const handleAgendaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const { name, email, phone, business, msg } = formData
    
    // 1. Alerta Nativa de Campos Obligatorios
    if (!name.trim() || !email.trim() || !phone.trim() || !business.trim()) {
      alert("⚠️ ALERTA: Faltan campos por diligenciar.\n\nPor favor, completa todos los campos marcados con asterisco (*) antes de continuar.")
      return 
    }
    
    // 2. Formateo y Envío si todo está correcto
    const mensajeFormateado = `🔥 *Contacto - MAREA MEDIOS* 🔥\n\n• *Nombre:* ${name}\n• *Correo:* ${email}\n• *WhatsApp:* ${phone}\n• *Negocio:* ${business}\n• *Detalles:* ${msg || 'Sin comentarios'}`
    
    window.open(`https://wa.me/${numeroAgenciaWhatsApp}?text=${encodeURIComponent(mensajeFormateado)}`, '_blank')
    
    // 3. Limpiamos y cerramos
    setIsModalOpen(false)
    setFormData({ name: '', email: '', phone: '', business: '', msg: '' })
  }

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMsg.trim()) return;
    const msjEstructurado = `⚡ *SOPORTE - MAREA MEDIOS* ⚡\n\n💬 *Mensaje:* ${chatMsg}\n\nEn breve recibirás respuesta de nosotros, ¡Gracias por escribirnos!.`
    window.open(`https://wa.me/${numeroAgenciaWhatsApp}?text=${encodeURIComponent(msjEstructurado)}`, '_blank')
    setIsChatOpen(false)
  }

  return (
    <>
      {/* ─── MODAL DE AGENDA (POP-UP PRINCIPAL) ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121212] border border-white/10 border-t-4 border-t-[#ffde59] w-full max-w-lg p-8 relative shadow-2xl animate-in slide-in-from-bottom-4">
            <button id="close-modal" onClick={() => setIsModalOpen(false)} className="absolute top-3 right-4 text-white/50 hover:text-[#ffde59] text-2xl transition-colors">
              <X size={24} />
            </button>
            
            <div className="mb-6">
              <h2 className="font-anton text-2xl text-white uppercase mb-1">AGENDA TU <span className="text-[#ffde59]">REUNIÓN ESTRATÉGICA</span></h2>
              <p className="text-white/50 text-sm font-opensans">Déjanos tus datos y la marea se encargará de mover tu marca.</p>
            </div>

            <form onSubmit={handleAgendaSubmit} className="space-y-4 font-opensans">
              <div>
                <label className="block text-white/50 text-[11px] uppercase font-bold mb-1">Nombre Completo *</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#2d2d2d] p-3 text-white focus:border-[#ffde59] outline-none" placeholder="Ej: Juan Pérez" />
              </div>
              <div>
                <label className="block text-white/50 text-[11px] uppercase font-bold mb-1">Correo Electrónico *</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#2d2d2d] p-3 text-white focus:border-[#ffde59] outline-none" placeholder="ejemplo@correo.com" />
              </div>
              <div>
                <label className="block text-white/50 text-[11px] uppercase font-bold mb-1">Teléfono / WhatsApp *</label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#2d2d2d] p-3 text-white focus:border-[#ffde59] outline-none" placeholder="Ej: 312 345 6789" />
              </div>
              <div>
                <label className="block text-white/50 text-[11px] uppercase font-bold mb-1">Nombre de tu Negocio *</label>
                <input required value={formData.business} onChange={e => setFormData({...formData, business: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#2d2d2d] p-3 text-white focus:border-[#ffde59] outline-none" placeholder="Ej: Marca o Empresa" />
              </div>
              <div>
                <label className="block text-white/50 text-[11px] uppercase font-bold mb-1">Cuéntanos sobre tu negocio</label>
                <textarea rows={3} value={formData.msg} onChange={e => setFormData({...formData, msg: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#2d2d2d] p-3 text-white focus:border-[#ffde59] outline-none resize-none" placeholder="¿Qué objetivos buscas alcanzar?" />
              </div>
              
              {/* 👇 ID AGREGADO AQUÍ */}
              <button id="submit-agenda" type="submit" className="w-full bg-[#ffde59] text-black font-black uppercase p-3.5 hover:bg-white transition-colors mt-2">
                ENVIAR A WHATSAPP Y AGENDAR →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── WIDGET FLOTANTE DE WHATSAPP (CHAT) ─── */}
      <div className="fixed bottom-6 right-6 z-[999999] flex flex-col items-end font-opensans">
        {isChatOpen && (
          <div className="w-[330px] bg-[#161616] border border-white/10 rounded-xl shadow-2xl mb-4 overflow-hidden animate-in slide-in-from-bottom-4">
            <div className="bg-[#1e1e1e] p-4 border-b border-white/10 flex justify-between items-center">
              <div>
                <h4 className="text-white font-bold text-sm m-0">Soporte Marea Medios</h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 bg-[#2ec4b6] rounded-full animate-pulse"></span>
                  <span className="text-white/50 text-[11px]">En línea</span>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white/50 hover:text-[#ffde59]"><X size={20} /></button>
            </div>
            <div className="p-4 bg-[#161616] flex flex-col gap-3">
              <form onSubmit={handleChatSubmit}>
                <textarea 
                  value={chatMsg} 
                  onChange={e => setChatMsg(e.target.value)}
                  className="w-full h-24 bg-[#1c1c1c] border border-white/10 rounded-lg p-3 text-white text-[13px] outline-none focus:border-[#25D366] resize-none transition-colors"
                />
                <div className="flex justify-end mt-2">
                  <button id="widget-send" type="submit" className="w-10 h-10 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-[#25D366]/20">
                    <Send size={16} className="ml-1" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <button 
          id="widget-toggle"
          onClick={() => setIsChatOpen(!isChatOpen)} 
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${isChatOpen ? 'bg-[#1e1e1e] text-[#25D366] border border-white/10' : 'bg-[#25D366] text-white hover:bg-[#20ba5a] hover:scale-105'}`}
        >
          {isChatOpen ? <X size={24} /> : <MessageCircle size={28} />}
        </button>
      </div>
    </>
  )
}