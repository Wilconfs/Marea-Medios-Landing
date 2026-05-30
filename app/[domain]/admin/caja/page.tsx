'use client'

import { useEffect, useState, useMemo } from 'react'
import { Loader2, Wallet, Lock, ArrowRight, Search, ShoppingCart, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatPrice } from '@/lib/format'

type ActiveSession = {
  id: string
  openingBalance: number
  openedAt: string
  user: {
    name: string
    email: string
  }
}

type Product = {
  id: string
  name: string
  price: number
  stock: number
  category?: { name: string }
}

type CartItem = {
  product: Product
  quantity: number
}

export default function CajaPage() {
  const [session, setSession] = useState<ActiveSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [openingBalance, setOpeningBalance] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Estados del POS
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  // 1. Validar el estado de la caja al cargar la página
  async function checkSession() {
    try {
      // Usamos la ruta directa a la API global
      const res = await fetch('/api/admin/pos/session')
      
      // Si el middleware te está devolviendo un HTML (por ejemplo, si te redirige),
      // res.ok puede ser true, pero el contenido no es un JSON. Validamos el tipo:
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('La API devolvió HTML en vez de JSON. Revisa el ruteo del middleware.')
        setSession(null)
        return
      }

      if (res.ok) {
        const data = await res.json()
        setSession(data.activeSession)
        if (data.activeSession) {
          loadProducts()
        }
      }
    } catch (err) {
      console.error('Error al verificar sesión de caja:', err)
      toast.error('No se pudo verificar el estado de la caja')
    } finally {
      setLoading(false)
    }
  }

  // 2. Cargar productos disponibles para la venta
  async function loadProducts() {
    setLoadingProducts(true)
    try {
      const res = await fetch('/api/admin/products')
      if (res.ok) {
        const data = await res.json()
        // Filtrar solo productos activos si es necesario
        setProducts(Array.isArray(data) ? data.filter((p: any) => p.isActive) : [])
      }
    } catch (err) {
      toast.error('Error al cargar productos en el POS')
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  // 3. Función para abrir la caja (Dispara el POST)
  async function handleOpenCaja(e: React.FormEvent) {
    e.preventDefault()
    const balance = parseFloat(openingBalance)
    if (isNaN(balance) || balance < 0) {
      toast.error('Por favor, ingresa un saldo inicial válido')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/pos/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openingBalance: balance,
          notes: notes.trim(),
        }),
      })

      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('El servidor respondió con un formato incorrecto (HTML). Verifica la ruta de la API.')
      }

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al abrir caja')

      toast.success('¡Caja abierta con éxito! Turno iniciado.')
      setSession(data.session)
      loadProducts()
    } catch (err: any) {
      toast.error(err.message || 'No se pudo abrir la caja')
    } finally {
      setSubmitting(false)
    }
  }

  // 4. Lógica del Carrito de Compras
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error(`Stock máximo alcanzado (${product.stock} u.)`)
          return prev
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: string, amount: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + amount
            if (newQty > item.product.stock) {
              toast.error(`Solo hay ${item.product.stock} unidades en inventario.`)
              return item
            }
            return { ...item, quantity: newQty }
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  // Filtrado reactivo de productos por nombre o categoría
  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category?.name.toLowerCase().includes(query)
    )
  }, [products, search])

  // Cálculo del total actual de la venta
  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
  }, [cart])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // -----------------------------------------------------------------
  // ESCENARIO A: LA CAJA ESTÁ CERRADA -> FORMULARIO EN GRISES LIMPIOS
  // -----------------------------------------------------------------
  if (!session) {
    return (
      <div className="mx-auto max-w-md py-12">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Lock className="h-5 w-5" />
            </div>
            <h1 className="font-display text-xl font-bold tracking-tight">Apertura de Caja</h1>
            <p className="text-sm text-muted-foreground">
              Para empezar a registrar ventas en el POS, debes abrir un turno de caja.
            </p>
          </div>

          <form onSubmit={handleOpenCaja} className="space-y-4">
            <div>
              <Label htmlFor="openingBalance" className="text-sm font-medium">
                Saldo Inicial / Base en Efectivo
              </Label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-sm font-semibold">
                  $
                </span>
                <Input
                  id="openingBalance"
                  type="number"
                  placeholder="0"
                  className="pl-7 text-lg font-medium rounded-xl"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                El dinero en efectivo disponible para dar cambio al cliente.
              </p>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                Notas u Observaciones (Opcional)
              </Label>
              <Input
                id="notes"
                placeholder="Ej. Todo en billetes de 10k y 20k..."
                className="mt-1 rounded-xl"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={submitting}
              />
            </div>

            <Button type="submit" className="w-full text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl" size="lg" disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  Abrir Turno de Caja
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // -----------------------------------------------------------------
  // ESCENARIO B: LA CAJA ESTÁ ABIERTA -> REJILLA DE VENTAS REAL (POS)
  // -----------------------------------------------------------------
  return (
    <div className="space-y-5 h-full">
      {/* Encabezado Superior */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Punto de Venta (POS)</h1>
          <p className="text-xs text-muted-foreground">
            Operador: <span className="font-medium text-foreground">{session.user?.name}</span> • Abierto el {new Date(session.openedAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-1.5 text-xs font-semibold shadow-sm text-slate-700 dark:text-slate-300">
          <Wallet className="h-4 w-4 text-slate-500" />
          <span>Base Inicial: {formatPrice(session.openingBalance)}</span>
        </div>
      </div>

      {/* Malla del POS de Dos Columnas (Escritorio) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* 🛒 COLUMNA IZQUIERDA: Catálogo de Productos (60% / 7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar producto por nombre o categoría..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>

          {loadingProducts ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
              {filteredProducts.map((product) => {
                const outOfStock = product.stock <= 0
                return (
                  <button
                    key={product.id}
                    disabled={outOfStock}
                    onClick={() => addToCart(product)}
                    className="flex flex-col justify-between text-left p-3 rounded-xl border bg-card hover:border-slate-400 dark:hover:border-slate-500 transition-all shadow-sm group disabled:opacity-50 disabled:hover:border-border"
                  >
                    <div className="w-full">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
                        {product.category?.name || 'General'}
                      </span>
                      <h3 className="font-medium text-sm text-slate-800 dark:text-slate-200 mt-0.5 group-hover:text-black dark:group-hover:text-white line-clamp-2">
                        {product.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between w-full mt-4 pt-2 border-t border-dashed">
                      <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                        {formatPrice(product.price)}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${
                        outOfStock 
                          ? 'bg-red-100 text-red-600 dark:bg-red-950/30' 
                          : product.stock <= 5 
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {outOfStock ? 'Sin Stock' : `${product.stock} u.`}
                      </span>
                    </div>
                  </button>
                )
              })}

              {filteredProducts.length === 0 && (
                <div className="col-span-full py-12 text-center text-sm text-muted-foreground border border-dashed rounded-xl bg-card">
                  No se encontraron productos disponibles.
                </div>
              )}
            </div>
          )}
        </div>

        {/* 🧾 COLUMNA DERECHA: Carrito de Compras / Cobro (40% / 5 Cols) */}
        <div className="lg:col-span-5 rounded-xl border bg-card p-4 shadow-sm space-y-4 flex flex-col h-[calc(100vh-180px)] lg:sticky lg:top-4">
          <div className="flex items-center gap-2 font-semibold text-sm border-b pb-2">
            <ShoppingCart className="h-4 w-4 text-slate-500" />
            <span>Resumen del Pedido</span>
            <span className="ml-auto bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-xs font-bold">
              {cart.reduce((acc, item) => acc + item.quantity, 0)} items
            </span>
          </div>

          {/* Lista del Carrito con Scroll Independiente */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 p-2 rounded-xl border bg-muted/30 text-sm group">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate text-slate-800 dark:text-slate-200">{item.product.name}</h4>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {formatPrice(item.product.price)} x {item.quantity}
                  </p>
                </div>

                {/* Controles de cantidad */}
                <div className="flex items-center border rounded-lg bg-card overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="p-1 hover:bg-muted text-slate-500 transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="px-2 text-xs font-mono font-bold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="p-1 hover:bg-muted text-slate-500 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                <ShoppingBag className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs">El carrito está vacío.</p>
                <p className="text-[11px] text-muted-foreground max-w-[180px] mt-0.5">Haz clic en un producto del catálogo para agregarlo.</p>
              </div>
            )}
          </div>

          {/* Desglose y Botón de Acción Principal */}
          <div className="border-t pt-4 space-y-3 bg-card mt-auto">
            <div className="flex items-center justify-between text-base font-bold">
              <span>Total a Cobrar:</span>
              <span className="font-mono text-xl text-slate-900 dark:text-white">
                {formatPrice(cartTotal)}
              </span>
            </div>

            <Button
              disabled={cart.length === 0}
              className="w-full font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              size="lg"
              onClick={() => toast.info('Módulo de cobro en construcción')}
            >
              Registrar Venta
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}