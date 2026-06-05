'use client'

import { useEffect, useState, useMemo } from 'react'
import { Loader2, Wallet, Lock, Clock, ArrowRight, Search, ShoppingCart, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatPrice } from '@/lib/format'
import CashMetrics from "@/components/CashMetrics";

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
const formatMoneyDisplay = (value: string | number | undefined | null) => {
  if (value === undefined || value === null) return '0'
  const stringValue = value.toString()
  const cleanValue = stringValue.replace(/\D/g, '')
  if (cleanValue === '') return '0'
  return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Convierte el texto formateado de nuevo a número puro: "1.000.000" -> 1000000
const cleanMoneyValue = (value: string) => {
  const clean = value.replace(/\D/g, '')
  return clean ? parseInt(clean, 10) : 0
}

export default function CajaPage() {
  const [stats, setStats] = useState<{
  totalSales: number;
  totalExpenses: number;
  closedSessionsCount: number;
} | null>(null);
  const [balanceDisplay, setBalanceDisplay] = useState('0')
  const [sessionSummary, setSessionSummary] = useState<any>(null)
  const [session, setSession] = useState<ActiveSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [openingBalance, setOpeningBalance] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [processingSale, setProcessingSale] = useState(false)

  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<any | null>(null)
  const [salesHistory, setSalesHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  

  // Función para consultar la API que creamos en /api/admin/pos/history
  async function fetchTurnSales() {
    setLoadingHistory(true)
    try {
      const res = await fetch('/api/admin/pos/history')
      const data = await res.json()
      if (res.ok) {
        setSalesHistory(data.sales || [])
      }
    } catch (err) {
      console.error("Error cargando ventas", err)
    } finally {
      setLoadingHistory(false)
    }
  }

  // ==========================================
  // ESTADOS MÓDULO POS AVANZADO
  // ==========================================
  const [discountInput, setDiscountInput] = useState<string>('0')
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'TRANSFERENCIA' | 'MIXTO'>('EFECTIVO')
  const [mixedCash, setMixedCash] = useState<string>('0')
  const [mixedTransfer, setMixedTransfer] = useState<string>('0')

  // Estados para el Recibo de Venta (Tiquetera)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [lastSaleData, setLastSaleData] = useState<any>(null)

  // Estados para el Modal de Cierre de Caja
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [actualBalanceDisplay, setActualBalanceDisplay] = useState('')
  const [closingNotes, setClosingNotes] = useState('')
  const [closingSession, setClosingSession] = useState(false)

  // Estados del POS
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  // ==========================================
  // CÁLCULOS REACTIVOS (MEMOS)
  // ==========================================
  // 1. Total bruto del carrito (Suma de precios base)
  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
  }, [cart])

  // 2. Extrae el valor numérico puro del descuento ingresado
  const appliedDiscount = useMemo(() => {
    const clean = discountInput.replace(/\D/g, '')
    return clean ? parseInt(clean, 10) : 0
  }, [discountInput])

  // 3. Total definitivo restando el descuento manual
  const finalTotal = useMemo(() => {
    const net = cartTotal - appliedDiscount
    return net < 0 ? 0 : net
  }, [cartTotal, appliedDiscount])

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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualBalance: actualAmount,
          closingNotes: closingNotes.trim()
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cerrar caja')

      toast.success(data.message || 'Turno de caja cerrado con éxito.')
      
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
    let cleanValue = rawValue.replace(/\D/g, '')

    if (cleanValue === '') {
      setBalanceDisplay('0')
      return
    }

    if (cleanValue.length > 1 && cleanValue.startsWith('0')) {
      cleanValue = String(parseInt(cleanValue, 10))
    }

    setBalanceDisplay(formatMoneyDisplay(cleanValue))
  }

  // Función para enviar la venta al servidor con lógica avanzada de pago y descuento
  async function handleCheckout() {
    if (cart.length === 0) return

    // Validar coherencia en pago mixto antes de procesar
    const cashAmt = paymentMethod === 'MIXTO' ? (parseInt(mixedCash.replace(/\D/g, '')) || 0) : 0
    const transfAmt = paymentMethod === 'MIXTO' ? (parseInt(mixedTransfer.replace(/\D/g, '')) || 0) : 0
    
    if (paymentMethod === 'MIXTO' && (cashAmt + transfAmt !== finalTotal)) {
      toast.error(`La suma de Efectivo ($${formatMoneyDisplay(cashAmt)}) y Transferencia ($${formatMoneyDisplay(transfAmt)}) debe ser igual al total neto ($${formatMoneyDisplay(finalTotal)}).`)
      return
    }

    setProcessingSale(true)

    const paymentDetails = {
      method: paymentMethod,
      cashAmount: cashAmt,
      transferAmount: transfAmt
    }

    try {
      const res = await fetch('/api/admin/pos/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart,
          total: cartTotal,
          discountAmount: appliedDiscount,
          paymentDetails
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.details || 'Error al registrar la venta')

      toast.success('¡Venta registrada con éxito!')
      await fetchTurnSales(); // Tu función actual
      await fetchStats();     // <--- ¡AQUÍ AGREGAS ESTO!

      // Guardamos la información exacta incluyendo descuento y método para el tiquete
      setLastSaleData({
        orderNumber: data.order?.number || `POS-${data.orderId ? data.orderId.slice(-6).toUpperCase() : Date.now().toString().slice(-6).toUpperCase()}`,
        date: new Date(),
        items: [...cart],
        total: cartTotal,
        discount: appliedDiscount,
        netTotal: finalTotal,
        paymentMethod: paymentMethod,
        paymentDetails: paymentDetails
      })
      
      setShowTicketModal(true)

      // Vaciamos estados del POS
      setCart([])
      setDiscountInput('0')
      setPaymentMethod('EFECTIVO')
      setMixedCash('0')
      setMixedTransfer('0')
      loadProducts() 
    } catch (err: any) {
      toast.error(err.message || 'No se pudo procesar la venta')
    } finally {
      setProcessingSale(false)
    }
  }

  // Validar el estado de la caja al cargar la página
  async function checkSession() {
    try {
      const res = await fetch('/api/admin/pos/session')
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

  // Cargar productos disponibles para la venta
  async function loadProducts() {
    setLoadingProducts(true)
    try {
      const res = await fetch('/api/admin/products')
      if (res.ok) {
        const data = await res.json()
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
          if (data && data.session) {
            setSession(data.session)
            loadProducts()
          } else {
            setSession(null)
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
    async function fetchStats() {
    const res = await fetch('/api/admin/pos/stats');
    const data = await res.json();
    setStats(data); // <--- Esto es lo que alimenta el componente
  }
  fetchStats();
  }, [])

  const fetchStats = async () => {
  try {
    const res = await fetch('/api/admin/pos/stats');
    if (res.ok) {
      const data = await res.json();
      setStats(data);
    }
  } catch (error) {
    console.error("Error al actualizar métricas:", error);
  }
};


  // Función para abrir la caja (Dispara el POST)
  async function handleOpenCaja(e: React.FormEvent) {
    e.preventDefault()
    
    const cleanValue = openingBalance.replace(/\D/g, '') 
    const balance = parseInt(cleanValue, 10)
    const finalBalance = isNaN(balance) ? 0 : balance

    if (finalBalance < 0) {
      toast.error('Por favor, ingresa un saldo inicial válido')
      return
    }

    setSubmitting(true)
    try {
      const baseUrl = window.location.origin
      const res = await fetch(`${baseUrl}/api/admin/pos/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openingBalance: finalBalance,
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

  // Lógica del Carrito de Compras
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

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

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
                  type="text"
                  name="openingBalance"
                  id="openingBalance"
                  value={openingBalance}
                  onChange={(e) => {
                    // Limpiamos lo que el usuario escribe para que solo sean números
                    const rawValue = e.target.value.replace(/\D/g, '');
                    // Formateamos visualmente con puntos
                    const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                    // Actualizamos el estado
                    setOpeningBalance(formatted);
                  }}
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
  
  return (
    <div className="space-y-5 h-full">      
      {/* 2. INSERTA ESTO AQUÍ: */}
      {stats && <CashMetrics stats={stats} />}

      {/* Encabezado Superior */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Punto de Venta (POS)</h1>
          <p className="text-xs text-muted-foreground">
            Operador: <span className="font-medium text-foreground">{session.user?.name}</span> • Abierto el {new Date(session.openedAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-1.5 text-xs font-semibold shadow-sm text-slate-700 dark:text-slate-300">
          <Button 
          variant="outline" 
          size="sm" 
          className="rounded-xl flex items-center gap-2"
          onClick={() => {
            fetchTurnSales()
            setShowHistoryModal(true)
          }}
        >
          <Clock className="h-4 w-4" />
          Ventas del Turno
        </Button>
          <Wallet className="h-4 w-4 text-slate-500" />
          <span>Base Inicial: {formatPrice(session.openingBalance)}</span>
        </div>
      </div>

      {/* Malla del POS de Dos Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* COLUMNA IZQUIERDA: Catálogo */}
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

        {/* COLUMNA DERECHA: Carrito de Compras / Cobro Avanzado */}
        <div className="lg:col-span-5 rounded-xl border bg-card p-4 shadow-sm space-y-4 flex flex-col h-[calc(100vh-180px)] lg:sticky lg:top-4">
          <div className="flex items-center justify-between border-b pb-3 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-slate-500" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">Resumen del Pedido</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {cart.length} items
              </span>
            </div>
            <Button
  variant="ghost"
  size="sm"
  onClick={async () => {
    try {
      // 1. Llamamos al backend para obtener el resumen real
      const res = await fetch(`/api/admin/pos/session?t=${Date.now()}`)
      const data = await res.json()
      
      console.log("DEBUG: Respuesta del Backend:", data); // <--- MIRA ESTO EN LA CONSOLA (F12)

      if (res.ok && data.summary) {
        // 2. Seteamos los estados con los datos reales
        setSessionSummary(data.summary) 
        if (data.session) setSession(data.session)
        setShowCloseModal(true)
      } else {
        toast.error(data.error || "No se pudo obtener el resumen")
      }
    } catch (err) {
      toast.error("Error al conectar con el servidor")
    }
  }}
  className="..."
>
  <Lock className="h-3 w-3 mr-1" />
  Cerrar Caja
</Button>
          </div>

          {/* Lista del Carrito */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 p-2 rounded-xl border bg-muted/30 text-sm group">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate text-slate-800 dark:text-slate-200">{item.product.name}</h4>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {formatPrice(item.product.price)} x {item.quantity}
                  </p>
                </div>

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
                <p className="text-[11px] text-muted-foreground max-w-[180px] mt-0.5">Haz clic en un producto para agregarlo.</p>
              </div>
            )}
          </div>

          {/* DESGLOSE AVANZADO: DESCUENTOS Y MÉTODOS DE PAGO MÚLTIPLES */}
          <div className="border-t pt-3 space-y-3 bg-card mt-auto shrink-0">
            
            {/* Input de Descuento Manual */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-amber-600 tracking-wider flex justify-between">
                <span>¿Aplicar Descuento Manual?</span>
                {appliedDiscount > 0 && <span>-{formatPrice(appliedDiscount)}</span>}
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-400 text-xs">$</span>
                </div>
                <Input
                  type="text"
                  value={discountInput === '0' ? '' : discountInput}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '')
                    setDiscountInput(clean ? formatMoneyDisplay(clean) : '0')
                  }}
                  placeholder="Monto de rebaja (Ej. 5.000)"
                  className="pl-6 h-8 text-xs font-mono rounded-lg border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  disabled={cart.length === 0}
                />
              </div>
            </div>

            {/* Selector de Método de Pago */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider block">
                Método de Pago
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['EFECTIVO', 'TRANSFERENCIA', 'MIXTO'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    disabled={cart.length === 0}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all border ${
                      paymentMethod === method
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-muted/50 text-slate-600 hover:bg-muted border-transparent'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs dinámicos si el pago es Mixto */}
            {paymentMethod === 'MIXTO' && (
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl border border-dashed dark:bg-slate-900">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">A Efectivo</span>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">$</span>
                    <Input
                      type="text"
                      value={mixedCash === '0' ? '' : mixedCash}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '')
                        setMixedCash(clean ? formatMoneyDisplay(clean) : '0')
                      }}
                      className="pl-5 h-7 text-xs font-mono bg-white rounded-lg"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">A Transf.</span>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">$</span>
                    <Input
                      type="text"
                      value={mixedTransfer === '0' ? '' : mixedTransfer}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '')
                        setMixedTransfer(clean ? formatMoneyDisplay(clean) : '0')
                      }}
                      className="pl-5 h-7 text-xs font-mono bg-white rounded-lg"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Resumen de Totales Finales */}
            <div className="space-y-0.5 pt-1 border-t border-dashed">
              {appliedDiscount > 0 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                  <span>Subtotal Compra:</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm font-bold">
                <span>Total Neto:</span>
                <span className="font-mono text-xl text-slate-900 dark:text-white">
                  {formatPrice(finalTotal)}
                </span>
              </div>
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
          <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl dark:bg-slate-950 context-modal">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Lock className="h-5 w-5 text-rose-500" />
              Control de caja y Cierre de Turno
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Revisa las cuentas automáticas del sistema y cuenta el dinero físico en el cajón monedero.
            </p>

            {/* DETALLE MATEMÁTICO DEL TURNO (AQUÍ SE INYECTA LA SOLUCIÓN) */}
            {sessionSummary && (
              <div className="mb-4 space-y-2.5 rounded-xl bg-slate-50 p-4 dark:bg-slate-900 text-xs border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Monto Base de Apertura:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {/* Forzamos el 0 si no existe */}
                    ${formatMoneyDisplay(sessionSummary?.openingBalance ?? 0)}
                  </span>
                </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Ventas Realizadas ({sessionSummary.completedCount}):</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              + ${formatMoneyDisplay(sessionSummary.totalSales)}
            </span>
          </div>
          {/* Modifica esta parte en tu page.tsx */}
          <div className="flex justify-between items-center border-b pb-2 border-slate-200 dark:border-slate-800">
            <span className="text-slate-500">
              Gastos Reales:
            </span>
            <span className="font-semibold text-red-500">
              - ${formatMoneyDisplay(sessionSummary.totalAnulaciones)}
            </span>
          </div>

          {/* Agrega esta línea nueva si quieres mostrar la info de las anulaciones 
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>(Anulaciones informativas: ${formatMoneyDisplay(sessionSummary.totalAnulaciones)})</span>
          </div>
          */}
          <div className="flex justify-between items-center pt-1.5 text-sm font-bold text-slate-900 dark:text-white">
            <span>Efectivo Esperado en Caja:</span>
            <span className="text-blue-600 dark:text-blue-400">
              ${formatMoneyDisplay(sessionSummary.expectedCashInHand)}
            </span>
          </div>
        </div>
      )}

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
            className="flex-1 rounded-xl text-xs h-9"
            onClick={() => setShowCloseModal(false)}
            disabled={closingSession}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={closingSession}
            className="flex-1 rounded-xl text-xs h-9 bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700 font-semibold"
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

      {/* MODAL DE RECIBO DE VENTA (VOUCHER POS CON SOPORTE AVANZADO) */}
      {showTicketModal && lastSaleData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print">
          <div className="w-full max-w-sm rounded-2xl border bg-white p-5 shadow-2xl dark:bg-slate-950">
            
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 text-center">
              🎉 ¡Venta Procesada Exitosamente!
            </h3>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 overflow-y-auto max-h-[50vh] dark:bg-slate-900/40 dark:border-slate-800">              
              <div 
                id="pos-ticket-print" 
                className="print-area bg-white text-black p-2 font-mono text-xs space-y-3 leading-tight"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              >
                {/* ENCABEZADO */}
                <div className="text-center space-y-0.5">
                  <h2 className="text-sm font-bold tracking-wider uppercase text-black">TIENDA MAREA</h2>
                  <p className="text-[10px] text-zinc-600">Gestión General • POS</p>
                  <p className="text-[10px] text-slate-600">Bogotá, Colombia</p>
                </div>

                <div className="border-b border-dashed border-black/40 my-2" />

                {/* METADATOS */}
                <div className="space-y-0.5 text-[11px]">
                  <p><span className="font-bold">Factura:</span> #{lastSaleData.orderNumber}</p>
                  <p><span className="font-bold">Fecha:</span> {lastSaleData.date.toLocaleString('es-CO')}</p>
                  <p><span className="font-bold">Cajero:</span> {session?.user?.name || 'Super Admin'}</p>
                </div>

                <div className="border-b border-dashed border-black/40 my-2" />

                {/* PRODUCTOS */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-[11px]">
                    <span>Cant / Producto</span>
                    <span>Total</span>
                  </div>
                  {lastSaleData.items?.map((item: any) => (
                    <div key={item.product.id} className="flex justify-between items-start text-[11px]">
                      <span className="max-w-[70%]">
                        {item.quantity}x {item.product.name}
                      </span>
                      <span>
                        ${formatMoneyDisplay(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-b border-dashed border-black/40 my-2" />

                {/* TOTALES AVANZADOS */}
                <div className="space-y-1 text-[11px]">
                  {lastSaleData.discount > 0 && (
                    <div className="flex justify-between text-zinc-700">
                      <span>Subtotal Base:</span>
                      <span>${formatMoneyDisplay(lastSaleData.total)}</span>
                    </div>
                  )}
                  {lastSaleData.discount > 0 && (
                    <div className="flex justify-between font-bold text-amber-700">
                      <span>Descuento Manual:</span>
                      <span>-${formatMoneyDisplay(lastSaleData.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-sm pt-1">
                    <span>TOTAL COBRADO:</span>
                    <span>${formatMoneyDisplay(lastSaleData.netTotal ?? lastSaleData.total)}</span>
                  </div>
                </div>

                <div className="border-b border-dashed border-black/40 my-2" />

                {/* DETALLE MÉTODO DE PAGO */}
                <div className="text-[11px] space-y-0.5">
                  <p><span className="font-bold">Método de Pago:</span> {lastSaleData.paymentMethod}</p>
                  {lastSaleData.paymentMethod === 'MIXTO' && (
                    <div className="pl-2 text-[10px] text-zinc-600">
                      <p>• Efectivo: ${formatMoneyDisplay(lastSaleData.paymentDetails?.cashAmount)}</p>
                      <p>• Transf: ${formatMoneyDisplay(lastSaleData.paymentDetails?.transferAmount)}</p>
                    </div>
                  )}
                </div>

                <div className="border-b border-dashed border-black/40 my-2" />

                {/* PIE DE PÁGINA */}
                <div className="text-center pt-1 text-[10px] space-y-0.5">
                  <p className="font-bold">¡Gracias por tu compra!</p>
                  <p className="text-slate-500">tienda1.local</p>
                </div>

              </div>
            </div>

            {/* ACCIONES */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="ghost"
                className="flex-1 rounded-xl text-xs"
                onClick={() => setShowTicketModal(false)}
              >
                Cerrar
              </Button>
              <Button
                type="button"
                className="flex-1 rounded-xl text-xs bg-slate-900 text-white hover:bg-slate-800 font-semibold"
                onClick={() => {
                  const ticketHtml = document.getElementById('pos-ticket-print')?.innerHTML
                  if (ticketHtml) {
                    const printWindow = window.open('', '_blank')
                    if (printWindow) {
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <title>Imprimir Factura #${lastSaleData?.orderNumber}</title>
                            <style>
                              html, body {
                                margin: 0;
                                padding: 0;
                                background-color: #ffffff;
                                color: #000000;
                                font-family: 'Courier New', Courier, monospace;
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                              }
                              .ticket-wrapper {
                                width: 72mm;
                                margin: 0 auto;
                                padding-top: 30px;
                                padding-bottom: 20px;
                                padding-left: 6px;
                                padding-right: 6px;
                                box-sizing: border-box;
                              }
                              .text-center { text-align: center; }
                              .uppercase { text-transform: uppercase; }
                              .font-bold { font-weight: bold; }
                              .font-extrabold { font-weight: 800; }
                              .text-sm { font-size: 14px; }
                              .text-xs { font-size: 12px; }
                              .text-[10px] { font-size: 10px; }
                              .text-[11px] { font-size: 11px; }
                              .text-zinc-600, .text-slate-600 { color: #404040; }
                              .border-b { border-bottom: 1px solid #000000; }
                              .border-dashed { border-style: dashed; }
                              .my-2 { margin-top: 8px; margin-bottom: 8px; }
                              .pt-1 { padding-top: 4px; }
                              .flex { display: flex; }
                              .justify-between { justify-content: space-between; }
                              .items-start { align-items: flex-start; }
                              .leading-tight { line-height: 1.3; }
                              .max-w-[70%] { max-width: 70%; }
                              .pl-2 { padding-left: 8px; }
                              @media print {
                                @page { margin: 0; size: auto; }
                                body { background: #ffffff; }
                                .ticket-wrapper { width: 72mm; padding-top: 30px !important; }
                              }
                            </style>
                          </head>
                          <body>
                            <div class="ticket-wrapper">
                              ${ticketHtml}
                            </div>
                            <script>
                              window.onload = function() {
                                window.print();
                                setTimeout(() => { window.close(); }, 100);
                              };
                            </script>
                          </body>
                        </html>
                      `)
                      printWindow.document.close()
                    }
                  } else {
                    toast.error('No se encontró el contenedor de la factura')
                  }
                }}
              >
                🖨️ Imprimir
              </Button>
            </div>

          </div>
        </div>
      )}

      {showHistoryModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
    <div className="w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-xl dark:bg-slate-950 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <h3 className="text-base font-bold">Ventas Realizadas en este Turno</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowHistoryModal(false)}>Cerrar</Button>
      </div>

      {loadingHistory ? (
        <p className="text-sm text-center py-6 text-slate-500">Cargando facturas...</p>
      ) : salesHistory.length === 0 ? (
        <p className="text-sm text-center py-6 text-slate-500">No has realizado ventas en este turno todavía.</p>
      ) : (
        <div className="space-y-3">
          {salesHistory.map((sale) => (
            <div key={sale.id} className="p-3 border rounded-xl flex justify-between items-center bg-slate-50/50">
              <div>
                <p className="text-xs font-bold text-slate-950">Factura #POS-{sale.id.slice(-6).toUpperCase()}</p>
                <p className="text-[10px] text-slate-500">{new Date(sale.createdAt).toLocaleTimeString('es-CO')}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  sale.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {sale.status === 'CANCELLED' ? 'Anulada' : 'Completada'}
                </span>
              </div>
              
              <div className="text-right flex items-center gap-4">
                <div>
                  <p className="font-mono text-xs font-bold">${new Intl.NumberFormat('es-CO').format(sale.total)}</p>
                  <p className="text-[10px] uppercase text-slate-400 font-medium">{sale.paymentMethod}</p>
                </div>

                {sale.status !== 'CANCELLED' && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="h-7 text-xs rounded-lg"
                  onClick={() => setOrderToCancel(sale)}
                >
                  Anular
                </Button>
              )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}
{orderToCancel && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
    <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl dark:bg-slate-950 text-center sm:text-left">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
        ¿Seguro que deseas ANULAR esta factura?
      </h3>
      <p className="text-sm text-slate-500 mt-2">
        Se devolverán los productos al stock y se restará el efectivo de la caja. Esta acción no se puede deshacer.
      </p>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-5">
        <Button 
          type="button" 
          variant="outline" 
          className="rounded-xl px-4 text-xs font-semibold"
          onClick={() => setOrderToCancel(null)}
        >
          Cancelar
        </Button>
        <Button 
          type="button" 
          className="rounded-xl bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 px-4 text-xs font-semibold"
          onClick={async () => {
            try {
              const res = await fetch('/api/admin/pos/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: orderToCancel.id })
              })
              
              const data = await res.json()
              if (!res.ok) throw new Error(data.error || 'Error al anular')

              toast.success("Factura anulada con éxito e inventario restaurado.")
              await fetchTurnSales();
            await fetchStats(); // <--- ¡AQUÍ TAMBIÉN!
              setOrderToCancel(null) // Cerrar confirmación
              
              // 1. Refresca la lista de facturas del modal
              await fetchTurnSales() 

              // 2. ¡SOLUCIÓN! Actualizar el stock en el estado local inmediatamente
              if (orderToCancel && Array.isArray(orderToCancel.items)) {
                setProducts((prevProducts: any[]) => {
                  return prevProducts.map((product) => {
                    // Buscamos si este producto estaba en la orden que se anuló
                    const cancelledItem = orderToCancel.items.find(
                      (item: any) => (item.productId || item.id) === product.id
                    )

                    if (cancelledItem) {
                      // Devolvemos la cantidad sumándola al stock actual
                      return {
                        ...product,
                        stock: (product.stock || 0) + Number(cancelledItem.quantity)
                      }
                    }
                    return product
                  })
                })
              }

            } catch (err: any) {
              toast.error(err.message || "No se pudo anular la factura")
            }
          }}
        >
          Anular Factura
        </Button>
      </div>
    </div>
  </div>
)}
    </div>
  )
}