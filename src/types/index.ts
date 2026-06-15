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
