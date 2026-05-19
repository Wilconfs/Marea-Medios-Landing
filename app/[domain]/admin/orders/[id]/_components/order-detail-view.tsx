'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Loader2, MessageCircle, User, Phone, Mail, Calendar, AlertTriangle, MessageSquare } from 'lucide-react' // 👈 Añadido MessageSquare
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { OrderTimeline, type OrderStatus } from '@/components/order-timeline'
import { formatPrice } from '@/lib/format'
import { useSession } from 'next-auth/react'

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
  status: OrderStatus
  customerName: string | null
  customerPhone: string | null
  notes: string | null
  whatsappSent: boolean
  createdAt: string
  items: OrderItem[]
  user: { name: string; email: string } | null
}

const STATUS_ORDER: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Recibido',
  CONFIRMED: 'Preparando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

function getAllowedStatuses(current: OrderStatus): OrderStatus[] {
  if (current === 'DELIVERED' || current === 'CANCELLED') return [current]
  const idx = STATUS_ORDER.indexOf(current)
  if (idx === -1) return [current]
  const allowed: OrderStatus[] = [current]
  if (idx < STATUS_ORDER.length - 1) {
    allowed.push(STATUS_ORDER[idx + 1])
  }
  allowed.push('CANCELLED')
  return allowed
}

export function OrderDetailView({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null)
  const { data: session } = useSession()
  const isReadOnly = session?.user?.role === 'AUXILIAR'

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`)
      if (!res.ok) {
        if (res.status === 404) {
          setOrder(null)
          return
        }
        throw new Error()
      }
      const data = await res.json()
      setOrder(data)
    } catch {
      toast.error('No se pudo cargar el pedido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  // 👇 FUNCIÓN LÓGICA DE NOTIFICACIÓN DESDE EL DETALLE
  const handleWhatsappNotification = async () => {
    if (!order) return
    try {
      const res = await fetch('/api/admin/templates')
      if (!res.ok) throw new Error()
      const templates = await res.json()

      const stateMapping: Record<OrderStatus, 'RECIBIDO' | 'PREPARACION' | 'ENVIADO' | 'ENTREGADO' | 'CANCELLED'> = {
        PENDING: 'RECIBIDO',
        CONFIRMED: 'PREPARACION',
        SHIPPED: 'ENVIADO',
        DELIVERED: 'ENTREGADO',
        CANCELLED: 'CANCELLED'
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
      const orderIdShort = order.id.slice(-6).toUpperCase()
      const formattedTotal = formatPrice(order.total)

      const formattedMessage = baseText
        .replace(/{cliente}/g, clientName)
        .replace(/{pedido}/g, orderIdShort)
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

  function requestStatusChange(status: OrderStatus) {
    if (!order || status === order.status) return
    setPendingStatus(status)
  }

  async function confirmStatusChange() {
    if (!order || !pendingStatus) return
    setUpdating(true)
    setPendingStatus(null)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: pendingStatus }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error === 'invalid_transition' ? 'Transición de estado no permitida' : 'No se pudo actualizar')
        return
      }
      toast.success('Estado actualizado')
      setOrder({ ...order, status: pendingStatus })
    } catch {
      toast.error('No se pudo actualizar')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="rounded-lg bg-card p-12 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <p className="text-sm text-muted-foreground">Pedido no encontrado.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a pedidos
          </Link>
        </Button>
      </div>
    )
  }

  const items = Array.isArray(order.items) ? order.items : []
  const allowedStatuses = getAllowedStatuses(order.status)
  const isTerminal = order.status === 'DELIVERED' || order.status === 'CANCELLED'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild size="icon" variant="ghost" className="rounded-xl">
            <Link href="/admin/orders">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Pedido #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleString('es-CO')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* 👇 BOTÓN EN DETALLE DE PEDIDO AÑADIDO AL LADO DEL SELECTOR */}
            <Button
              onClick={handleWhatsappNotification}
              variant="outline"
              className="bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700 rounded-xl gap-1.5 border-green-200"
            >
              <MessageSquare className="h-4 w-4" />
              Notificar Cliente
            </Button>

          <span className="text-sm text-muted-foreground ml-2">Estado:</span>
          <Select
            value={order.status}
            onValueChange={(v) => requestStatusChange(v as OrderStatus)}
            disabled={updating || isTerminal || isReadOnly}
          >
            <SelectTrigger className="w-44 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allowedStatuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isTerminal && (
            <span className="text-xs text-muted-foreground">(Estado final)</span>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div
        className="rounded-lg bg-card p-6"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <h2 className="mb-5 font-display text-base font-semibold">Seguimiento</h2>
        <OrderTimeline status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div
          className="rounded-lg bg-card p-5 lg:col-span-2"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <h2 className="mb-4 font-display text-base font-semibold">Productos</h2>
          <div className="space-y-3">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex items-center gap-3 rounded-md border p-3"
              >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-pink-50 flex items-center justify-center">
                    <Image
                      src={it.imageUrl?.split(',')[0] || '/placeholder.png'} 
                      alt={it.name}
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                      priority
                    />
                  </div>
                <div className="flex-1">
                  <p className="font-medium">{it.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(it.price)} × {it.quantity}
                  </p>
                </div>
                <p className="font-mono font-semibold">
                  {formatPrice(it.price * it.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between border-t pt-4">
            <span className="font-display text-lg font-semibold">Total</span>
            <span className="font-mono text-xl font-bold text-primary">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>

        {/* Customer info */}
        <div
          className="rounded-lg bg-card p-5"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <h2 className="mb-4 font-display text-base font-semibold">Cliente</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Nombre</p>
                <p className="font-medium">
                  {order.customerName ?? order.user?.name ?? 'Invitado'}
                </p>
              </div>
            </div>
            {order.user?.email && (
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{order.user.email}</p>
                </div>
              </div>
            )}
            {order.customerPhone && (
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Celular</p>
                  <p className="font-medium">{order.customerPhone}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Fecha</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleString('es-CO')}
                </p>
              </div>
            </div>
            {order.whatsappSent && (
              <div className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Método</p>
                  <p className="font-medium">Pedido por WhatsApp</p>
                </div>
              </div>
            )}
            {order.notes && (
              <div className="rounded-md bg-secondary p-3">
                <p className="mb-1 text-xs font-semibold text-muted-foreground">
                  Notas
                </p>
                <p className="text-sm">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={!!pendingStatus} onOpenChange={(o) => !o && setPendingStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirmar cambio de estado
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus === 'CANCELLED'
                ? '¿Estás seguro de cancelar este pedido? Esta acción es irreversible y no se podrá reactivar.'
                : `¿Cambiar el estado a "${STATUS_LABELS[pendingStatus!]}"? Este cambio es irreversible, no se podrá volver al estado anterior.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              className={pendingStatus === 'CANCELLED' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              Sí, confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}