'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createBlogPost, updateBlogPost, getBlogCategories } from '../../actions/blog-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImagePlus, Loader2, Save, XCircle, Tags, FolderTree } from 'lucide-react'
import dynamic from 'next/dynamic'

// 🚀 IMPORTACIÓN AVANZADA: Cargamos el editor y el formateador moderno
// @ts-ignore
const ReactQuill = dynamic(async () => {
  const { default: RQ } = await import('react-quill')
  // @ts-ignore
  const { default: BlotFormatter } = await import('quill-blot-formatter')
  
  // ⚡ EL FIX: Creamos una regla personalizada para que Quill NO borre los estilos al recargar
  const BaseImageFormat = RQ.Quill.import('formats/image');
  class ImageFormat extends BaseImageFormat {
    static formats(domNode: any) {
      return {
        // @ts-ignore
        ...super.formats(domNode),
        style: domNode.getAttribute('style') 
      };
    }
    format(name: string, value: any) {
      if (name === 'style') {
        if (value) {
          this.domNode.setAttribute(name, value);
        } else {
          this.domNode.removeAttribute(name);
        }
      } else {
        super.format(name, value);
      }
    }
  }
  
  RQ.Quill.register(ImageFormat, true);

  if (!(RQ.Quill as any).imports['modules/blotFormatter']) {
    RQ.Quill.register('modules/blotFormatter', BlotFormatter)
  }
  
  return RQ
}, { 
  ssr: false,
  loading: () => <div className="h-[500px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-gray-200">Cargando editor visual...</div>
})

// @ts-ignore
import 'react-quill/dist/quill.snow.css'


// =========================================================================
// 🚀 INICIO DEL COMPONENTE
// =========================================================================
export function BlogForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '')
  const [status, setStatus] = useState(initialData?.status || 'DRAFT')

  // Taxonomía
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '')
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<string[]>(
    initialData?.tags ? initialData.tags.map((t: any) => t.name) : []
  )
  const [tagInput, setTagInput] = useState('')

  // Referencias y estados para carga local de imágenes
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      const res = await getBlogCategories();
      if (res.success && res.data) {
        setCategories(res.data)
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    if (!initialData && title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
    }
  }, [title, initialData])

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const newTag = tagInput.trim()
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag])
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  // ⚡ LÓGICA DE SUBIDA LOCAL (PARA PORTADA)
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setCoverImage(data.url);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Hubo un error subiendo la imagen de portada");
    } finally {
      setUploadingImage(false);
    }
  };

  // ⚡ CONFIGURACIÓN DE QUILL CON SUBIDA LOCAL
  const modules = useMemo(() => {
    if (typeof window === 'undefined') return {};
    return {
      toolbar: {
        container: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'align': [] }], 
          ['link', 'image'],
          ['clean']
        ],
        handlers: {
          image: function(this: any) {
            const quill = this.quill;
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = async () => {
              const file = input.files ? input.files[0] : null;
              if (file) {
                try {
                  const formData = new FormData();
                  formData.append('file', file);
                  
                  const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                  });
                  const data = await res.json();
                  
                  if (data.success) {
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', data.url);
                    quill.setSelection(range.index + 1);
                  } else {
                    alert("Error subiendo la imagen al editor");
                  }
                } catch (error) {
                  alert("Hubo un error de conexión al subir la imagen");
                }
              }
            };
          }
        }
      },
      blotFormatter: {}
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const payload = { title, slug, excerpt, content, coverImage, status, categoryId, tags }
    
    const res = initialData ? await updateBlogPost(initialData.id, payload) : await createBlogPost(payload)
    if (res.success) { router.push('/admin/blog'); router.refresh() }
    setLoading(false)
  }

  return (
    <div className="w-full animate-in fade-in duration-500 pb-12">

      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900 font-sans">
          {initialData ? 'Editar Artículo' : 'Nuevo Artículo del Blog'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Escribe, maqueta y clasifica contenido de valor para Marea Medios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: EL FORMULARIO PRINCIPAL */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6 font-sans">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Título del Artículo</label>
                <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: 5 Estrategias de Marketing..." className="h-11 border-gray-200 bg-gray-50/50 focus:bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Slug (URL)</label>
                <Input required value={slug} onChange={(e) => setSlug(e.target.value)} className="h-11 bg-gray-50 border-gray-200 text-gray-500" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">Resumen (Excerpt)</label>
              <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full p-3 border border-gray-200 bg-gray-50/50 focus:bg-white rounded-lg h-20 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Escribe un breve resumen que aparecerá en las tarjetas de SEO..." />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700">Imagen de Portada</label>
              
              {/* Input oculto para cargar archivos */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleCoverUpload} 
                accept="image/*" 
                className="hidden" 
              />
              
              <div 
                onClick={() => !uploadingImage && fileInputRef.current?.click()}
                className={`w-full h-40 border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden relative ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {uploadingImage ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-blue-500 mb-2" size={24} />
                    <span className="text-sm font-medium text-gray-600">Subiendo imagen...</span>
                  </div>
                ) : coverImage ? (
                  <img src={coverImage} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2 group-hover:bg-blue-100 transition-colors">
                      <ImagePlus className="text-blue-500" size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Haz clic para subir desde tu PC</span>
                    <span className="text-xs text-gray-400 mt-1">Recomendado: 1200x630px</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-gray-700">Contenido Completo</label>
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-white marea-editor-container">
                <style>{`
                  .marea-editor-container .ql-toolbar { border: none !important; border-bottom: 1px solid #e5e7eb !important; background-color: #f9fafb; position: sticky; top: 0; z-index: 20; padding: 12px; }
                  .marea-editor-container .ql-container { border: none !important; height: 500px !important; }
                  .marea-editor-container .ql-editor { height: 100%; overflow-y: auto; font-family: 'Open Sans', sans-serif; font-size: 15px; padding: 20px; }
                  .marea-editor-container .ql-editor img {max-width: 100%; height: auto; }
                  .marea-editor-container img.ql-align-center { display: block; margin-left: auto; margin-right: auto; }
                  .marea-editor-container img.ql-align-right { display: block; margin-left: auto; margin-right: 0; }
                `}</style>
                <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={() => router.back()} className="border-gray-200 text-gray-600 hover:bg-gray-50">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-[#2563eb] text-white hover:bg-blue-700 px-6">
                {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                {initialData ? 'Actualizar Artículo' : 'Publicar Ahora'}
              </Button>
            </div>
          </form>
        </div>

        {/* COLUMNA DERECHA: PANELES LATERALES */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-5 text-sm flex items-center gap-2">
              <FolderTree size={18} className="text-blue-500"/> Clasificación
            </h3>
            
            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-gray-500">Categoría Principal</label>
              <select 
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)} 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Selecciona una categoría...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                Etiquetas (Tags)
              </label>
              <div className="relative">
                <Tags size={16} className="absolute left-3 top-3 text-gray-400" />
                <Input 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Escribe y presiona Enter..." 
                  className="pl-9 h-11 bg-gray-50 border-gray-200 text-sm" 
                />
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  {tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-gray-200 text-xs font-medium text-gray-700 shadow-sm">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <XCircle size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 text-sm">Estado de Publicación</h3>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
              <option value="DRAFT">Borrador (No visible)</option>
              <option value="PUBLISHED">Publicado (Público)</option>
            </select>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              Si lo dejas en borrador, podrás previsualizarlo internamente antes de publicarlo.
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}