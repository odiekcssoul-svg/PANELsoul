import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isToday, isThisWeek, isBefore, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: es })
}

export function formatDateLong(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "dd 'de' MMMM 'de' yyyy", { locale: es })
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

export function isExpired(date: string) {
  return isBefore(parseISO(date), new Date())
}

export function daysUntilRenewal(date: string) {
  return differenceInDays(parseISO(date), new Date())
}

export function isRenewalToday(date: string) {
  return isToday(parseISO(date))
}

export function isRenewalThisWeek(date: string) {
  return isThisWeek(parseISO(date), { locale: es })
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'text-green-400 bg-green-400/10'
    case 'expired': return 'text-red-400 bg-red-400/10'
    case 'suspended': return 'text-yellow-400 bg-yellow-400/10'
    case 'pending': return 'text-yellow-400 bg-yellow-400/10'
    case 'completed': return 'text-green-400 bg-green-400/10'
    case 'overdue': return 'text-red-400 bg-red-400/10'
    case 'inactive': return 'text-gray-400 bg-gray-400/10'
    case 'banned': return 'text-red-400 bg-red-400/10'
    default: return 'text-gray-400 bg-gray-400/10'
  }
}

export function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    active: 'Activo',
    expired: 'Vencido',
    suspended: 'Suspendido',
    pending: 'Pendiente',
    completed: 'Completado',
    overdue: 'Vencido',
    inactive: 'Inactivo',
    banned: 'Baneado',
  }
  return labels[status] || status
}

export const SERVICE_COLORS: Record<string, string> = {
  'Netflix': '#E50914',
  'Prime Video': '#00A8E0',
  'Disney+': '#113CCF',
  'HBO Max': '#5822B4',
  'Spotify': '#1DB954',
  'YouTube Premium': '#FF0000',
  'Crunchyroll': '#F47521',
  'Vix Premium': '#0066CC',
  'Paramount+': '#0064FF',
}

export const SERVICE_ICONS: Record<string, string> = {
  'Netflix': '🎬',
  'Prime Video': '📦',
  'Disney+': '✨',
  'HBO Max': '👑',
  'Spotify': '🎵',
  'YouTube Premium': '▶️',
  'Crunchyroll': '⚡',
  'Vix Premium': '🌟',
  'Paramount+': '⭐',
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

export function generateId() {
  return crypto.randomUUID()
}

// Demo data seed helper
export function generateDemoDate(daysFromNow: number) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().split('T')[0]
}
