'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/lib/cart-store'
import { formatPrice } from '@/lib/format'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp'
import { toast } from 'sonner'

export function CartView({ whatsappNumber }: { whatsappNumber: string }) {
  const { data: session } = useSession() || {}
  const items = useCart((s) => s?.items ?? [])
  const hasHydrated = useCart((s) => s?.hasHydrated)
  const updateQuantity = useCart((s) => s?.updateQuantity)
  const removeItem = useCart((s) => s?.removeItem)
  const clear = useCart((s) => s?.clear)

  const [submitting, setSubmitting] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  const subtotal = (items ?? []).reduce(
    (sum, i) => sum + (i?.price ?? 0) * (i?.quantity ?? 0),
    0
  )
  const totalQty = (items ?? []).reduce(
    (sum, i) => sum + (i?.quantity ?? 0),
    0
  )

  const handleCheckout = async () => {
    if (!items || items.length === 0) return

    // Validar campos obligatorios
    if (!customerName.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }
    if (!customerPhone.trim()) {
      toast.error('El celular es obligatorio')
      return
    }

    const finalName = customerName.trim()
    setSubmitting(true)
    try {
      // Save the order to DB
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i?.id,
            name: i?.name,
            price: i?.price,
            quantity: i?.quantity,
            imageUrl: i?.imageUrl,
          })),
          total: subtotal,
          customerName: finalName || undefined,
          customerPhone: customerPhone.trim() || undefined,
          whatsappSent: true,
        }),
      })

      const message = buildWhatsAppMessage(items, subtotal, finalName)
      const url = buildWhatsAppUrl(whatsappNumber, message)
      window.open(url, '_blank', 'noopener,noreferrer')
      toast.success('Abriendo WhatsApp...', {
        description: 'Confirma tu pedido en el chat.',
      })
      setTimeout(() => clear?.(), 1200)
    } catch (err) {
      console.error(err)
      toast.error('No se pudo procesar el pedido')
    } finally {
      setSubmitting(false)
    }
  }

  if (!hasHydrated) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-48 rounded-md bg-muted" />
        <div className="h-64 rounded-lg bg-muted" />
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg bg-card p-12 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShoppingBag className="h-8 w-8" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
          Tu carrito está vacío
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Agrega productos a tu carrito para continuar con tu compra.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/">
            Ver productos <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Mi carrito
        </h1>
        <p className="text-sm text-muted-foreground">
          {totalQty} producto{totalQty === 1 ? '' : 's'} en tu carrito
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {(items ?? []).map((item) => (
              <motion.div
                key={item?.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex gap-3 rounded-lg bg-card p-3 sm:gap-4 sm:p-4"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <Link
                  href={`/products/${item?.id ?? ''}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted sm:h-28 sm:w-28"
                >
                  {item?.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item?.name ?? ''}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : null}
                </Link>
                <div className="flex flex-1 flex-col justify-between gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${item?.id ?? ''}`}
                      className="line-clamp-2 text-sm font-medium hover:text-primary sm:text-base"
                    >
                      {item?.name ?? ''}
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeItem?.(item?.id ?? '')}
                      aria-label="Eliminar"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center rounded-md border border-input bg-background">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          updateQuantity?.(
                            item?.id ?? '',
                            Math.max(1, (item?.quantity ?? 1) - 1)
                          )
                        }
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="min-w-9 text-center font-mono text-sm">
                        {item?.quantity ?? 0}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          updateQuantity?.(
                            item?.id ?? '',
                            (item?.quantity ?? 0) + 1
                          )
                        }
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-primary">
                        {formatPrice(
                          (item?.price ?? 0) * (item?.quantity ?? 0)
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatPrice(item?.price ?? 0)} c/u
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="flex justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={() => clear?.()}>
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Vaciar carrito
            </Button>
          </div>
        </div>

        {/* Summary */}
        <aside
          className="sticky top-20 h-fit space-y-4 rounded-lg bg-card p-5"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <h2 className="font-display text-lg font-bold">Resumen del pedido</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Productos</span>
              <span>{totalQty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span className="text-emerald-600">A coordinar</span>
            </div>
            <div className="my-2 border-t border-border" />
            <div className="flex items-baseline justify-between">
              <span className="font-display font-semibold">Total</span>
              <span className="font-display text-2xl font-extrabold text-primary">
                {formatPrice(subtotal)}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div>
              <Label htmlFor="customer-name" className="text-xs">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customer-name"
                placeholder="Nombre completo"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="customer-phone" className="text-xs">
                Celular <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customer-phone"
                type="tel"
                placeholder="Ingrese número"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <Button
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={handleCheckout}
            disabled={submitting}
            loading={submitting}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Pedir por WhatsApp
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Te abriremos WhatsApp con tu pedido listo para enviar.
          </p>
        </aside>
      </div>
    </div>
  )
}
