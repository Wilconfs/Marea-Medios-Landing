'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function FilterSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [min, setMin] = useState(searchParams.get('minPrice') || '')
  const [max, setMax] = useState(searchParams.get('maxPrice') || '')

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (min) params.set('minPrice', min)
    else params.delete('minPrice')
    
    if (max) params.set('maxPrice', max)
    else params.delete('maxPrice')
    
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="p-4 bg-slate-50 rounded-xl border space-y-3">
      <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">Filtros</h3>
      <label className="text-sm font-medium">Rango de precio</label>
      <div className="flex gap-2">
        <input 
          type="number" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)}
          className="w-full p-2 border rounded-lg text-sm" 
        />
        <input 
          type="number" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)}
          className="w-full p-2 border rounded-lg text-sm" 
        />
      </div>
      <button 
        onClick={applyFilters}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
      >
        Aplicar
      </button>
    </div>
  )
}