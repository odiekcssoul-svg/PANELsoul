import { Client, StreamingAccount, Provider, GmailAccount, Renewal, Notification, User } from '@/types'
import { generateDemoDate } from './utils'

export const DEMO_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Admin',
    email: 'admin@streamadmin.com',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    name: 'Empleado',
    email: 'empleado@streamadmin.com',
    role: 'employee',
    created_at: '2024-01-15T00:00:00Z',
  },
]

export const DEMO_CLIENTS: Client[] = [
  { id: 'c1', name: 'María García', phone: '555-1001', email: 'maria@email.com', observations: 'Cliente frecuente', created_at: '2024-01-10T00:00:00Z', updated_at: '2024-01-10T00:00:00Z' },
  { id: 'c2', name: 'Juan López', phone: '555-1002', email: 'juan@email.com', observations: '', created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' },
  { id: 'c3', name: 'Ana Martínez', phone: '555-1003', email: 'ana@email.com', observations: 'Prefiere WhatsApp', created_at: '2024-02-01T00:00:00Z', updated_at: '2024-02-01T00:00:00Z' },
  { id: 'c4', name: 'Carlos Rodríguez', phone: '555-1004', email: 'carlos@email.com', observations: '', created_at: '2024-02-10T00:00:00Z', updated_at: '2024-02-10T00:00:00Z' },
  { id: 'c5', name: 'Laura Sánchez', phone: '555-1005', email: 'laura@email.com', observations: 'Descuento especial 10%', created_at: '2024-02-20T00:00:00Z', updated_at: '2024-02-20T00:00:00Z' },
  { id: 'c6', name: 'Pedro Jiménez', phone: '555-1006', email: 'pedro@email.com', observations: '', created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-01T00:00:00Z' },
  { id: 'c7', name: 'Sofía Torres', phone: '555-1007', email: 'sofia@email.com', observations: 'VIP', created_at: '2024-03-15T00:00:00Z', updated_at: '2024-03-15T00:00:00Z' },
  { id: 'c8', name: 'Diego Flores', phone: '555-1008', email: 'diego@email.com', observations: '', created_at: '2024-04-01T00:00:00Z', updated_at: '2024-04-01T00:00:00Z' },
]

export const DEMO_ACCOUNTS: StreamingAccount[] = [
  { id: 'a1', client_id: 'c1', client_name: 'María García', client_phone: '555-1001', email: 'netflix1@mail.com', password: 'Pass123!', service_type: 'Netflix', status: 'active', start_date: '2024-05-01', renewal_date: generateDemoDate(0), price: 180, counter: 3, account_status: 'Premium', observations: '', created_at: '2024-05-01T00:00:00Z', updated_at: '2024-05-01T00:00:00Z' },
  { id: 'a2', client_id: 'c2', client_name: 'Juan López', client_phone: '555-1002', email: 'spotify1@mail.com', password: 'Spot456@', service_type: 'Spotify', status: 'active', start_date: '2024-05-15', renewal_date: generateDemoDate(1), price: 99, counter: 1, account_status: 'Individual', observations: '', created_at: '2024-05-15T00:00:00Z', updated_at: '2024-05-15T00:00:00Z' },
  { id: 'a3', client_id: 'c3', client_name: 'Ana Martínez', client_phone: '555-1003', email: 'disney1@mail.com', password: 'Disney789#', service_type: 'Disney+', status: 'active', start_date: '2024-04-01', renewal_date: generateDemoDate(3), price: 159, counter: 2, account_status: 'Estándar', observations: 'Comparte con familia', created_at: '2024-04-01T00:00:00Z', updated_at: '2024-04-01T00:00:00Z' },
  { id: 'a4', client_id: 'c4', client_name: 'Carlos Rodríguez', client_phone: '555-1004', email: 'hbo1@mail.com', password: 'Hbo101!', service_type: 'HBO Max', status: 'expired', start_date: '2024-03-01', renewal_date: generateDemoDate(-5), price: 149, counter: 1, account_status: 'Básico', observations: '', created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-01T00:00:00Z' },
  { id: 'a5', client_id: 'c5', client_name: 'Laura Sánchez', client_phone: '555-1005', email: 'prime1@mail.com', password: 'Prime202@', service_type: 'Prime Video', status: 'active', start_date: '2024-05-20', renewal_date: generateDemoDate(7), price: 99, counter: 1, account_status: 'Normal', observations: '', created_at: '2024-05-20T00:00:00Z', updated_at: '2024-05-20T00:00:00Z' },
  { id: 'a6', client_id: 'c6', client_name: 'Pedro Jiménez', client_phone: '555-1006', email: 'crunch1@mail.com', password: 'Crunch303#', service_type: 'Crunchyroll', status: 'active', start_date: '2024-05-10', renewal_date: generateDemoDate(14), price: 79, counter: 1, account_status: 'Premium', observations: 'Anime fan', created_at: '2024-05-10T00:00:00Z', updated_at: '2024-05-10T00:00:00Z' },
  { id: 'a7', client_id: 'c7', client_name: 'Sofía Torres', client_phone: '555-1007', email: 'yt1@mail.com', password: 'YT404!', service_type: 'YouTube Premium', status: 'active', start_date: '2024-04-15', renewal_date: generateDemoDate(2), price: 129, counter: 1, account_status: 'Individual', observations: '', created_at: '2024-04-15T00:00:00Z', updated_at: '2024-04-15T00:00:00Z' },
  { id: 'a8', client_id: 'c8', client_name: 'Diego Flores', client_phone: '555-1008', email: 'vix1@mail.com', password: 'Vix505@', service_type: 'Vix Premium', status: 'expired', start_date: '2024-03-20', renewal_date: generateDemoDate(-10), price: 89, counter: 1, account_status: 'Plus', observations: '', created_at: '2024-03-20T00:00:00Z', updated_at: '2024-03-20T00:00:00Z' },
  { id: 'a9', client_id: 'c1', client_name: 'María García', client_phone: '555-1001', email: 'param1@mail.com', password: 'Param606#', service_type: 'Paramount+', status: 'active', start_date: '2024-05-25', renewal_date: generateDemoDate(20), price: 119, counter: 1, account_status: 'Essential', observations: '', created_at: '2024-05-25T00:00:00Z', updated_at: '2024-05-25T00:00:00Z' },
]

export const DEMO_PROVIDERS: Provider[] = [
  { id: 'p1', name: 'StreamPro MX', service: 'Netflix', contact: '555-2001', renewal_date: generateDemoDate(15), price: 1200, status: 'active', observations: 'Mayoreo x10 cuentas', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'p2', name: 'DigitalSub', service: 'Spotify', contact: '555-2002', renewal_date: generateDemoDate(5), price: 800, status: 'active', observations: '', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'p3', name: 'MediaPlus', service: 'Disney+', contact: '555-2003', renewal_date: generateDemoDate(-3), price: 950, status: 'inactive', observations: 'Renovación pendiente', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'p4', name: 'NetAccess', service: 'HBO Max', contact: '555-2004', renewal_date: generateDemoDate(30), price: 1100, status: 'active', observations: '', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
]

export const DEMO_GMAIL: GmailAccount[] = [
  { id: 'g1', email: 'cuenta.stream1@gmail.com', password: 'Gmail123!', status: 'active', observations: 'Usada para Netflix', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'g2', email: 'cuenta.stream2@gmail.com', password: 'Gmail456@', status: 'active', observations: 'Usada para Spotify', created_at: '2024-01-05T00:00:00Z', updated_at: '2024-01-05T00:00:00Z' },
  { id: 'g3', email: 'cuenta.stream3@gmail.com', password: 'Gmail789#', status: 'inactive', observations: 'Desactivada temporalmente', created_at: '2024-01-10T00:00:00Z', updated_at: '2024-01-10T00:00:00Z' },
  { id: 'g4', email: 'cuenta.stream4@gmail.com', password: 'Gmail101!', status: 'banned', observations: 'Cuenta bloqueada por Google', created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' },
]

export const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'renewal', title: 'Renovación hoy', message: 'María García - Netflix vence hoy', read: false, related_id: 'a1', created_at: new Date().toISOString() },
  { id: 'n2', type: 'renewal', title: 'Renovación mañana', message: 'Juan López - Spotify vence mañana', read: false, related_id: 'a2', created_at: new Date().toISOString() },
  { id: 'n3', type: 'expiration', title: 'Cuenta vencida', message: 'Carlos Rodríguez - HBO Max venció hace 5 días', read: false, related_id: 'a4', created_at: new Date().toISOString() },
  { id: 'n4', type: 'expiration', title: 'Cuenta vencida', message: 'Diego Flores - Vix Premium venció hace 10 días', read: true, related_id: 'a8', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'n5', type: 'info', title: 'Nuevo cliente', message: 'Diego Flores fue registrado como nuevo cliente', read: true, created_at: new Date(Date.now() - 172800000).toISOString() },
]
