'use client'

import { useState } from 'react'
import { 
  UploadCloud, Image as ImageIcon, Video, Calendar, 
  Send, Facebook, Instagram, Music2, Clock, CheckCircle2, AlertCircle
} from "lucide-react"

export function ContentSchedulerView() {
  // Estado simple para la UI (simulando selección de plataformas)
  const [platforms, setPlatforms] = useState({
    instagram: false,
    tiktok: false,
    facebook: false
  })

  // ==========================================
  // DATOS DE PRUEBA (MOCK DATA)
  // Basados en tu modelo ContentPost
  // ==========================================
  const recentPosts = [
    { id: 1, title: '¡Gran lanzamiento colección! 🚀', status: 'PUBLISHED', views: '12.5K', platform: 'Instagram', time: 'Hace 2 horas' },
    { id: 2, title: '3 Tips para tu SaaS', status: 'SCHEDULED', views: '-', platform: 'TikTok', time: 'Para: Mañana 10:00 AM' },
    { id: 3, title: 'Webinar Grabado Q3', status: 'ERROR', views: '-', platform: 'Facebook', time: 'Falló hace 1 día' },
  ]

  const togglePlatform = (key: keyof typeof platforms) => {
    setPlatforms(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Programador de Contenido</h1>
          <p className="text-sm text-zinc-500">Sube tus videos y prepáralos para tus campañas en Meta y TikTok.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: Formulario de Creación (Ocupa 2 espacios) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
          
          {/* Título / Copy */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-900">Título del Post / Copy Principal</label>
            <textarea 
              className="w-full p-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none bg-zinc-50/50"
              rows={3}
              placeholder="Ej: ¡Gran lanzamiento de nuestra nueva colección! 🚀 Escribe aquí el copy..."
            />
          </div>

          {/* Notas Internas */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-900">Descripción / Notas internas (Opcional)</label>
            <input 
              type="text"
              className="w-full p-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-zinc-50/50"
              placeholder="Escribe detalles adicionales solo visibles para el equipo..."
            />
          </div>

          {/* Selección de Plataformas */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-zinc-900">¿Dónde quieres publicar?</label>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => togglePlatform('instagram')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all ${platforms.instagram ? 'bg-pink-50 border-pink-200 text-pink-700' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
              >
                <Instagram className="h-4 w-4" /> Instagram
              </button>
              <button 
                onClick={() => togglePlatform('tiktok')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all ${platforms.tiktok ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
              >
                <Music2 className="h-4 w-4" /> TikTok
              </button>
              <button 
                onClick={() => togglePlatform('facebook')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all ${platforms.facebook ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
              >
                <Facebook className="h-4 w-4" /> Facebook
              </button>
            </div>
          </div>

          {/* Subida de Archivo (Drag & Drop UI) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-900">Archivo Imagen / Video</label>
            <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-zinc-50 hover:border-blue-400 transition-all cursor-pointer group">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-zinc-900 mb-1">Haz clic para subir o arrastra tu archivo</p>
              <p className="text-xs text-zinc-500">MP4, MOV, JPG o PNG (Max. 50MB)</p>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 font-medium text-sm text-zinc-700 hover:bg-zinc-50 transition-all">
              <Calendar className="h-4 w-4" />
              Programar
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 font-medium text-sm text-white hover:bg-blue-700 transition-all shadow-sm">
              <Send className="h-4 w-4" />
              Publicar Ahora
            </button>
          </div>
          
        </div>

        {/* COLUMNA DERECHA: Historial / Estado de Publicaciones */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col h-full">
          <h3 className="font-bold text-zinc-900 mb-4">Estado de Publicaciones</h3>
          
          <div className="flex-1 space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="p-3 border border-zinc-100 rounded-xl bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-semibold text-zinc-900 line-clamp-1 pr-2">{post.title}</p>
                  {post.status === 'PUBLISHED' && <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
                  {post.status === 'SCHEDULED' && <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                  {post.status === 'ERROR' && <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />}
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase
                    ${post.platform === 'Instagram' ? 'bg-pink-100 text-pink-700' : 
                      post.platform === 'TikTok' ? 'bg-zinc-200 text-zinc-800' : 
                      'bg-blue-100 text-blue-700'}
                  `}>
                    {post.platform}
                  </span>
                  
                  <div className="text-right">
                    <p className="text-[11px] text-zinc-500">{post.time}</p>
                    {post.status === 'PUBLISHED' && (
                      <p className="text-xs font-bold text-zinc-900 mt-0.5">{post.views} vistas</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            Ver todo el historial
          </button>
        </div>

      </div>
    </div>
  )
}