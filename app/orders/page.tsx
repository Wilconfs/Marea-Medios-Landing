import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OrderTimeline, type OrderStatus } from '@/components/order-timeline'
import { getCurrentSession } from '@/lib/auth-helpers'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function MyOrdersPage() {
  const session = await getCurrentSession()
  if (!session?.user?.id) redirect('/login?callbackUrl=/orders')

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Mis pedidos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sigue el estado de tus compras
        </p>
      </div>

      {orders.length === 0 ? (
        <div
          className="rounded-lg bg-card p-12 text-center"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-display text-lg font-semibold">
            Aún no tienes pedidos
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Explora la tienda y haz tu primera compra.
          </p>
          <Button asChild className="mt-4">
            <Link href="/">Ir a la tienda</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((o) => {
            const items = Array.isArray(o.items) ? (o.items as any[]) : []
            return (
              <div
                key={o.id}
                className="rounded-lg bg-card p-5 sm:p-6"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="mb-5 flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">
                      Pedido #{o.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="font-display text-base font-semibold">
                      {new Date(o.createdAt).toLocaleString('es-CO', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {items.length} producto{items.length !== 1 ? 's' : ''}
                    </p>
                    <p className="font-mono text-lg font-bold text-primary">
                      {formatPrice(o.total)}
                    </p>
                  </div>
                </div>
                <OrderTimeline status={o.status as OrderStatus} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
