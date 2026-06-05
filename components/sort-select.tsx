'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function SortSelect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Obtenemos el valor actual de la URL
  const currentSort = searchParams.get('sort') || ''

  const handleSort = (value: string) => {
    // Creamos una copia de los parámetros actuales
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set('sort', value)
    } else {
      params.delete('sort')
    }
    
    // Navegamos manteniendo los otros filtros (como el rango de precio)
    router.push(`?${params.toString()}`)
  }

  return (
    <select 
      value={currentSort} // Fuerza al select a mostrar el valor de la URL
      onChange={(e) => handleSort(e.target.value)}
      className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
    >
      <option value="">Más recientes</option>
      <option value="price-asc">Menor precio</option>
      <option value="price-desc">Mayor precio</option>
      <option value="name-asc">A-Z</option>
    </select>
  )
}