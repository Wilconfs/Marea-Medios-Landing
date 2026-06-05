'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function Pagination({ currentPage, totalPages }: { currentPage: number, totalPages: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      <button 
        disabled={currentPage <= 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className="px-4 py-2 border rounded-lg disabled:opacity-50"
      >Anterior</button>
      
      <span className="font-bold">Página {currentPage} de {totalPages}</span>
      
      <button 
        disabled={currentPage >= totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className="px-4 py-2 border rounded-lg disabled:opacity-50"
      >Siguiente</button>
    </div>
  )
}