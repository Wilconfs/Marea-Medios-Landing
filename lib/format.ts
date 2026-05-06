export function formatPrice(value: number, currency: string = 'COP'): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '$0'
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `$${Math.round(value).toLocaleString('es-CO')}`
  }
}

export function formatNumber(value: number): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '0'
  return new Intl.NumberFormat('es-CO').format(value)
}
