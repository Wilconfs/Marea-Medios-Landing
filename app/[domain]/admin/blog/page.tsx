import { BlogView } from '../_components/blog-view'
import { getBlogPosts } from '../actions/blog-actions'

export const metadata = {
  title: 'Blog | Admin CRM Marea',
}

// Volvemos dinámica la página para que siempre traiga los datos frescos
export const dynamic = 'force-dynamic'

export default async function AdminBlogPage() {
  // Llamamos a la base de datos antes de renderizar la página
  const res = await getBlogPosts()
  
  // Si la petición es exitosa, guardamos los posts; si no, mandamos un arreglo vacío
  const posts = res.success && res.data ? res.data : []

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full">
      {/* Pasamos los datos reales al componente visual */}
      <BlogView initialPosts={posts} />
    </div>
  )
}