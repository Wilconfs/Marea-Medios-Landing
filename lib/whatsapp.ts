import type { CartItem } from '@/lib/cart-store'
import { formatPrice } from '@/lib/format'

export function buildWhatsAppMessage(
  items: CartItem[],
  total: number,
  customerName?: string
): string {
  const safeItems = items ?? []
  const lines: string[] = []
  
  // Mantenemos tus emojis originales que se ven excelentes
  lines.push('✨ *Nuevo Pedido - Tienda Marea*')
  lines.push('')
  if (customerName) {
    lines.push(`👤 *Cliente:* ${customerName}`)
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
  
  // Forzamos el reemplazo de los saltos de línea por el estándar %0A 
  // justo antes de codificar el resto del texto. Esto evita que la versión web se confunda.
  const cleanMessage = message.replace(/\n/g, '%0A')
  
  // Usamos wa.me que es el punto de enlace más compatible a nivel global
  return `https://wa.me/${safePhone}?text=${encodeURIComponent(cleanMessage).replace(/%250A/g, '%0A')}`
}