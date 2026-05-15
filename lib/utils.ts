/**
 * Genera la URL base de la aplicación.
 * En producción usa NEXT_PUBLIC_APP_URL; en desarrollo usa localhost.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }
  return 'http://localhost:3000'
}

/**
 * Genera la URL de la tarjeta de un cliente.
 */
export function getCardUrl(token: string): string {
  return `${getBaseUrl()}/card/${token}`
}

/**
 * Genera la URL que el admin escanea para sumar un sello.
 */
export function getStampUrl(token: string): string {
  return `${getBaseUrl()}/admin/stamp/${token}`
}

/**
 * Formatea una fecha en español.
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
