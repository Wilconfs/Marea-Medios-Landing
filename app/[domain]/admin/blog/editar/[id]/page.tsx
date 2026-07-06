import { BlogForm } from '../../_components/blog-form'
import { getBlogPostById } from '../../../actions/blog-actions'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Editar Artículo | Admin CRM Marea',
}

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  
  // Buscamos los datos del artículo
  const res = await getBlogPostById(resolvedParams.id)

  // Si no existe o hay error, mostramos la página de error 404 genérica de Next
  if (!res.success || !res.data) {
    notFound()
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full">
      {/* Le pasamos los datos al formulario para que los llene automáticamente */}
      <BlogForm initialData={res.data} />
    </div>
  )
}