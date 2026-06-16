import { Settings, DEFAULT_SETTINGS } from '@/types'

const SERVICE_EMOJI: Record<string, string> = {
  'Spotify': '🎵',
  'YouTube Premium': '▶️',
  'Disney+': '🏰',
  'HBO Max': '👑',
  'Prime Video': '📦',
  'Netflix': '🎬',
  'Crunchyroll': '⚡',
  'Vix Premium': '🌟',
  'Paramount+': '⭐',
}

interface WaParams {
  clientName: string
  clientPhone: string
  serviceType: string
  email: string
  renewalDate: string   // formato dd/MM/yyyy
  price: number
  isExpired: boolean
  settings?: Settings
}

export function buildWhatsAppLink(params: WaParams): string {
  const {
    clientName, clientPhone, serviceType,
    email, renewalDate, price, isExpired,
    settings = DEFAULT_SETTINGS,
  } = params

  const phone = clientPhone.replace(/\D/g, '')
  const num = phone.length === 10 ? `52${phone}` : phone
  if (!num || num.length < 11) return ''

  const emoji = SERVICE_EMOJI[serviceType] || '📺'

  const template = isExpired ? settings.msg_expired : settings.msg_renewal

  const msg = template
    .replace(/{nombre}/g,  clientName)
    .replace(/{emoji}/g,   emoji)
    .replace(/{servicio}/g, serviceType)
    .replace(/{correo}/g,  email)
    .replace(/{fecha}/g,   renewalDate)
    .replace(/\$\{precio\}/g, String(price))
    .replace(/{precio}/g,  String(price))
    .replace(/{banco}/g,   settings.bank_name)
    .replace(/{clabe}/g,   settings.bank_clabe)
    .replace(/{negocio}/g, settings.business_name)

  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
}
