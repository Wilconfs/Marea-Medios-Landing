import { BlogForm } from '../_components/blog-form'

export const metadata = {
  title: 'Nuevo Artículo | Admin CRM Marea',
}

export default function NewBlogPage() {
  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full">
      <BlogForm />
    </div>
  )
}