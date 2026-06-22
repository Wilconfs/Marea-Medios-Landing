'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Search, ShoppingCart, User, LogOut, Package, Menu, X, Sparkles, Loader2 } from 'lucide-react'
import { useCart } from '@/lib/cart-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// Hook simple de Debounce para proteger el rendimiento de MySQL local
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

type PredictiveProduct = {
  id: string
  name: string
  price: number
  imageUrl: string
}

export function SiteHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession() || {}
  const items = useCart((s) => s?.items ?? [])
  const hasHydrated = useCart((s) => s?.hasHydrated)
  
  const totalItems = (items ?? []).reduce(
    (sum, item) => sum + (item?.quantity ?? 0),
    0
  )

  const initialSearch = searchParams?.get('search') ?? ''
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Estados del Buscador Predictivo en vivo
  const [predictions, setPredictions] = useState<PredictiveProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Sincronizar el input si cambia la URL externamente
  useEffect(() => {
    setSearchQuery(searchParams?.get('search') ?? '')
  }, [searchParams])

  // Cerrar predicciones al hacer clic en cualquier otra parte de la pantalla
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Buscar sugerencias en vivo desde la API de MySQL
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setPredictions([])
      return
    }

    async function getPredictions() {
      setLoading(true)
      try {
        const res = await fetch(`/api/products/search-predictive?q=${encodeURIComponent(debouncedSearch)}`)
        if (res.ok) {
          const data = await res.json()
          setPredictions(data)
          setShowDropdown(true)
        }
      } catch (err) {
        console.error('Error cargando sugerencias predictivas:', err)
      } finally {
        setLoading(false)
      }
    }

    getPredictions()
  }, [debouncedSearch])

  // Desplazamiento inteligente y actualización de parámetros
  const executeSearch = (queryStr: string) => {
    setShowDropdown(false)
    setMobileOpen(false)
    const q = queryStr.trim()

    router.push(q ? `/?search=${encodeURIComponent(q)}` : '/')

    // Si el usuario escribe algo, hacemos scroll automático al ID exacto de tu page.tsx
    if (q) {
      setTimeout(() => {
        const sectionProductos = document.getElementById('productos')
        if (sectionProductos) {
          sectionProductos.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 150)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    executeSearch(searchQuery)
  }

  const userInitials = (session?.user?.name ?? session?.user?.email ?? 'U')
    .split(' ')
    .map((s) => s?.[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const isAdminRole = session?.user?.role === 'SUPERADMIN' ||
    session?.user?.role === 'ADMIN' ||
    session?.user?.role === 'AUXILIAR'

  return (
    <header className="">

    </header>
  )
}