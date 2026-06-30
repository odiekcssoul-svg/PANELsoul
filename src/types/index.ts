export type UserRole = 'admin' | 'employee'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  created_at: string
}

export interface Client {
  id: string
  name: string
  phone: string
  email: string
  observations?: string
  created_at: string
  updated_at: string
}

export type ServiceType =
  | 'Netflix'
  | 'Prime Video'
  | 'Disney+'
  | 'HBO Max'
  | 'Spotify'
  | 'YouTube Premium'
  | 'Crunchyroll'
  | 'Vix Premium'
  | 'Paramount+'

export type AccountStatus = 'active' | 'expired' | 'suspended'

export interface StreamingAccount {
  id: string
  client_id: string
  client_name?: string
  client_phone?: string
  email: string
  password: string
  service_type: ServiceType
  status: AccountStatus
  start_date: string
  renewal_date: string
  price: number
  counter: number
  account_status: string
  observations?: string
  created_at: string
  updated_at: string
}

export interface Provider {
  id: string
  name: string
  service: ServiceType
  contact: string
  renewal_date: string
  price: number
  status: 'active' | 'inactive'
  observations?: string
  created_at: string
  updated_at: string
}

export interface GmailAccount {
  id: string
  email: string
  password: string
  status: 'active' | 'inactive' | 'banned'
  observations?: string
  created_at: string
  updated_at: string
}

export interface Renewal {
  id: string
  streaming_account_id: string
  client_id: string
  client_name?: string
  service_type: ServiceType
  amount: number
  renewal_date: string
  status: 'pending' | 'completed' | 'overdue'
  notes?: string
  created_at: string
}

export interface Notification {
  id: string
  type: 'renewal' | 'expiration' | 'info' | 'warning'
  title: string
  message: string
  read: boolean
  related_id?: string
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  user_name?: string
  action: string
  entity: string
  entity_id: string
  details?: string
  created_at: string
}

export interface DashboardStats {
  totalClients: number
  activeAccounts: number
  expiredAccounts: number
  todayRenewals: number
  weekRenewals: number
  monthlyRevenue: number
  revenueByMonth: { month: string; revenue: number }[]
  serviceDistribution: { name: string; value: number; color: string }[]
}

export type TransactionType = 'income' | 'expense'

export type IncomeCategory = 'renewal' | 'new_account' | 'other_income'
export type ExpenseCategory = 'provider' | 'tools' | 'services' | 'other_expense'
export type TransactionCategory = IncomeCategory | ExpenseCategory

export const INCOME_CATEGORIES: { value: IncomeCategory; label: string }[] = [
  { value: 'renewal',     label: '🔄 Renovación de cuenta' },
  { value: 'new_account', label: '✨ Cuenta nueva' },
  { value: 'other_income',label: '💰 Otro ingreso' },
]

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'provider',      label: '🏭 Pago a proveedor' },
  { value: 'tools',         label: '🛠️ Herramientas / Software' },
  { value: 'services',      label: '📡 Servicios' },
  { value: 'other_expense', label: '📦 Otro gasto' },
]

export const PAYMENT_METHODS = [
  'Efectivo', 'Transferencia', 'OXXO', 'Arcus', 'PayPal', 'Otro',
]

export interface Settings {
  id?: string
  owner_id?: string
  business_name: string
  whatsapp_number: string
  bank_name: string
  bank_clabe: string
  msg_renewal: string
  msg_expired: string
}

export const DEFAULT_SETTINGS: Settings = {
  business_name: 'Soul Streaming',
  whatsapp_number: '',
  bank_name: 'Arcus',
  bank_clabe: '',
  msg_renewal: `Hola {nombre}.\n\nTe recordamos que tu servicio está próximo a vencer.\n\n{emoji} Servicio: {servicio}\n📧 Correo: {correo}\n\n📅 Fecha de renovación: {fecha}\n💰 Importe: ${'{precio}'}\n\n🏦 Banco: {banco}\nCLABE: {clabe}\n\nUna vez realizado el pago comparte tu comprobante para registrar tu renovación.\n\nGracias por tu preferencia.\n{negocio}`,
  msg_expired: `Hola {nombre}.\n\nDetectamos que tu servicio ya venció.\n\n{emoji} Servicio: {servicio}\n📧 Correo: {correo}\n\n💰 Importe de renovación: ${'{precio}'}\n\n🏦 Banco: {banco}\nCLABE: {clabe}\n\nPor favor comparte tu comprobante para reactivar tu servicio.\n\nGracias por tu preferencia.\n{negocio}`,
}

export interface Transaction {
  id: string
  type: TransactionType
  category: TransactionCategory
  description: string
  amount: number
  date: string
  client_id?: string
  client_name?: string
  streaming_account_id?: string
  service_type?: string
  provider_id?: string
  payment_method: string
  notes?: string
  created_at: string
  updated_at: string
}

// ── Gift Center ───────────────────────────────────────────────────────────────

export interface GiftCode {
  id: string
  owner_id?: string
  name: string
  code: string
  product: string
  description?: string
  start_date: string
  expiry_date?: string
  max_redemptions: number
  max_per_user: number
  redemption_count: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface GiftInventory {
  id: string
  owner_id?: string
  gift_code_id?: string
  product: string
  email: string
  password: string
  pin?: string
  status: 'available' | 'delivered' | 'suspended'
  delivered_to?: string
  delivered_at?: string
  created_at: string
}

export interface GiftClient {
  id: string
  owner_id?: string
  name: string
  phone: string
  email?: string
  ip_address?: string
  country?: string
  city?: string
  device?: string
  browser?: string
  os?: string
  tags: string[]
  notes?: string
  created_at: string
  last_seen: string
}

export interface GiftRedemption {
  id: string
  owner_id?: string
  client_id: string
  gift_code_id?: string
  inventory_id?: string
  code_used: string
  product?: string
  account_email?: string
  account_password?: string
  account_pin?: string
  ip_address?: string
  country?: string
  city?: string
  browser?: string
  device?: string
  status: 'completed' | 'failed' | 'pending'
  redeemed_at: string
}
