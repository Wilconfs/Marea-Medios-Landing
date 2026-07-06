'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  // ⚡ FUNCIÓN DE COPIADO A PRUEBA DE BALAS (Funciona en local y producción)
  const handleCopy = async () => {
    const url = window.location.href
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url)
      } else {
        // Plan B: Para entornos locales sin HTTPS (como tienda1.local)
        const textArea = document.createElement("textarea")
        textArea.value = url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error al copiar:', err)
    }
  }

  // 📱 COMPARTIR EN REDES ABIERTAS
  const shareWhatsApp = () => {
    const text = encodeURIComponent(`¡Mira este artículo de Marea Medios!\n\n${title}\n\n${window.location.href}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const shareFacebook = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
  }

  // 🔒 COMPARTIR EN REDES CERRADAS (Copia el link y avisa al usuario)
  const shareClosedNetwork = (network: string) => {
    handleCopy()
    alert(`✅ Enlace copiado al portapapeles.\n\nAbre ${network} y pégalo en un mensaje o historia para compartirlo.`)
  }

  return (
    <div className="flex items-center gap-4 py-6 border-y border-white/10 my-8">
      <span className="text-white/50 text-xs font-bold uppercase tracking-widest font-opensans">
        Compartir artículo:
      </span>
      <div className="flex gap-3">
        
        {/* Botón WhatsApp */}
        <button 
          onClick={shareWhatsApp}
          className="w-10 h-10 rounded-full bg-[#161616] flex items-center justify-center text-white/50 hover:bg-[#25D366] hover:text-white hover:scale-110 transition-all duration-300"
          title="Compartir en WhatsApp"
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
        </button>
        
        {/* Botón Facebook */}
        <button 
          onClick={shareFacebook}
          className="w-10 h-10 rounded-full bg-[#161616] flex items-center justify-center text-white/50 hover:bg-[#1877F2] hover:text-white hover:scale-110 transition-all duration-300"
          title="Compartir en Facebook"
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>

        {/* Botón Instagram (Copia Link) */}
        <button 
          onClick={() => shareClosedNetwork('Instagram')}
          className="w-10 h-10 rounded-full bg-[#161616] flex items-center justify-center text-white/50 hover:bg-[#E1306C] hover:text-white hover:scale-110 transition-all duration-300"
          title="Compartir en Instagram"
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
        </button>

        {/* Botón TikTok (Copia Link) */}
        <button 
          onClick={() => shareClosedNetwork('TikTok')}
          className="w-10 h-10 rounded-full bg-[#161616] flex items-center justify-center text-white/50 hover:bg-[#ff0050] hover:text-white hover:scale-110 transition-all duration-300"
          title="Compartir en TikTok"
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        </button>

        {/* Botón Copiar Enlace */}
        <button 
          onClick={handleCopy}
          className="w-10 h-10 rounded-full bg-[#161616] flex items-center justify-center text-white/50 hover:bg-[#ffde59] hover:text-black hover:scale-110 transition-all duration-300"
          title="Copiar enlace"
        >
          {copied ? <Check size={18} /> : <Link2 size={18} />}
        </button>
      </div>
    </div>
  )
}