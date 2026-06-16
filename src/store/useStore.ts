import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import {
  User, Client, StreamingAccount, Provider, GmailAccount,
  Notification, ActivityLog, Transaction, Settings, DEFAULT_SETTINGS,
} from '@/types'

interface AppState {
  // Auth
  currentUser: User | null
  isAuthenticated: boolean
  authLoading: boolean
  login: (email: string, password: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  initAuth: () => Promise<void>

  // Data
  clients: Client[]
  accounts: StreamingAccount[]
  providers: Provider[]
  gmailAccounts: GmailAccount[]
  notifications: Notification[]
  activityLog: ActivityLog[]
  transactions: Transaction[]
  dataLoading: boolean

  // Loaders
  fetchClients: () => Promise<void>
  fetchAccounts: () => Promise<void>
  fetchProviders: () => Promise<void>
  fetchGmail: () => Promise<void>
  fetchNotifications: () => Promise<void>
  fetchActivityLog: () => Promise<void>
  fetchTransactions: () => Promise<void>
  fetchAll: () => Promise<void>

  // Client CRUD
  addClient: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateClient: (id: string, data: Partial<Client>) => Promise<void>
  deleteClient: (id: string) => Promise<void>

  // Account CRUD
  addAccount: (account: Omit<StreamingAccount, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateAccount: (id: string, data: Partial<StreamingAccount>) => Promise<void>
  deleteAccount: (id: string) => Promise<void>
  renewAccount: (id: string, newDate: string) => Promise<void>

  // Provider CRUD
  addProvider: (provider: Omit<Provider, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateProvider: (id: string, data: Partial<Provider>) => Promise<void>
  deleteProvider: (id: string) => Promise<void>

  // Gmail CRUD
  addGmail: (gmail: Omit<GmailAccount, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateGmail: (id: string, data: Partial<GmailAccount>) => Promise<void>
  deleteGmail: (id: string) => Promise<void>

  // Notifications
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  addNotification: (notif: Omit<Notification, 'id' | 'created_at'>) => Promise<void>

  // Activity
  logActivity: (action: string, entity: string, entityId: string, details?: string) => Promise<void>

  // Transactions
  addTransaction: (t: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>

  // Settings
  settings: Settings
  fetchSettings: () => Promise<void>
  saveSettings: (data: Partial<Settings>) => Promise<void>
}

// ── Helper: obtener owner_id del usuario actual ───────────────────────────────
function getOwnerId(get: () => AppState): string | null {
  return get().currentUser?.id ?? null
}

export const useStore = create<AppState>()((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  authLoading: true,

  clients: [],
  accounts: [],
  providers: [],
  gmailAccounts: [],
  notifications: [],
  activityLog: [],
  transactions: [],
  settings: DEFAULT_SETTINGS,
  dataLoading: false,

  // ─── AUTH ────────────────────────────────────────────────────────────────

  initAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const user: User = {
        id: session.user.id,
        name: session.user.email?.split('@')[0] ?? 'Admin',
        email: session.user.email ?? '',
        role: 'admin',
        created_at: session.user.created_at,
      }
      set({ currentUser: user, isAuthenticated: true, authLoading: false })
      await get().fetchAll()
    } else {
      set({ authLoading: false })
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        set({
          currentUser: null, isAuthenticated: false,
          clients: [], accounts: [], providers: [],
          gmailAccounts: [], notifications: [], activityLog: [], transactions: [],
        })
      }
    })
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return { error: 'No se pudo obtener la sesión' }

    const user: User = {
      id: session.user.id,
      name: email.split('@')[0],
      email,
      role: 'admin',
      created_at: session.user.created_at,
    }
    set({ currentUser: user, isAuthenticated: true })
    await get().fetchAll()
    return { error: null }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({
      currentUser: null, isAuthenticated: false,
      clients: [], accounts: [], providers: [],
      gmailAccounts: [], notifications: [], activityLog: [], transactions: [],
    })
  },

  // ─── FETCHERS — RLS filtra automáticamente por owner_id ──────────────────
  // No necesitamos .eq('owner_id', uid) porque RLS lo hace en Supabase

  fetchAll: async () => {
    set({ dataLoading: true })
    await Promise.all([
      get().fetchClients(),
      get().fetchAccounts(),
      get().fetchProviders(),
      get().fetchGmail(),
      get().fetchNotifications(),
      get().fetchActivityLog(),
      get().fetchTransactions(),
      get().fetchSettings(),
    ])
    set({ dataLoading: false })
  },

  fetchClients: async () => {
    const { data } = await supabase
      .from('clients').select('*').order('created_at', { ascending: false })
    if (data) set({ clients: data as Client[] })
  },

  fetchAccounts: async () => {
    const { data } = await supabase
      .from('streaming_accounts')
      .select('*, clients:client_id (name, phone)')
      .order('created_at', { ascending: false })
    if (data) {
      const accounts = data.map((a: any) => ({
        ...a,
        client_name: a.clients?.name ?? '',
        client_phone: a.clients?.phone ?? '',
        clients: undefined,
      }))
      set({ accounts: accounts as StreamingAccount[] })
    }
  },

  fetchProviders: async () => {
    const { data } = await supabase
      .from('providers').select('*').order('created_at', { ascending: false })
    if (data) set({ providers: data as Provider[] })
  },

  fetchGmail: async () => {
    const { data } = await supabase
      .from('gmail_accounts').select('*').order('created_at', { ascending: false })
    if (data) set({ gmailAccounts: data as GmailAccount[] })
  },

  fetchNotifications: async () => {
    const { data } = await supabase
      .from('notifications').select('*')
      .order('created_at', { ascending: false }).limit(50)
    if (data) set({ notifications: data as Notification[] })
  },

  fetchActivityLog: async () => {
    const { data } = await supabase
      .from('activity_log').select('*')
      .order('created_at', { ascending: false }).limit(100)
    if (data) set({ activityLog: data as ActivityLog[] })
  },

  fetchTransactions: async () => {
    const { data } = await supabase
      .from('transactions').select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    if (data) set({ transactions: data as Transaction[] })
  },

  // ─── CLIENTS ─────────────────────────────────────────────────────────────

  addClient: async (data) => {
    const owner_id = getOwnerId(get)
    const { data: row, error } = await supabase
      .from('clients').insert({ ...data, owner_id }).select().single()
    if (!error && row) {
      set(s => ({ clients: [row as Client, ...s.clients] }))
      await get().logActivity('create', 'client', row.id, `Cliente ${data.name} creado`)
    }
  },

  updateClient: async (id, data) => {
    const { data: row, error } = await supabase
      .from('clients').update(data).eq('id', id).select().single()
    if (!error && row) {
      set(s => ({ clients: s.clients.map(c => c.id === id ? row as Client : c) }))
      await get().logActivity('update', 'client', id, 'Cliente actualizado')
    }
  },

  deleteClient: async (id) => {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (!error) {
      set(s => ({ clients: s.clients.filter(c => c.id !== id) }))
      await get().logActivity('delete', 'client', id, 'Cliente eliminado')
    }
  },

  // ─── ACCOUNTS ────────────────────────────────────────────────────────────

  addAccount: async (data) => {
    const owner_id = getOwnerId(get)
    const { client_name, client_phone, ...insertData } = data as any
    const { data: row, error } = await supabase
      .from('streaming_accounts')
      .insert({ ...insertData, owner_id })
      .select('*, clients:client_id (name, phone)').single()
    if (!error && row) {
      const account = {
        ...row,
        client_name: (row as any).clients?.name ?? client_name ?? '',
        client_phone: (row as any).clients?.phone ?? client_phone ?? '',
        clients: undefined,
      }
      set(s => ({ accounts: [account as StreamingAccount, ...s.accounts] }))
      await get().logActivity('create', 'account', row.id, `Cuenta ${data.service_type} creada`)
    }
  },

  updateAccount: async (id, data) => {
    const { client_name, client_phone, ...updateData } = data as any
    const { data: row, error } = await supabase
      .from('streaming_accounts').update(updateData).eq('id', id)
      .select('*, clients:client_id (name, phone)').single()
    if (!error && row) {
      const account = {
        ...row,
        client_name: (row as any).clients?.name ?? '',
        client_phone: (row as any).clients?.phone ?? '',
        clients: undefined,
      }
      set(s => ({ accounts: s.accounts.map(a => a.id === id ? account as StreamingAccount : a) }))
      await get().logActivity('update', 'account', id, 'Cuenta actualizada')
    }
  },

  deleteAccount: async (id) => {
    const { error } = await supabase.from('streaming_accounts').delete().eq('id', id)
    if (!error) {
      set(s => ({ accounts: s.accounts.filter(a => a.id !== id) }))
      await get().logActivity('delete', 'account', id, 'Cuenta eliminada')
    }
  },

  renewAccount: async (id, newDate) => {
    const { data: row, error } = await supabase
      .from('streaming_accounts')
      .update({ renewal_date: newDate, status: 'active' }).eq('id', id)
      .select('*, clients:client_id (name, phone)').single()
    if (!error && row) {
      const account = {
        ...row,
        client_name: (row as any).clients?.name ?? '',
        client_phone: (row as any).clients?.phone ?? '',
        clients: undefined,
      }
      set(s => ({ accounts: s.accounts.map(a => a.id === id ? account as StreamingAccount : a) }))
      await get().addNotification({
        type: 'renewal', title: 'Cuenta renovada',
        message: `Cuenta renovada hasta ${newDate}`, read: false, related_id: id,
      })
      await get().logActivity('renew', 'account', id, `Cuenta renovada hasta ${newDate}`)
    }
  },

  // ─── PROVIDERS ───────────────────────────────────────────────────────────

  addProvider: async (data) => {
    const owner_id = getOwnerId(get)
    const { data: row, error } = await supabase
      .from('providers').insert({ ...data, owner_id }).select().single()
    if (!error && row) {
      set(s => ({ providers: [row as Provider, ...s.providers] }))
      await get().logActivity('create', 'provider', row.id, `Proveedor ${data.name} creado`)
    }
  },

  updateProvider: async (id, data) => {
    const { data: row, error } = await supabase
      .from('providers').update(data).eq('id', id).select().single()
    if (!error && row)
      set(s => ({ providers: s.providers.map(p => p.id === id ? row as Provider : p) }))
  },

  deleteProvider: async (id) => {
    const { error } = await supabase.from('providers').delete().eq('id', id)
    if (!error) set(s => ({ providers: s.providers.filter(p => p.id !== id) }))
  },

  // ─── GMAIL ───────────────────────────────────────────────────────────────

  addGmail: async (data) => {
    const owner_id = getOwnerId(get)
    const { data: row, error } = await supabase
      .from('gmail_accounts').insert({ ...data, owner_id }).select().single()
    if (!error && row) {
      set(s => ({ gmailAccounts: [row as GmailAccount, ...s.gmailAccounts] }))
      await get().logActivity('create', 'gmail', row.id, `Gmail ${data.email} creado`)
    }
  },

  updateGmail: async (id, data) => {
    const { data: row, error } = await supabase
      .from('gmail_accounts').update(data).eq('id', id).select().single()
    if (!error && row)
      set(s => ({ gmailAccounts: s.gmailAccounts.map(g => g.id === id ? row as GmailAccount : g) }))
  },

  deleteGmail: async (id) => {
    const { error } = await supabase.from('gmail_accounts').delete().eq('id', id)
    if (!error) set(s => ({ gmailAccounts: s.gmailAccounts.filter(g => g.id !== id) }))
  },

  // ─── NOTIFICATIONS ───────────────────────────────────────────────────────

  markNotificationRead: async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) }))
  },

  markAllNotificationsRead: async () => {
    await supabase.from('notifications').update({ read: true })
    set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) }))
  },

  addNotification: async (data) => {
    const owner_id = getOwnerId(get)
    const { data: row } = await supabase
      .from('notifications')
      .insert({ ...data, owner_id, user_id: owner_id })
      .select().single()
    if (row) set(s => ({ notifications: [row as Notification, ...s.notifications] }))
  },

  // ─── ACTIVITY ────────────────────────────────────────────────────────────

  logActivity: async (action, entity, entityId, details) => {
    const { currentUser } = get()
    const owner_id = currentUser?.id ?? null
    const { data: row } = await supabase
      .from('activity_log')
      .insert({
        owner_id,
        user_id: owner_id,
        user_name: currentUser?.name ?? 'Sistema',
        action, entity, entity_id: entityId, details,
      })
      .select().single()
    if (row) set(s => ({ activityLog: [row as ActivityLog, ...s.activityLog.slice(0, 99)] }))
  },

  // ─── TRANSACTIONS ─────────────────────────────────────────────────────────

  addTransaction: async (data) => {
    const owner_id = getOwnerId(get)
    const { data: row, error } = await supabase
      .from('transactions').insert({ ...data, owner_id }).select().single()
    if (!error && row) {
      set(s => ({ transactions: [row as Transaction, ...s.transactions] }))
      await get().logActivity('create', 'transaction', row.id,
        `${data.type === 'income' ? 'Ingreso' : 'Gasto'}: ${data.description} $${data.amount}`)
    }
  },

  updateTransaction: async (id, data) => {
    const { data: row, error } = await supabase
      .from('transactions').update(data).eq('id', id).select().single()
    if (!error && row)
      set(s => ({ transactions: s.transactions.map(t => t.id === id ? row as Transaction : t) }))
  },

  deleteTransaction: async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) {
      set(s => ({ transactions: s.transactions.filter(t => t.id !== id) }))
      await get().logActivity('delete', 'transaction', id, 'Transacción eliminada')
    }
  },

  // ─── SETTINGS ────────────────────────────────────────────────────────────

  fetchSettings: async () => {
    const { data } = await supabase
      .from('settings').select('*').single()
    if (data) set({ settings: data as Settings })
    // Si no existe, usar defaults (primer login)
  },

  saveSettings: async (data) => {
    const owner_id = getOwnerId(get)
    if (!owner_id) return
    // Upsert: crea si no existe, actualiza si ya existe
    const { data: row, error } = await supabase
      .from('settings')
      .upsert({ ...data, owner_id }, { onConflict: 'owner_id' })
      .select().single()
    if (!error && row) {
      set({ settings: row as Settings })
    }
  },
}))
