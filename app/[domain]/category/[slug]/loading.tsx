import { ProductGridSkeleton } from '@/components/product-grid-skeleton'

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Esto evita que el título "salte" cuando aparezca el nombre real */}
      <div className="h-12 w-64 bg-slate-200 rounded-lg mb-8 animate-pulse" />
      
      <div className="flex gap-8">
        <div className="w-64 h-96 bg-slate-100 rounded-xl hidden md:block animate-pulse" />
        <div className="flex-1">
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  )
}