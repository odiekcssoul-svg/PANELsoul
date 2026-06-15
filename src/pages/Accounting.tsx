import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import {
  Plus, Pencil, Trash2, TrendingUp, TrendingDown,
  DollarSign, Filter, Download, X, Wallet,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { formatDate, formatCurrency, SERVICE_ICONS } from '@/lib/utils'
import {
  Transaction, TransactionType, TransactionCategory,
  INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS,
} from '@/types'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts'
import { format, parseISO, startOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

const PAGE_SIZE = 15

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]

function categoryLabel(cat: string) {
  return ALL_CATEGORIES.find(c => c.value === cat)?.label ?? cat
}

const emptyForm = {
  type: 'income' as TransactionType,
  category: 'renewal' as TransactionCategory,
  description: '',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  client_id: '',
  client_name: '',
  streaming_account_id: '',
  service_type: '',
  provider_id: '',
  payment_method: 'Efectivo',
  notes: '',
}

export default function Accounting() {
  const { transactions, accounts, clients, providers, addTransaction, updateTransaction, deleteTransaction } = useStore()

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'' | 'income' | 'expense'>('')
  const [filterMonth, setFilterMonth] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [form, setForm] = useState(emptyForm)

  // ── KPIs ────────────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const now = new Date()
    const thisMonth = format(now, 'yyyy-MM')
    const lastMonth = format(subMonths(now, 1), 'yyyy-MM')

    const monthTx = transactions.filter(t => t.date.startsWith(thisMonth))
    const lastTx = transactions.filter(t => t.date.startsWith(lastMonth))

    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const monthIncome = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const monthExpense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const lastIncome = lastTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)

    // Ingresos auto: cuentas activas
    const streamingIncome = accounts
      .filter(a => a.status === 'active')
      .reduce((s, a) => s + (a.price || 0), 0)

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      monthIncome,
      monthExpense,
      monthBalance: monthIncome - monthExpense,
      lastIncome,
      streamingIncome,
    }
  }, [transactions, accounts])

  // ── Gráfica mensual (últimos 6 meses) ───────────────────────────────────
  const chartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i)
      const month = format(date, 'yyyy-MM')
      const label = format(date, 'MMM', { locale: es })
      const monthTx = transactions.filter(t => t.date.startsWith(month))
      const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      return { label, income, expense, balance: income - expense }
    })
  }, [transactions])

  // ── Gastos por categoría ─────────────────────────────────────────────────
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return Object.entries(map)
      .map(([cat, amount]) => ({ cat, amount, label: categoryLabel(cat) }))
      .sort((a, b) => b.amount - a.amount)
  }, [transactions])

  // ── Filtrado y paginación ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const q = search.toLowerCase()
      const matchSearch = !search ||
        t.description.toLowerCase().includes(q) ||
        (t.client_name || '').toLowerCase().includes(q) ||
        (t.service_type || '').toLowerCase().includes(q)
      const matchType = !filterType || t.type === filterType
      const matchMonth = !filterMonth || t.date.startsWith(filterMonth)
      return matchSearch && matchType && matchMonth
    })
  }, [transactions, search, filterType, filterMonth])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── Helpers formulario ───────────────────────────────────────────────────
  function openCreate(type?: TransactionType) {
    setSelected(null)
    setForm({
      ...emptyForm,
      type: type ?? 'income',
      category: type === 'expense' ? 'provider' : 'renewal',
      date: new Date().toISOString().split('T')[0],
    })
    setModalOpen(true)
  }

  function openEdit(t: Transaction) {
    setSelected(t)
    setForm({
      type: t.type,
      category: t.category,
      description: t.description,
      amount: t.amount,
      date: t.date,
      client_id: t.client_id || '',
      client_name: t.client_name || '',
      streaming_account_id: t.streaming_account_id || '',
      service_type: t.service_type || '',
      provider_id: t.provider_id || '',
      payment_method: t.payment_method || 'Efectivo',
      notes: t.notes || '',
    })
    setModalOpen(true)
  }

  function handleTypeChange(type: TransactionType) {
    setForm(f => ({
      ...f,
      type,
      category: type === 'income' ? 'renewal' : 'provider',
      client_id: '',
      client_name: '',
      provider_id: '',
    }))
  }

  function handleClientChange(clientId: string) {
    const c = clients.find(c => c.id === clientId)
    setForm(f => ({ ...f, client_id: clientId, client_name: c?.name || '' }))
  }

  function handleAccountChange(accountId: string) {
    const a = accounts.find(a => a.id === accountId)
    setForm(f => ({
      ...f,
      streaming_account_id: accountId,
      service_type: a?.service_type || '',
      amount: a ? (f.amount || a.price) : f.amount,
      description: a ? `${a.service_type} — ${a.client_name || ''}` : f.description,
    }))
  }

  function handleProviderChange(providerId: string) {
    const p = providers.find(p => p.id === providerId)
    setForm(f => ({
      ...f,
      provider_id: providerId,
      description: p ? `Pago proveedor: ${p.name}` : f.description,
      amount: p ? (f.amount || p.price) : f.amount,
    }))
  }

  async function handleSave() {
    if (!form.description.trim()) { toast.error('La descripción es requerida'); return }
    if (!form.amount || form.amount <= 0) { toast.error('El monto debe ser mayor a 0'); return }
    if (!form.date) { toast.error('La fecha es requerida'); return }

    const payload = {
      type: form.type,
      category: form.category,
      description: form.description,
      amount: Number(form.amount),
      date: form.date,
      client_id: form.client_id || undefined,
      client_name: form.client_name || undefined,
      streaming_account_id: form.streaming_account_id || undefined,
      service_type: form.service_type || undefined,
      provider_id: form.provider_id || undefined,
      payment_method: form.payment_method,
      notes: form.notes || undefined,
    }

    if (selected) {
      await updateTransaction(selected.id, payload)
      toast.success('Transacción actualizada')
    } else {
      await addTransaction(payload)
      toast.success(form.type === 'income' ? '✅ Ingreso registrado' : '📤 Gasto registrado')
    }
    setModalOpen(false)
  }

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  // Cuentas del cliente seleccionado
  const clientAccounts = form.client_id
    ? accounts.filter(a => a.client_id === form.client_id)
    : accounts

  return (
    <div className="space-y-5">

      {/* ── KPIs ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Balance total */}
        <div className="card col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Balance total</span>
            <Wallet size={16} className={kpi.balance >= 0 ? 'text-green-400' : 'text-red-400'} />
          </div>
          <p className={`text-3xl font-bold ${kpi.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(kpi.balance)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Ingresos − Gastos registrados</p>
        </div>

        {/* Ingresos este mes */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Ingresos mes</span>
            <TrendingUp size={16} className="text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(kpi.monthIncome)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {kpi.lastIncome > 0
              ? `Mes anterior: ${formatCurrency(kpi.lastIncome)}`
              : 'Este mes'}
          </p>
        </div>

        {/* Gastos este mes */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Gastos mes</span>
            <TrendingDown size={16} className="text-red-400" />
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(kpi.monthExpense)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Balance: <span className={kpi.monthBalance >= 0 ? 'text-green-400' : 'text-red-400'}>
              {formatCurrency(kpi.monthBalance)}
            </span>
          </p>
        </div>

        {/* Ingresos potenciales (cuentas activas) */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Potencial streaming</span>
            <DollarSign size={16} className="text-brand-orange-400" />
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(kpi.streamingIncome)}</p>
          <p className="text-xs text-gray-500 mt-1">Cuentas activas · por cobrar</p>
        </div>
      </div>

      {/* ── Gráficas ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Área ingresos vs gastos */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">Ingresos vs Gastos</h3>
              <p className="text-xs text-gray-500">Últimos 6 meses</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip
                contentStyle={{ background: '#1a1a24', border: '1px solid #3a3a4e', borderRadius: 8, color: '#fff', fontSize: 12 }}
                formatter={(v: number, name: string) => [formatCurrency(v), name === 'income' ? 'Ingresos' : 'Gastos']}
              />
              <Bar dataKey="income" name="income" fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expense" name="expense" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gastos por categoría */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Gastos por categoría</h3>
          {expenseByCategory.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Sin gastos registrados</p>
          ) : (
            <div className="space-y-3">
              {expenseByCategory.map(e => {
                const total = expenseByCategory.reduce((s, x) => s + x.amount, 0)
                const pct = total > 0 ? Math.round((e.amount / total) * 100) : 0
                return (
                  <div key={e.cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-300 truncate">{e.label}</span>
                      <span className="text-xs font-semibold text-white ml-2">{formatCurrency(e.amount)}</span>
                    </div>
                    <div className="w-full bg-dark-600 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-red-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Tabla transacciones ──────────────────────────────────────────── */}
      <div className="card p-0 overflow-hidden">
        {/* Header tabla */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-dark-600">
          <div className="flex-1 min-w-[200px]">
            <SearchInput value={search} onChange={v => { setSearch(v); setPage(1) }}
              placeholder="Buscar transacción..." />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'border-brand-orange-500' : ''}`}>
            <Filter size={14} />
          </button>
          <button onClick={() => openCreate('expense')} className="btn-secondary">
            <TrendingDown size={14} className="text-red-400" /> Gasto
          </button>
          <button onClick={() => openCreate('income')} className="btn-primary">
            <Plus size={14} /> Ingreso
          </button>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 px-4 py-3 border-b border-dark-600 bg-dark-700/40">
            <div className="flex-1 min-w-[140px]">
              <label className="label text-xs">Tipo</label>
              <select className="select" value={filterType}
                onChange={e => { setFilterType(e.target.value as any); setPage(1) }}>
                <option value="">Todos</option>
                <option value="income">Ingresos</option>
                <option value="expense">Gastos</option>
              </select>
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="label text-xs">Mes</label>
              <input className="input" type="month" value={filterMonth}
                onChange={e => { setFilterMonth(e.target.value); setPage(1) }} />
            </div>
            <div className="flex items-end">
              <button onClick={() => { setFilterType(''); setFilterMonth('') }} className="btn-secondary text-xs">
                <X size={12} /> Limpiar
              </button>
            </div>
          </div>
        )}

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="table-header">Fecha</th>
                <th className="table-header">Tipo</th>
                <th className="table-header">Descripción</th>
                <th className="table-header hidden md:table-cell">Cliente / Servicio</th>
                <th className="table-header hidden lg:table-cell">Método</th>
                <th className="table-header text-right">Monto</th>
                <th className="table-header text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(t => (
                <tr key={t.id} className="hover:bg-dark-600/30 transition-colors border-b border-dark-600/50 last:border-0">
                  <td className="table-cell text-gray-400 text-xs">{formatDate(t.date)}</td>
                  <td className="table-cell">
                    <span className={`flex items-center gap-1.5 text-xs font-medium w-fit px-2 py-0.5 rounded-full ${
                      t.type === 'income'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {t.type === 'income'
                        ? <TrendingUp size={11} />
                        : <TrendingDown size={11} />}
                      {t.type === 'income' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <p className="text-sm text-white">{t.description}</p>
                    <p className="text-xs text-gray-500">{categoryLabel(t.category)}</p>
                  </td>
                  <td className="table-cell hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      {t.service_type && (
                        <span className="text-base">{SERVICE_ICONS[t.service_type] || '📺'}</span>
                      )}
                      <div>
                        {t.client_name && <p className="text-xs text-gray-300">{t.client_name}</p>}
                        {t.service_type && <p className="text-xs text-gray-500">{t.service_type}</p>}
                        {!t.client_name && !t.service_type && <span className="text-gray-600 text-xs">—</span>}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell hidden lg:table-cell text-xs text-gray-400">{t.payment_method}</td>
                  <td className="table-cell text-right">
                    <span className={`text-sm font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount)}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(t)}
                        className="p-1.5 text-gray-400 hover:text-brand-orange-400 hover:bg-brand-orange-400/10 rounded-lg transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setDeleteTarget(t)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-14 gap-3">
              <DollarSign size={32} className="text-gray-600" />
              <p className="text-gray-400 text-sm">Sin transacciones</p>
              <button onClick={() => openCreate()} className="btn-primary text-xs">
                <Plus size={13} /> Registrar primera transacción
              </button>
            </div>
          )}
        </div>

        <Pagination page={page} totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
          onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
      </div>

      {/* ── Modal crear / editar ─────────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={selected ? 'Editar transacción' : form.type === 'income' ? 'Nuevo ingreso' : 'Nuevo gasto'}
        size="lg">
        <div className="space-y-4">

          {/* Tipo */}
          {!selected && (
            <div className="grid grid-cols-2 gap-2">
              {(['income', 'expense'] as TransactionType[]).map(t => (
                <button key={t} onClick={() => handleTypeChange(t)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    form.type === t
                      ? t === 'income'
                        ? 'bg-green-500/15 border-green-500/40 text-green-400'
                        : 'bg-red-500/15 border-red-500/40 text-red-400'
                      : 'bg-dark-600 border-dark-500 text-gray-400 hover:border-dark-400'
                  }`}>
                  {t === 'income' ? '📥 Ingreso' : '📤 Gasto'}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Categoría */}
            <div>
              <label className="label">Categoría *</label>
              <select className="select" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as TransactionCategory }))}>
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Fecha */}
            <div>
              <label className="label">Fecha *</label>
              <input className="input" type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="label">Descripción *</label>
            <input className="input" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Ej: Renovación Spotify - HABRAHAM" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Monto */}
            <div>
              <label className="label">Monto ($) *</label>
              <input className="input" type="number" min="0" step="0.01" value={form.amount || ''}
                onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00" />
            </div>

            {/* Método de pago */}
            <div>
              <label className="label">Método de pago</label>
              <select className="select" value={form.payment_method}
                onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Vincular cliente (ingresos) */}
          {form.type === 'income' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Cliente (opcional)</label>
                <select className="select" value={form.client_id}
                  onChange={e => handleClientChange(e.target.value)}>
                  <option value="">Sin cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Cuenta streaming (opcional)</label>
                <select className="select" value={form.streaming_account_id}
                  onChange={e => handleAccountChange(e.target.value)}>
                  <option value="">Sin cuenta</option>
                  {clientAccounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {SERVICE_ICONS[a.service_type]} {a.service_type} — {a.client_name || a.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Vincular proveedor (gastos) */}
          {form.type === 'expense' && form.category === 'provider' && (
            <div>
              <label className="label">Proveedor (opcional)</label>
              <select className="select" value={form.provider_id}
                onChange={e => handleProviderChange(e.target.value)}>
                <option value="">Sin proveedor</option>
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.service}</option>
                ))}
              </select>
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="label">Notas</label>
            <textarea className="input resize-none" rows={2} value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Observaciones adicionales..." />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button onClick={handleSave}
              className={`flex-1 justify-center flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                form.type === 'income'
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}>
              {form.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {selected ? 'Guardar cambios' : form.type === 'income' ? 'Registrar ingreso' : 'Registrar gasto'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Confirmar eliminar ───────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteTransaction(deleteTarget.id)
            toast.success('Transacción eliminada')
            setDeleteTarget(null)
          }
        }}
        title="Eliminar transacción"
        message={`¿Eliminar "${deleteTarget?.description}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
      />
    </div>
  )
}
