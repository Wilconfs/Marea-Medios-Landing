'use client'

import { useState } from 'react'
import { uploadVideoToCloudinary } from '../actions/upload'
import { createContentPost } from '../actions/content' // <--- Nueva importación
import { Film, Loader2, CheckSquare, Square } from 'lucide-react'

export default function ContenidoPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [platforms, setPlatforms] = useState<string[]>([])

  // Simulación del tenantId (luego vendrá de tu sesión/auth o de la URL [domain])
  const tenantId = "cm-marea-medios-id-ejemplo" 

  const togglePlatform = (plat: string) => {
    setPlatforms(prev => 
      prev.includes(plat) ? prev.filter(p => p !== plat) : [...prev, plat]
    )
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file || !title || platforms.length === 0) {
      alert('Por favor completa el título, video y selecciona al menos una red social.')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      // Paso 1: Subir video a Cloudinary temporalmente
      const videoUrl = await uploadVideoToCloudinary(formData) as string
      
      // Paso 2: Guardar el registro completo en Prisma
      const response = await createContentPost({
        title,
        description,
        videoUrl,
        platform: platforms.join(','), // Convertimos ["INSTAGRAM", "TIKTOK"] a "INSTAGRAM,TIKTOK"
        tenantId
      })

      if (response.success) {
        alert('¡Post creado con éxito en tu base de datos!')
        // Limpiamos el formulario
        setTitle('')
        setDescription('')
        setFile(null)
        setPlatforms([])
      } else {
        alert('Error al guardar en la base de datos')
      }
    } catch (error) {
      console.error('Error completo en el flujo:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Programador de Contenido Multimedia</h1>
          <p className="text-sm text-zinc-500">Sube tus videos y prepáralos para tus campañas en Meta y TikTok.</p>
        </div>

        <form onSubmit={handleUpload} className="space-y-5">
          {/* Título */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-zinc-700">Título del Post / Copy Principal</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: ¡Gran lanzamiento de nuestra nueva colección! 🚀"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-zinc-700">Descripción / Notas internas (Opcional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Escribe detalles adicionales sobre este contenido..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Selector de Redes de forma elegante */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">¿Dónde quieres publicar?</label>
            <div className="flex gap-4">
              {['INSTAGRAM', 'TIKTOK', 'FACEBOOK'].map((plat) => {
                const isSelected = platforms.includes(plat)
                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => togglePlatform(plat)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium transition-colors ${isSelected ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-zinc-50 border-zinc-200 text-zinc-600'}`}
                  >
                    {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                    {plat}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Archivo de Video */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-zinc-700">Archivo Imagen / Video</label>
            <input 
              type="file" 
              accept="video/*" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
            />
          </div>

          {/* Botón */}
          <button 
            disabled={isUploading || !file || !title || platforms.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl disabled:opacity-50 transition-opacity text-sm shadow-sm"
          >
            {isUploading ? <Loader2 className="animate-spin h-4 w-4" /> : <Film className="h-4 w-4" />}
            {isUploading ? 'Procesando y Subiendo...' : 'Crear Post y Subir Video'}
          </button>
        </form>
      </div>
    </div>
  )
}