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

// Convierte un número o string limpio a formato con puntos: "1000000" -> "1.000.000"
const formatMoneyDisplay = (value: string | number) => { // 👈 LE QUITAMOS EL 'export'
  if (!value && value !== 0) return ''
  const stringValue = typeof value === 'number' ? value.toString() : value
  const cleanValue = stringValue.replace(/\D/g, '') // Quita todo lo que no sea número
  return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.') // Agrega los puntos de miles
}

// Convierte el texto formateado de nuevo a número puro: "1.000.000" -> 1000000
const cleanMoneyValue = (value: string) => {
  const clean = value.replace(/\D/g, '')
  return clean ? parseInt(clean, 10) : 0
}

export default function CajaPage() {
  const [balanceDisplay, setBalanceDisplay] = useState('0')
  const [session, setSession] = useState<ActiveSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [openingBalance, setOpeningBalance] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [processingSale, setProcessingSale] = useState(false)

  // Estados para el Modal de Cierre de Caja
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [actualBalanceDisplay, setActualBalanceDisplay] = useState('')
  const [closingNotes, setClosingNotes] = useState('')
  const [closingSession, setClosingSession] = useState(false)

  // Ejecutar el cierre de caja final
  async function handleCloseCaja(e: React.FormEvent) {
    e.preventDefault()
    const cleanValue = actualBalanceDisplay.replace(/\D/g, '')
    const actualAmount = parseInt(cleanValue, 10)

    if (isNaN(actualAmount) || actualAmount < 0) {
      toast.error('Por favor, ingresa un valor de dinero real válido')
      return
    }

    setClosingSession(true)
    try {
      const res = await fetch('/api/admin/pos/session', {
        method: 'PUT', // 👈 Invoca el método PUT que creamos arriba
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualBalance: actualAmount,
          closingNotes: closingNotes.trim()
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cerrar caja')

      toast.success(data.message || 'Turno de caja cerrado con éxito.')
      
      // Reiniciamos todo el estado para obligar al POS a volver al formulario de apertura
      setSession(null)
      setCart([])
      setShowCloseModal(false)
      setActualBalanceDisplay('')
      setClosingNotes('')
    } catch (err: any) {
      toast.error(err.message || 'No se pudo cerrar la caja')
    } finally {
      setClosingSession(false)
    }
  }

const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let rawValue = e.target.value

  // 1. Quitar todo lo que no sea número
  let cleanValue = rawValue.replace(/\D/g, '')

  // 2. Si el usuario borra todo, dejamos el estado visual en '0'
  if (cleanValue === '') {
    setBalanceDisplay('0')
    return
  }

  // 3. Quitar los ceros a la izquierda para evitar que se quede el "0" pegado (ej: "05" -> "5")
  // Pero permitimos el "0" si es el único carácter digitado
  if (cleanValue.length > 1 && cleanValue.startsWith('0')) {
    cleanValue = String(parseInt(cleanValue, 10))
  }

  // 4. Aplicar el formateo por miles e inyectar al estado visual
  setBalanceDisplay(formatMoneyDisplay(cleanValue))
}

  // Estados del POS
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Función para enviar la venta al servidor
  async function handleCheckout() {
    if (cart.length === 0) return

    setProcessingSale(true)
    try {
      // Le pega directamente a la nueva API dedicada de venta
      const res = await fetch('/api/admin/pos/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart,
          total: cartTotal,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.details || 'Error al registrar la venta')

      toast.success('¡Venta registrada con éxito!')
      setCart([])
      loadProducts() // Refresca las tarjetas con el nuevo stock descontado
    } catch (err: any) {
      toast.error(err.message || 'No se pudo procesar la venta')
    } finally {
      setProcessingSale(false)
    }
  }

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

  // Cargar sesión de caja activa al entrar a la página
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/admin/pos/session')
        if (res.ok) {
          const data = await res.json()
          
          // 👈 Si el backend te devuelve una sesión abierta, la inyectamos al estado
          if (data && data.session) {
            setSession(data.session)
            loadProducts() // Carga el catálogo de inmediato
          } else {
            setSession(null) // Si viene null, obligamos a ver el formulario de apertura
          }
        }
      } catch (err) {
        console.error('Error al verificar sesión de caja:', err)
        toast.error('No se pudo verificar el estado de la caja')
      } finally {
        setLoading(false)
      }
    }
    checkSession()
  }, [])

  // 3. Función para abrir la caja (Dispara el POST)
  async function handleOpenCaja(e: React.FormEvent) {
    e.preventDefault()
    
    // 👇 LIMPIEZA CLAVE: Quitamos los puntos de miles antes de convertir a número
    // Si estás usando la variable 'balanceDisplay' para el input, úsala aquí.
    // Si dejaste el mismo nombre 'openingBalance', simplemente le hacemos el replace:
    const cleanValue = openingBalance.replace(/\D/g, '') 
    const balance = parseInt(cleanValue, 10)

    // Si el campo quedó vacío, lo interpretamos como 0
    const finalBalance = isNaN(balance) ? 0 : balance

    if (finalBalance < 0) {
      toast.error('Por favor, ingresa un saldo inicial válido')
      return
    }

    setSubmitting(true)
    try {
      const baseUrl = window.location.origin // Aseguramos compatibilidad con el subdominio
      const res = await fetch(`${baseUrl}/api/admin/pos/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openingBalance: finalBalance, // 👈 Le mandamos el número entero limpio (ej: 50000)
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Saldo Inicial / Base en Efectivo
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="text-slate-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text" // 👈 Cambiado a text para permitir los puntos divisores
                  name="openingBalance"
                  id="openingBalance"
                  value={balanceDisplay}
                  onChange={handleBalanceChange}
                  className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-8 pr-4 text-base text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
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
              {filteredProducts.map((product, index) => {
                const outOfStock = product.stock <= 0
                return (
                  <button
                    key={`${product.id}-${index}`}
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
          <div className="flex items-center justify-between border-b pb-3 mb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-slate-500" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">Resumen del Pedido</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {cart.length} items
              </span>
            </div>

            {/* BOTÓN DE CIERRE INTEGRADO */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowCloseModal(true)}
              className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg h-7 px-2"
            >
              <Lock className="h-3 w-3 mr-1" />
              Cerrar Caja
            </Button>
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
              disabled={cart.length === 0 || processingSale}
              className="w-full font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              size="lg"
              onClick={handleCheckout}
            >
              {processingSale ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando cobro...
                </>
              ) : (
                'Registrar Venta'
              )}
            </Button>
          </div>
        </div>
        
        

      </div>

      {/* MODAL DE ARQUEO / CIERRE DE CAJA */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl dark:bg-slate-950 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Lock className="h-5 w-5 text-rose-500" />
              Arqueo y Cierre de Turno
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Cuenta el dinero en efectivo que tienes físicamente en el cajón monedero para finalizar el turno.
            </p>

            <form onSubmit={handleCloseCaja} className="space-y-4">
              <div>
                <Label htmlFor="actualBalance">Total Efectivo Físico en Mano</Label>
                <div className="relative mt-1 rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-slate-500 sm:text-sm">$</span>
                  </div>
                  <Input
                    type="text"
                    id="actualBalance"
                    value={actualBalanceDisplay}
                    onChange={(e) => setActualBalanceDisplay(formatMoneyDisplay(e.target.value))}
                    className="pl-8 py-3 text-base font-bold font-mono text-slate-900 dark:text-white"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="closingNotes">Novedades u Observaciones de Cierre</Label>
                <textarea
                  id="closingNotes"
                  rows={3}
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="Ej. Faltaron $500 pesos por una bolsa, o todo cuadró perfecto..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex-1 rounded-xl"
                  onClick={() => setShowCloseModal(false)}
                  disabled={closingSession}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={closingSession}
                  className="flex-1 rounded-xl bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700"
                >
                  {closingSession ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cerrando...
                    </>
                  ) : (
                    'Confirmar Cierre'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}