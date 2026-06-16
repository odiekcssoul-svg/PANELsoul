import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import {
  Plus, Pencil, Trash2, TrendingUp, TrendingDown,
  DollarSign, Filter, X, Wallet, RefreshCw,
  AlertTriangle, CheckCircle, MessageCircle, ChevronRight,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { formatDate, formatCurrency, SERVICE_ICONS, SERVICE_COLORS } from '@/lib/utils'
import {
  Transaction, TransactionType, TransactionCategory,
  INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS,
} from '@/types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, subMonths, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { buildWhatsAppLink } from '@/lib/whatsapp'

const PAGE_SIZE = 12
const ALL_CATS = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]
const catLabel = (c: string) => ALL_CATS.find(x => x.value === c)?.label ?? c

type Tab = 'resumen' | 'cobradas' | 'pendientes' | 'gastos' | 'movimientos'

const emptyForm = {
  type: 'income' as TransactionType,
  category: 'renewal' as TransactionCategory,
  description: '', amount: 0,
  date: new Date().toISOString().split('T')[0],
  client_id: '', client_name: '',
  streaming_account_id: '', service_type: '',
  provider_id: '', payment_method: 'Efectivo', notes: '',
}

// ════════════════════════════════════════════════════════════════════════════════
export default function Accounting() {
  const { transactions, accounts, clients, providers, settings, addTransaction, updateTransaction, deleteTransaction } = useStore()

  const [tab, setTab] = useState<Tab>('resumen')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'' | 'income' | 'expense'>('')
  const [filterMonth, setFilterMonth] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [form, setForm] = useState(emptyForm)

  const now = Date.now()
  const DAY = 86_400_000
  const thisMonth = format(new Date(), 'yyyy-MM')

  // ── Datos derivados de cuentas ─────────────────────────────────────────
  const activeAccounts = useMemo(() => accounts.filter(a => a.status === 'active'), [accounts])
  const expiredAccounts = useMemo(() => accounts.filter(a => a.status === 'expired'), [accounts])
  const renewingSoon = useMemo(() =>
    accounts.filter(a => {
      const diff = new Date(a.renewal_date).getTime() - now
      return diff >= 0 && diff <= 7 * DAY
    }), [accounts])

  const activeRevenue = useMemo(() => activeAccounts.reduce((s, a) => s + (a.price || 0), 0), [activeAccounts])
  const expiredRevenue = useMemo(() => expiredAccounts.reduce((s, a) => s + (a.price || 0), 0), [expiredAccounts])
  const soonRevenue = useMemo(() => renewingSoon.reduce((s, a) => s + (a.price || 0), 0), [renewingSoon])

  // ── KPIs transacciones ─────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const inc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const exp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const mInc = transactions.filter(t => t.type === 'income' && t.date.startsWith(thisMonth)).reduce((s, t) => s + t.amount, 0)
    const mExp = transactions.filter(t => t.type === 'expense' && t.date.startsWith(thisMonth)).reduce((s, t) => s + t.amount, 0)
    return { inc, exp, balance: inc - exp, mInc, mExp, mBalance: mInc - mExp }
  }, [transactions, thisMonth])

  // ── Gráfica 6 meses ────────────────────────────────────────────────────
  const chartData = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i)
    const m = format(d, 'yyyy-MM')
    const label = format(d, 'MMM', { locale: es })
    const tx = transactions.filter(t => t.date.startsWith(m))
    return {
      label,
      cobrado: tx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      gastos: tx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }
  }), [transactions])

  // ── Filtrado movimientos ───────────────────────────────────────────────
  const filteredTx = useMemo(() => transactions.filter(t => {
    const q = search.toLowerCase()
    return (!search || t.description.toLowerCase().includes(q) || (t.client_name || '').toLowerCase().includes(q))
      && (!filterType || t.type === filterType)
      && (!filterMonth || t.date.startsWith(filterMonth))
  }), [transactions, search, filterType, filterMonth])

  const paginated = filteredTx.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── Formulario ─────────────────────────────────────────────────────────
  function openCreate(type?: TransactionType) {
    setSelected(null)
    setForm({ ...emptyForm, type: type ?? 'income', category: type === 'expense' ? 'provider' : 'renewal', date: new Date().toISOString().split('T')[0] })
    setModalOpen(true)
  }
  function openEdit(t: Transaction) {
    setSelected(t)
    setForm({ type: t.type, category: t.category, description: t.description, amount: t.amount, date: t.date, client_id: t.client_id || '', client_name: t.client_name || '', streaming_account_id: t.streaming_account_id || '', service_type: t.service_type || '', provider_id: t.provider_id || '', payment_method: t.payment_method || 'Efectivo', notes: t.notes || '' })
    setModalOpen(true)
  }
  function onTypeChange(type: TransactionType) {
    setForm(f => ({ ...f, type, category: type === 'income' ? 'renewal' : 'provider', client_id: '', client_name: '', provider_id: '' }))
  }
  function onClientChange(id: string) {
    const c = clients.find(c => c.id === id)
    setForm(f => ({ ...f, client_id: id, client_name: c?.name || '' }))
  }
  function onAccountChange(id: string) {
    const a = accounts.find(a => a.id === id)
    setForm(f => ({ ...f, streaming_account_id: id, service_type: a?.service_type || '', amount: a ? (f.amount || a.price) : f.amount, description: a ? `Renovación ${a.service_type} — ${a.client_name || ''}` : f.description }))
  }
  function onProviderChange(id: string) {
    const p = providers.find(p => p.id === id)
    setForm(f => ({ ...f, provider_id: id, description: p ? `Pago proveedor: ${p.name}` : f.description, amount: p ? (f.amount || p.price) : f.amount }))
  }

  async function handleSave() {
    if (!form.description.trim()) { toast.error('La descripción es requerida'); return }
    if (!form.amount || form.amount <= 0) { toast.error('El monto debe ser mayor a 0'); return }
    const payload = { type: form.type, category: form.category, description: form.description, amount: Number(form.amount), date: form.date, client_id: form.client_id || undefined, client_name: form.client_name || undefined, streaming_account_id: form.streaming_account_id || undefined, service_type: form.service_type || undefined, provider_id: form.provider_id || undefined, payment_method: form.payment_method, notes: form.notes || undefined }
    if (selected) { await updateTransaction(selected.id, payload); toast.success('Actualizado') }
    else { await addTransaction(payload); toast.success(form.type === 'income' ? '✅ Ingreso registrado' : '📤 Gasto registrado') }
    setModalOpen(false)
  }

  const clientAccounts = form.client_id ? accounts.filter(a => a.client_id === form.client_id) : accounts

  // ── Tabs config ────────────────────────────────────────────────────────
  const TABS: { key: Tab; label: string; count?: number; color: string }[] = [
    { key: 'resumen',      label: '📊 Resumen',        color: 'text-brand-orange-400' },
    { key: 'cobradas',     label: '✅ Cobradas',        count: activeAccounts.length, color: 'text-green-400' },
    { key: 'pendientes',   label: '⚠️ Por cobrar',     count: expiredAccounts.length + renewingSoon.length, color: 'text-yellow-400' },
    { key: 'gastos',       label: '📤 Gastos',          count: transactions.filter(t => t.type === 'expense').length, color: 'text-red-400' },
    { key: 'movimientos',  label: '📋 Movimientos',     count: transactions.length, color: 'text-gray-400' },
  ]

  return (
    <div className="space-y-4">

      {/* ── KPIs superiores ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Balance registrado</p>
          <p className={`text-2xl font-bold ${kpi.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(kpi.balance)}</p>
          <p className="text-xs text-gray-600 mt-1">Total ingresos − gastos</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Cuentas activas</p>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(activeRevenue)}</p>
          <p className="text-xs text-gray-600 mt-1">{activeAccounts.length} cuentas vigentes</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Por cobrar</p>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(expiredRevenue)}</p>
          <p className="text-xs text-gray-600 mt-1">{expiredAccounts.length} cuentas vencidas</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Renuevan pronto</p>
          <p className="text-2xl font-bold text-yellow-400">{formatCurrency(soonRevenue)}</p>
          <p className="text-xs text-gray-600 mt-1">{renewingSoon.length} en los próximos 7d</p>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-dark-700 p-1 rounded-xl overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setPage(1) }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${tab === t.key ? 'bg-dark-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            {t.label}
            {t.count != null && t.count > 0 && (
              <span className={`text-xs ${t.color}`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          TAB: RESUMEN
      ════════════════════════════════════════════════════════════════════ */}
      {tab === 'resumen' && (
        <div className="space-y-4">
          {/* Gráfica */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">Cobrado vs Gastos</h3>
                <p className="text-xs text-gray-500">Últimos 6 meses · transacciones registradas</p>
              </div>
              <button onClick={() => openCreate('income')} className="btn-primary text-xs py-1.5">
                <Plus size={12} /> Registrar
              </button>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid #3a3a4e', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  formatter={(v: number, n: string) => [formatCurrency(v), n === 'cobrado' ? 'Cobrado' : 'Gastos']} />
                <Bar dataKey="cobrado" fill="#22c55e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="gastos" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Resumen este mes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card border-green-500/20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-green-400" />
                <span className="text-sm font-medium text-white">Ingresos este mes</span>
              </div>
              <p className="text-3xl font-bold text-green-400">{formatCurrency(kpi.mInc)}</p>
              <p className="text-xs text-gray-500 mt-2">Total histórico: {formatCurrency(kpi.inc)}</p>
            </div>
            <div className="card border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={16} className="text-red-400" />
                <span className="text-sm font-medium text-white">Gastos este mes</span>
              </div>
              <p className="text-3xl font-bold text-red-400">{formatCurrency(kpi.mExp)}</p>
              <p className="text-xs text-gray-500 mt-2">Total histórico: {formatCurrency(kpi.exp)}</p>
            </div>
            <div className={`card ${kpi.mBalance >= 0 ? 'border-green-500/20' : 'border-red-500/20'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Wallet size={16} className={kpi.mBalance >= 0 ? 'text-green-400' : 'text-red-400'} />
                <span className="text-sm font-medium text-white">Balance del mes</span>
              </div>
              <p className={`text-3xl font-bold ${kpi.mBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(kpi.mBalance)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {kpi.mBalance >= 0 ? '✅ Mes positivo' : '⚠️ Gastos mayores que ingresos'}
              </p>
            </div>
          </div>

          {/* Resumen streaming */}
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-600">
              <h3 className="font-semibold text-white text-sm">Estado financiero de cuentas streaming</h3>
            </div>
            <div className="divide-y divide-dark-600">
              {/* Activas */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle size={16} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Cuentas activas</p>
                    <p className="text-xs text-gray-500">{activeAccounts.length} cuentas vigentes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-400">{formatCurrency(activeRevenue)}</p>
                  <p className="text-xs text-gray-500">ingreso potencial</p>
                </div>
              </div>
              {/* Vencidas sin pagar */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle size={16} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Vencidas sin renovar</p>
                    <p className="text-xs text-gray-500">{expiredAccounts.length} cuentas — ingresos perdidos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-400">{formatCurrency(expiredRevenue)}</p>
                  <p className="text-xs text-gray-500">por cobrar</p>
                </div>
              </div>
              {/* Próximas a vencer */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <RefreshCw size={16} className="text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Renuevan en 7 días</p>
                    <p className="text-xs text-gray-500">{renewingSoon.length} cuentas próximas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-yellow-400">{formatCurrency(soonRevenue)}</p>
                  <p className="text-xs text-gray-500">a cobrar pronto</p>
                </div>
              </div>
              {/* Total proyectado */}
              <div className="flex items-center justify-between px-4 py-3 bg-dark-700/40">
                <p className="text-sm font-semibold text-white">Total proyectado mensual</p>
                <p className="text-base font-bold text-brand-orange-400">{formatCurrency(activeRevenue + expiredRevenue)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: COBRADAS (cuentas activas con precio)
      ════════════════════════════════════════════════════════════════════ */}
      {tab === 'cobradas' && (
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-600">
            <div>
              <h3 className="font-semibold text-white text-sm">Cuentas activas — ingresos vigentes</h3>
              <p className="text-xs text-gray-500">Total: <span className="text-green-400 font-medium">{formatCurrency(activeRevenue)}</span> · {activeAccounts.length} cuentas</p>
            </div>
            <button onClick={() => openCreate('income')} className="btn-primary text-xs py-1.5">
              <Plus size={12} /> Registrar cobro
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="table-header">Cliente</th>
                  <th className="table-header">Servicio</th>
                  <th className="table-header">Renovación</th>
                  <th className="table-header text-right">Precio</th>
                  <th className="table-header text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {activeAccounts.map(a => (
                  <tr key={a.id} className="hover:bg-dark-600/20 border-b border-dark-600/40 last:border-0">
                    <td className="table-cell">
                      <p className="text-sm font-medium text-white">{a.client_name || '—'}</p>
                      <p className="text-xs text-gray-500">{a.client_phone || ''}</p>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span>{SERVICE_ICONS[a.service_type]}</span>
                        <span className="text-sm" style={{ color: SERVICE_COLORS[a.service_type] }}>{a.service_type}</span>
                      </div>
                    </td>
                    <td className="table-cell text-gray-400 text-sm">{formatDate(a.renewal_date)}</td>
                    <td className="table-cell text-right">
                      <span className="text-sm font-bold text-green-400">{formatCurrency(a.price)}</span>
                    </td>
                    <td className="table-cell text-right">
                      <button
                        onClick={() => {
                          setForm({ ...emptyForm, type: 'income', category: 'renewal', description: `Renovación ${a.service_type} — ${a.client_name || ''}`, amount: a.price, date: new Date().toISOString().split('T')[0], client_id: a.client_id, client_name: a.client_name || '', streaming_account_id: a.id, service_type: a.service_type, payment_method: 'Efectivo', notes: '' })
                          setSelected(null)
                          setModalOpen(true)
                        }}
                        className="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors">
                        + Cobro
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {activeAccounts.length === 0 && (
              <div className="py-12 text-center text-gray-500 text-sm">Sin cuentas activas</div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: PENDIENTES (vencidas + próximas a vencer)
      ════════════════════════════════════════════════════════════════════ */}
      {tab === 'pendientes' && (
        <div className="space-y-4">
          {/* Vencidas */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-600">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-red-400" />
                <h3 className="font-semibold text-white text-sm">Vencidas sin cobrar</h3>
                <span className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">{expiredAccounts.length}</span>
              </div>
              <p className="text-xs text-red-400 font-medium">{formatCurrency(expiredRevenue)} pendiente</p>
            </div>
            <div className="divide-y divide-dark-600 max-h-80 overflow-y-auto">
              {expiredAccounts.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-8">🎉 Sin cuentas vencidas</p>
              ) : expiredAccounts.map(a => {
                const daysAgo = Math.abs(Math.ceil((new Date(a.renewal_date).getTime() - now) / DAY))
                const wa = a.client_phone ? buildWhatsAppLink({ clientName: a.client_name || '', clientPhone: a.client_phone, serviceType: a.service_type, email: a.email, renewalDate: formatDate(a.renewal_date), price: a.price, isExpired: true, settings }) : ''
                return (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-600/20">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${SERVICE_COLORS[a.service_type]}20` }}>
                      {SERVICE_ICONS[a.service_type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{a.client_name || '—'}</p>
                      <p className="text-xs text-gray-500">{a.service_type} · venció hace {daysAgo}d</p>
                    </div>
                    <p className="text-sm font-bold text-red-400 flex-shrink-0">{formatCurrency(a.price)}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {wa && (
                        <a href={wa} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                          title="Cobrar por WhatsApp">
                          <MessageCircle size={14} />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setForm({ ...emptyForm, type: 'income', category: 'renewal', description: `Cobro vencido ${a.service_type} — ${a.client_name || ''}`, amount: a.price, date: new Date().toISOString().split('T')[0], client_id: a.client_id, client_name: a.client_name || '', streaming_account_id: a.id, service_type: a.service_type, payment_method: 'Efectivo', notes: '' })
                          setSelected(null)
                          setModalOpen(true)
                        }}
                        className="text-xs px-2 py-1 rounded-lg bg-brand-orange-500/10 text-brand-orange-400 hover:bg-brand-orange-500/20 transition-colors">
                        Cobrar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Próximas a vencer */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-600">
              <div className="flex items-center gap-2">
                <RefreshCw size={15} className="text-yellow-400" />
                <h3 className="font-semibold text-white text-sm">Renuevan en 7 días</h3>
                <span className="text-xs bg-yellow-500/15 text-yellow-400 px-2 py-0.5 rounded-full">{renewingSoon.length}</span>
              </div>
              <p className="text-xs text-yellow-400 font-medium">{formatCurrency(soonRevenue)} por cobrar</p>
            </div>
            <div className="divide-y divide-dark-600 max-h-80 overflow-y-auto">
              {renewingSoon.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-8">Sin renovaciones próximas</p>
              ) : renewingSoon.map(a => {
                const daysLeft = Math.ceil((new Date(a.renewal_date).getTime() - now) / DAY)
                const wa = a.client_phone ? buildWhatsAppLink({ clientName: a.client_name || '', clientPhone: a.client_phone, serviceType: a.service_type, email: a.email, renewalDate: formatDate(a.renewal_date), price: a.price, isExpired: false, settings }) : ''
                return (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-600/20">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${SERVICE_COLORS[a.service_type]}20` }}>
                      {SERVICE_ICONS[a.service_type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{a.client_name || '—'}</p>
                      <p className="text-xs text-gray-500">{a.service_type} · {formatDate(a.renewal_date)}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 flex-shrink-0">
                      {daysLeft === 0 ? 'Hoy' : `${daysLeft}d`}
                    </span>
                    <p className="text-sm font-bold text-white flex-shrink-0">{formatCurrency(a.price)}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {wa && (
                        <a href={wa} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors">
                          <MessageCircle size={14} />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setForm({ ...emptyForm, type: 'income', category: 'renewal', description: `Renovación ${a.service_type} — ${a.client_name || ''}`, amount: a.price, date: new Date().toISOString().split('T')[0], client_id: a.client_id, client_name: a.client_name || '', streaming_account_id: a.id, service_type: a.service_type, payment_method: 'Efectivo', notes: '' })
                          setSelected(null)
                          setModalOpen(true)
                        }}
                        className="text-xs px-2 py-1 rounded-lg bg-brand-orange-500/10 text-brand-orange-400 hover:bg-brand-orange-500/20 transition-colors">
                        Cobrar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: GASTOS
      ════════════════════════════════════════════════════════════════════ */}
      {tab === 'gastos' && (
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-600">
            <div>
              <h3 className="font-semibold text-white text-sm">Gastos registrados</h3>
              <p className="text-xs text-gray-500">Total: <span className="text-red-400 font-medium">{formatCurrency(kpi.exp)}</span></p>
            </div>
            <button onClick={() => openCreate('expense')} className="btn-secondary text-xs py-1.5">
              <TrendingDown size={12} className="text-red-400" /> Nuevo gasto
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="table-header">Fecha</th>
                  <th className="table-header">Descripción</th>
                  <th className="table-header hidden md:table-cell">Categoría</th>
                  <th className="table-header hidden lg:table-cell">Método</th>
                  <th className="table-header text-right">Monto</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {transactions.filter(t => t.type === 'expense').map(t => (
                  <tr key={t.id} className="hover:bg-dark-600/20 border-b border-dark-600/40 last:border-0">
                    <td className="table-cell text-gray-400 text-xs">{formatDate(t.date)}</td>
                    <td className="table-cell">
                      <p className="text-sm text-white">{t.description}</p>
                      {t.client_name && <p className="text-xs text-gray-500">{t.client_name}</p>}
                    </td>
                    <td className="table-cell hidden md:table-cell text-xs text-gray-400">{catLabel(t.category)}</td>
                    <td className="table-cell hidden lg:table-cell text-xs text-gray-400">{t.payment_method}</td>
                    <td className="table-cell text-right">
                      <span className="text-sm font-bold text-red-400">−{formatCurrency(t.amount)}</span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(t)} className="p-1.5 text-gray-400 hover:text-brand-orange-400 hover:bg-brand-orange-400/10 rounded-lg transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteTarget(t)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.filter(t => t.type === 'expense').length === 0 && (
              <div className="py-12 text-center">
                <p className="text-gray-500 text-sm mb-3">Sin gastos registrados</p>
                <button onClick={() => openCreate('expense')} className="btn-secondary text-xs">
                  <Plus size={12} /> Registrar gasto
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: MOVIMIENTOS (todos)
      ════════════════════════════════════════════════════════════════════ */}
      {tab === 'movimientos' && (
        <div className="card p-0 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-dark-600">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Buscar..." />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`btn-secondary ${showFilters ? 'border-brand-orange-500' : ''}`}>
              <Filter size={14} />
            </button>
            <button onClick={() => openCreate('expense')} className="btn-secondary text-xs">
              <TrendingDown size={12} className="text-red-400" /> Gasto
            </button>
            <button onClick={() => openCreate('income')} className="btn-primary text-xs">
              <Plus size={12} /> Ingreso
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-3 px-4 py-3 border-b border-dark-600 bg-dark-700/40">
              <div className="flex-1 min-w-[130px]">
                <label className="label text-xs">Tipo</label>
                <select className="select" value={filterType} onChange={e => { setFilterType(e.target.value as any); setPage(1) }}>
                  <option value="">Todos</option>
                  <option value="income">Ingresos</option>
                  <option value="expense">Gastos</option>
                </select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="label text-xs">Mes</label>
                <input className="input" type="month" value={filterMonth} onChange={e => { setFilterMonth(e.target.value); setPage(1) }} />
              </div>
              <div className="flex items-end">
                <button onClick={() => { setFilterType(''); setFilterMonth('') }} className="btn-secondary text-xs"><X size={12} /> Limpiar</button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="table-header">Fecha</th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header">Descripción</th>
                  <th className="table-header hidden md:table-cell">Cliente</th>
                  <th className="table-header text-right">Monto</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(t => (
                  <tr key={t.id} className="hover:bg-dark-600/20 border-b border-dark-600/40 last:border-0">
                    <td className="table-cell text-gray-400 text-xs">{formatDate(t.date)}</td>
                    <td className="table-cell">
                      <span className={`flex items-center gap-1 text-xs font-medium w-fit px-2 py-0.5 rounded-full ${t.type === 'income' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {t.type === 'income' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {t.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm text-white">{t.description}</p>
                      <p className="text-xs text-gray-500">{catLabel(t.category)}</p>
                    </td>
                    <td className="table-cell hidden md:table-cell text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        {t.service_type && <span>{SERVICE_ICONS[t.service_type]}</span>}
                        {t.client_name || '—'}
                      </div>
                    </td>
                    <td className="table-cell text-right">
                      <span className={`text-sm font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount)}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(t)} className="p-1.5 text-gray-400 hover:text-brand-orange-400 hover:bg-brand-orange-400/10 rounded-lg transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteTarget(t)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTx.length === 0 && (
              <div className="py-12 text-center text-gray-500 text-sm">Sin movimientos</div>
            )}
          </div>
          <Pagination page={page} totalPages={Math.ceil(filteredTx.length / PAGE_SIZE)} onPageChange={setPage} totalItems={filteredTx.length} pageSize={PAGE_SIZE} />
        </div>
      )}

      {/* ── Modal ────────────────────────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={selected ? 'Editar transacción' : form.type === 'income' ? '📥 Nuevo ingreso' : '📤 Nuevo gasto'} size="lg">
        <div className="space-y-4">
          {!selected && (
            <div className="grid grid-cols-2 gap-2">
              {(['income', 'expense'] as TransactionType[]).map(t => (
                <button key={t} onClick={() => onTypeChange(t)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${form.type === t ? (t === 'income' ? 'bg-green-500/15 border-green-500/40 text-green-400' : 'bg-red-500/15 border-red-500/40 text-red-400') : 'bg-dark-600 border-dark-500 text-gray-400'}`}>
                  {t === 'income' ? '📥 Ingreso' : '📤 Gasto'}
                </button>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Categoría *</label>
              <select className="select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as TransactionCategory }))}>
                {(form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Fecha *</label>
              <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Descripción *</label>
            <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ej: Renovación Spotify — HABRAHAM" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Monto ($) *</label>
              <input className="input" type="number" min="0" step="0.01" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} placeholder="0.00" />
            </div>
            <div>
              <label className="label">Método de pago</label>
              <select className="select" value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          {form.type === 'income' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Cliente</label>
                <select className="select" value={form.client_id} onChange={e => onClientChange(e.target.value)}>
                  <option value="">Sin cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Cuenta streaming</label>
                <select className="select" value={form.streaming_account_id} onChange={e => onAccountChange(e.target.value)}>
                  <option value="">Sin cuenta</option>
                  {clientAccounts.map(a => <option key={a.id} value={a.id}>{SERVICE_ICONS[a.service_type]} {a.service_type} — {a.client_name || a.email}</option>)}
                </select>
              </div>
            </div>
          )}
          {form.type === 'expense' && form.category === 'provider' && (
            <div>
              <label className="label">Proveedor</label>
              <select className="select" value={form.provider_id} onChange={e => onProviderChange(e.target.value)}>
                <option value="">Sin proveedor</option>
                {providers.map(p => <option key={p.id} value={p.id}>{p.name} — {p.service}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Notas</label>
            <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observaciones..." />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button onClick={handleSave} className={`flex-1 justify-center flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${form.type === 'income' ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}>
              {form.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {selected ? 'Guardar cambios' : form.type === 'income' ? 'Registrar ingreso' : 'Registrar gasto'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={async () => { if (deleteTarget) { await deleteTransaction(deleteTarget.id); toast.success('Eliminado'); setDeleteTarget(null) } }}
        title="Eliminar transacción" message={`¿Eliminar "${deleteTarget?.description}"?`} confirmLabel="Eliminar" danger />
    </div>
  )
}
