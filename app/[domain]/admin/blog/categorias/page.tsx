'use client'

import { useState, useEffect } from 'react'
import { getBlogCategories, createBlogCategory, deleteBlogCategory } from '../../actions/blog-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Trash2, FolderTree, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CategoriasPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(true)

  const loadCategories = async () => {
    setLoadingInitial(true)
    const res = await getBlogCategories()
    if (res.success && res.data) setCategories(res.data)
    setLoadingInitial(false)
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const res = await createBlogCategory(name)
    if (res.success) {
      setName('')
      await loadCategories() // Recargamos la lista
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta categoría? Si tiene artículos asociados, quedarán sin categoría.')) return
    await deleteBlogCategory(id)
    await loadCategories()
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 animate-in fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/blog" className="text-gray-400 hover:text-[#2563eb] transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderTree className="text-[#2563eb]" />
            Gestión de Categorías
          </h1>
          <p className="text-sm text-gray-500">Crea y organiza las categorías principales de tu blog.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-6 mb-8">
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-bold text-gray-700">Nueva Categoría</label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Inteligencia Artificial"
              className="h-11 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#2563eb]"
            />
          </div>
          <Button type="submit" disabled={loading} className="bg-[#2563eb] text-white hover:bg-blue-700 h-11 px-8 w-full sm:w-auto">
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Agregar Categoría'}
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 overflow-hidden">
        {loadingInitial ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                <Loader2 className="animate-spin mb-3 text-[#2563eb]" size={32} />
                <p>Cargando categorías...</p>
            </div>
        ) : categories.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No tienes categorías creadas aún. Usa el formulario de arriba para crear la primera.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <li key={cat.id} className="p-5 flex items-center justify-between hover:bg-blue-50/30 transition-colors group">
                <div>
                  <p className="font-bold text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Slug: <span className="text-gray-500 font-mono">/{cat.slug}</span></p>
                </div>
                <Button variant="ghost" onClick={() => handleDelete(cat.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={18} />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}