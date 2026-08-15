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

export const DEFAULT_SERVICES = [
  'Netflix', 'Prime Video', 'Disney+', 'HBO Max', 'Spotify',
  'YouTube Premium', 'Crunchyroll', 'Vix Premium', 'Paramount+',
]

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

export const DEFAULT_CUSTOM_ICON = '📺'
export const DEFAULT_CUSTOM_COLOR = '#6366F1'

export interface CustomService {
  name: string
  icon: string
  color: string
}

const STORAGE_KEY = 'panelsoul_custom_services'

export function getCustomServices(): CustomService[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCustomServices(services: CustomService[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services))
}

export function getAllServices(): string[] {
  const custom = getCustomServices().map(s => s.name)
  return [...DEFAULT_SERVICES, ...custom]
}

export function getServiceIcon(name: string): string {
  return SERVICE_ICONS[name] ?? getCustomServices().find(s => s.name === name)?.icon ?? DEFAULT_CUSTOM_ICON
}

export function getServiceColor(name: string): string {
  return SERVICE_COLORS[name] ?? getCustomServices().find(s => s.name === name)?.color ?? DEFAULT_CUSTOM_COLOR
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
