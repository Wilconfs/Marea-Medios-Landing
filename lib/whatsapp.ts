import type { CartItem } from '@/lib/cart-store'
import { formatPrice } from '@/lib/format'

export function buildWhatsAppMessage(
  items: CartItem[],
  total: number,
  customerName?: string
): string {
  const safeItems = items ?? []
  const lines: string[] = []
  lines.push('✨ *Nuevo Pedido - EcomDash*')
  lines.push('')
  if (customerName) {
    lines.push(`👤 Cliente: ${customerName}`)
    lines.push('')
  }
  lines.push('🛍️ *Productos:*')
  safeItems.forEach((item, idx) => {
    const lineTotal = (item?.price ?? 0) * (item?.quantity ?? 0)
    lines.push(
      `${idx + 1}. ${item?.name ?? ''} ×${item?.quantity ?? 0} — ${formatPrice(lineTotal)}`
    )
  })
  lines.push('')
  lines.push(`💰 *Total: ${formatPrice(total)}*`)
  lines.push('')
  lines.push('Por favor conﬁrmar disponibilidad y forma de envío. ¡Gracias!')
  return lines.join('\n')
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const safePhone = (phone ?? '').replace(/\D/g, '') || '573001234567'
  return `https://wa.me/${safePhone}?text=${encodeURIComponent(message)}`
}
