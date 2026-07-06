'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, Eye, FileText, AlertTriangle, FolderTree } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { deleteBlogPost } from '../actions/blog-actions'

interface BlogPost {
  id: string
  title: string
  status: string
  createdAt: Date
  views: number
}

export function BlogView({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  
  // Estados para el Modal de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 1. Abre el modal
  const confirmDelete = (id: string) => {
    setPostToDelete(id)
    setDeleteModalOpen(true)
  }

  // 2. Ejecuta la eliminación
  const executeDelete = async () => {
    if (!postToDelete) return
    setIsDeleting(true)
    
    const res = await deleteBlogPost(postToDelete)
    
    if (res.success) {
      setPosts(posts.filter(p => p.id !== postToDelete))
      setDeleteModalOpen(false)
    } else {
      alert('Hubo un error al eliminar: ' + res.error)
    }
    setIsDeleting(false)
    setPostToDelete(null)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in">
      {/* Header y Buscador */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión del Blog</h1>
          <p className="text-sm text-gray-500">Crea, edita y administra los artículos de tu página principal.</p>
        </div>
        
        {/* 👇 BOTONES DE ACCIÓN (Modificados para incluir Categorías) */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/admin/blog/categorias">
            <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-2 h-10">
              <FolderTree className="h-4 w-4 text-gray-500" />
              Categorías
            </Button>
          </Link>
          <Link href="/admin/blog/nuevo">
            <Button className="bg-[#2563eb] hover:bg-blue-700 text-white flex items-center gap-2 h-10 px-4">
              <Plus className="h-4 w-4" /> Nuevo Artículo
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Buscar por título..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-full" />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Título del Artículo</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-center">Vistas</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPosts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No se encontraron artículos.</td></tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><FileText className="h-5 w-5" /></div>
                        <span className="font-medium text-gray-900 line-clamp-1">{post.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {post.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(post.createdAt)}</td>
                    <td className="px-6 py-4 text-center text-gray-500 font-medium">{post.views}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Enlace para Editar */}
                        <Link href={`/admin/blog/editar/${post.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-amber-600"><Edit className="h-4 w-4" /></Button>
                        </Link>
                        {/* Botón que abre el Modal */}
                        <Button variant="ghost" size="icon" onClick={() => confirmDelete(post.id)} className="h-8 w-8 text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN ELEGANTE */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Eliminar artículo</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">¿Estás seguro de que deseas eliminar este artículo de forma permanente? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting} className="text-gray-600">Cancelar</Button>
              <Button variant="destructive" onClick={executeDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}