'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Loader2, Search, Eye } from 'lucide-react'
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
          <div className="overflow-x-auto">
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
                      <td className="px-4 py-3 font-mono text-xs">
                        #{o.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">
                          {o.customerName ?? o.user?.name ?? 'Invitado'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {o.user?.email ?? o.customerPhone ?? '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {items.reduce((s, it) => s + (it.quantity ?? 0), 0)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold">
                        {formatPrice(o.total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            'inline-block rounded-full px-2.5 py-1 text-xs font-semibold',
                            STATUS_COLOR[o.status],
                          )}
                        >
                          {STATUS_LABEL[o.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/orders/${o.id}`}>
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            Ver
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
