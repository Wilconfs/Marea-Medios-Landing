export function ProductSkeleton() {
  return (
    <div className="animate-pulse flex flex-col h-full rounded-2xl overflow-hidden border border-slate-100 bg-white">
      {/* Silueta de la imagen */}
      <div className="aspect-square bg-slate-200 w-full" />
      
      {/* Silueta del texto */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="h-8 bg-slate-200 rounded w-full mt-2" />
      </div>
    </div>
  )
}