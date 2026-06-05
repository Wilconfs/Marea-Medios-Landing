'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Loader2, Search, Eye, MessageSquare } from 'lucide-react' // 👈 Añadido MessageSquare
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

type OrderItem = {
  id: string
  name: string
  quantity: number
  price: number
  imageUrl?: string
}

type Order = {
  id: string
  total: number
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  customerName: string | null
  customerPhone: string | null
  whatsappSent: boolean
  createdAt: string
  items: OrderItem[]
  user: { name: string; email: string } | null
}

const STATUS_LABEL: Record<Order['status'], string> = {
  PENDING: 'Recibido',
  CONFIRMED: 'Preparando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const STATUS_COLOR: Record<Order['status'], string> = {
  PENDING: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  CONFIRMED: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  SHIPPED: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  DELIVERED: 'bg-green-500/10 text-green-700 dark:text-green-400',
  CANCELLED: 'bg-red-500/10 text-red-700 dark:text-red-400',
}

export function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      toast.error('No se pudieron cargar los pedidos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function MobileOrderCard({ order, onNotify }: { order: Order; onNotify: (o: Order) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="border rounded-lg p-4 mb-3 bg-card shadow-sm">
      <div className="flex justify-between items-center" onClick={() => setIsOpen(!isOpen)}>
        <div>
          <p className="font-mono font-bold">#{order.id.slice(-8).toUpperCase()}</p>
          <p className="text-sm font-medium">{order.customerName ?? order.user?.name ?? 'Invitado'}</p>
        </div>
        <div className="flex items-center gap-2">
           <span className={cn('text-[10px] px-2 py-1 rounded-full', STATUS_COLOR[order.status])}>
             {STATUS_LABEL[order.status]}
           </span>
        </div>
      </div>
      
      {isOpen && (
        <div className="mt-4 pt-4 border-t space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha:</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-bold">{formatPrice(order.total)}</span>
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onNotify(order)}>Notificar</Button>
            <Button asChild size="sm" className="flex-1"><Link href={`/admin/orders/${order.id}`}>Ver</Link></Button>
          </div>
        </div>
      )}
    </div>
  )
}

  // 👇 FUNCIÓN LÓGICA DE NOTIFICACIÓN DE WHATSAPP AÑADIDA
  const handleWhatsappNotification = async (order: Order) => {
    try {
      const res = await fetch('/api/admin/templates')
      if (!res.ok) throw new Error()
      const templates = await res.json()

      // Mapeamos el estado interno al tipo de la plantilla guardada
      const stateMapping: Record<Order['status'], 'RECIBIDO' | 'PREPARACION' | 'ENVIADO' | 'ENTREGADO' | 'CANCELLED'> = {
        PENDING: 'RECIBIDO',     // 👈 Cambiado de PREPARACION a RECIBIDO
        CONFIRMED: 'PREPARACION',
        SHIPPED: 'ENVIADO',
        DELIVERED: 'ENTREGADO',
        CANCELLED: 'CANCELLED'   // 👈 Cambiado de null a CANCELLED
      }

      const currentType = stateMapping[order.status]
      if (!currentType) {
        toast.error('No hay plantillas de notificación para pedidos cancelados.')
        return
      }

      const templateConfigured = templates.find((t: any) => t.type === currentType)?.message

      const defaultMessages = {
        RECIBIDO: "Hola {cliente}, confirmamos que hemos recibido tu pedido #{pedido} de forma correcta. ¡Pronto iniciaremos con su preparación!",
        PREPARACION: "Hola {cliente}, te informamos que tu pedido #{pedido} ya está en preparación. ¡Pronto te avisaremos cuando vaya en camino!",
        ENVIADO: "¡Buenas noticias {cliente}! Tu pedido #{pedido} ya fue enviado. El total de tu compra es de {total}.",
        ENTREGADO: "Hola {cliente}, confirmamos que tu pedido #{pedido} fue entregado con éxito. ¡Gracias por tu compra!",
        CANCELLED: "Hola {cliente}, te informamos que tu pedido #{pedido} ha sido cancelado. Si tienes dudas, por favor comunícate con soporte."
      }

      const baseText = templateConfigured || defaultMessages[currentType]
      const clientName = order.customerName || order.user?.name || 'Cliente'
      const orderId = order.id.slice(-6).toUpperCase()
      const formattedTotal = formatPrice(order.total)

      const formattedMessage = baseText
        .replace(/{cliente}/g, clientName)
        .replace(/{pedido}/g, orderId)
        .replace(/{total}/g, formattedTotal)

      let phone = (order.customerPhone || '').replace(/\D/g, '')
      
      if (!phone) {
        toast.error('Este pedido no cuenta con un número celular registrado.')
        return
      }

      if (!phone.startsWith('57') && phone.length === 10) {
        phone = '57' + phone
      }

      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(formattedMessage)}`
      window.open(whatsappUrl, '_blank')
    } catch {
      toast.error('Hubo un error al conectar con las plantillas de WhatsApp.')
    }
  }

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false
      if (!search.trim()) return true
      const s = search.toLowerCase()
      return (
        o.id.toLowerCase().includes(s) ||
        (o.customerName ?? '').toLowerCase().includes(s) ||
        (o.user?.name ?? '').toLowerCase().includes(s) ||
        (o.user?.email ?? '').toLowerCase().includes(s)
      )
    })
  }, [orders, search, statusFilter])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona y actualiza el estado de los pedidos
        </p>
      </div>

      <div
        className="rounded-lg bg-card"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID, cliente o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="PENDING">Recibido</SelectItem>
              <SelectItem value="CONFIRMED">Preparando</SelectItem>
              <SelectItem value="SHIPPED">Enviado</SelectItem>
              <SelectItem value="DELIVERED">Entregado</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground">No hay pedidos.</p>
          </div>
        ) : (
          <div>
            {/* 1. LISTA PARA MÓVIL: Oculta en escritorio, visible en móvil */}
            <div className="sm:hidden p-3">
              {filtered.map((o) => (
                <MobileOrderCard key={o.id} order={o} onNotify={handleWhatsappNotification} />
              ))}
            </div>

            {/* 2. TABLA ESCRITORIO: Oculta en móvil, visible en escritorio */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Pedido</th>
                    <th className="px-4 py-3 text-left">Cliente</th>
                    <th className="px-4 py-3 text-left">Fecha</th>
                    <th className="px-4 py-3 text-right">Items</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => {
                    const items = Array.isArray(o.items) ? o.items : []
                    return (
                      <tr key={o.id} className="border-b last:border-0 hover:bg-secondary/30">
                        <td className="px-4 py-3 font-mono text-xs">#{o.id.slice(-8).toUpperCase()}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{o.customerName ?? o.user?.name ?? 'Invitado'}</p>
                          <p className="text-xs text-muted-foreground">{o.user?.email ?? o.customerPhone ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(o.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">{items.reduce((s, it) => s + (it.quantity ?? 0), 0)}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold">{formatPrice(o.total)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn('inline-block rounded-full px-2.5 py-1 text-xs font-semibold', STATUS_COLOR[o.status])}>
                            {STATUS_LABEL[o.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleWhatsappNotification(o)} className="bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700 rounded-xl gap-1 border-green-200">
                              <MessageSquare className="h-3.5 w-3.5" /> Notificar
                            </Button>
                            <Button asChild size="sm" variant="outline" className="rounded-xl">
                              <Link href={`/admin/orders/${o.id}`}><Eye className="mr-1.5 h-3.5 w-3.5" /> Ver</Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}