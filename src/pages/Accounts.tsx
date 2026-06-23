import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import {
  Plus, Pencil, Trash2, RefreshCw, Copy, Monitor,
  Download, FileSpreadsheet, Filter,
} from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  formatDate, getStatusColor, getStatusLabel,
  copyToClipboard, SERVICE_ICONS, SERVICE_COLORS,
} from '@/lib/utils'
import { StreamingAccount, ServiceType, AccountStatus } from '@/types'
import toast from 'react-hot-toast'
import { exportAccountsExcel, exportAccountsPDF } from '@/lib/export'

const PAGE_SIZE = 10

const SERVICES: ServiceType[] = [
  'Netflix', 'Prime Video', 'Disney+', 'HBO Max', 'Spotify',
  'YouTube Premium', 'Crunchyroll', 'Vix Premium', 'Paramount+',
]

const emptyForm = {
  client_id: '', client_name: '', client_phone: '',
  email: '', password: '',
  service_type: 'Netflix' as ServiceType,
  status: 'active' as AccountStatus,
  start_date: new Date().toISOString().split('T')[0],
  renewal_date: '',
  price: 0, counter: 1, account_status: '', observations: '',
}

export default function Accounts() {
  const { accounts, clients, addAccount, updateAccount, deleteAccount, renewAccount } = useStore()
  const [search, setSearch] = useState('')
  const [filterService, setFilterService] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [renewModal, setRenewModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<StreamingAccount | null>(null)
  const [selected, setSelected] = useState<StreamingAccount | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [newRenewDate, setNewRenewDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() =>
    accounts.filter(a => {
      const q = search.toLowerCase()
      const daysLeft = Math.ceil((new Date(a.renewal_date).getTime() - Date.now()) / 86400000)
      const realStatus = a.status === 'suspended' ? 'suspended' : daysLeft < 0 ? 'expired' : 'active'
      const matchSearch = !search ||
        (a.client_name || '').toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.service_type.toLowerCase().includes(q)
      const matchService = !filterService || a.service_type === filterService
      const matchStatus = !filterStatus || realStatus === filterStatus
      return matchSearch && matchService && matchStatus
    }),
    [accounts, search, filterService, filterStatus]
  )

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function openCreate() {
    setSelected(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(a: StreamingAccount) {
    setSelected(a)
    setForm({
      client_id: a.client_id, client_name: a.client_name || '',
      client_phone: a.client_phone || '',
      email: a.email, password: a.password,
      service_type: a.service_type, status: a.status,
      start_date: a.start_date, renewal_date: a.renewal_date,
      price: a.price, counter: a.counter, account_status: a.account_status,
      observations: a.observations || '',
    })
    setModalOpen(true)
  }

  function openRenew(a: StreamingAccount) {
    setSelected(a)
    const d = new Date(a.renewal_date)
    d.setMonth(d.getMonth() + 1)
    setNewRenewDate(d.toISOString().split('T')[0])
    setRenewModal(true)
  }

  function handleClientChange(clientId: string) {
    const client = clients.find(c => c.id === clientId)
    setForm({
      ...form,
      client_id: clientId,
      client_name: client?.name || '',
      client_phone: client?.phone || '',
    })
  }

  function handleSave() {
    if (!form.client_id) { toast.error('Selecciona un cliente'); return }
    if (!form.email) { toast.error('El correo es requerido'); return }
    if (!form.renewal_date) { toast.error('La fecha de renovación es requerida'); return }

    if (selected) {
      updateAccount(selected.id, form)
      toast.success('Cuenta actualizada')
    } else {
      addAccount(form)
      toast.success('Cuenta creada')
    }
    setModalOpen(false)
  }

  function handleRenew() {
    if (selected && newRenewDate) {
      renewAccount(selected.id, newRenewDate)
      toast.success('Cuenta renovada correctamente')
      setRenewModal(false)
    }
  }

  function handleMarkExpired(a: StreamingAccount) {
    updateAccount(a.id, { status: 'expired' })
    toast.success('Cuenta marcada como vencida')
  }

  function handleCopy(text: string, label: string) {
    copyToClipboard(text)
    toast.success(`${label} copiado al portapapeles`)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 flex gap-2">
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1) }}
            placeholder="Buscar cuenta..." className="flex-1 max-w-xs" />
          <button onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'border-brand-orange-500' : ''}`}>
            <Filter size={15} />
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportAccountsExcel(filtered)} className="btn-secondary" title="Exportar Excel">
            <FileSpreadsheet size={15} /> <span className="hidden sm:inline">Excel</span>
          </button>
          <button onClick={() => exportAccountsPDF(filtered)} className="btn-secondary" title="Exportar PDF">
            <Download size={15} /> <span className="hidden sm:inline">PDF</span>
          </button>
          <button onClick={openCreate} className="btn-primary whitespace-nowrap">
            <Plus size={16} /> Nueva cuenta
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-3 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[160px]">
            <label className="label text-xs">Servicio</label>
            <select className="select" value={filterService} onChange={e => { setFilterService(e.target.value); setPage(1) }}>
              <option value="">Todos los servicios</option>
              {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="label text-xs">Estado</label>
            <select className="select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="expired">Vencido</option>
              <option value="suspended">Suspendido</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setFilterService(''); setFilterStatus('') }} className="btn-secondary text-xs">
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="table-header">Servicio / Cliente</th>
                <th className="table-header">Credenciales</th>
                <th className="table-header">Estado</th>
                <th className="table-header">Renovación</th>
                <th className="table-header">Precio</th>
                <th className="table-header text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(a => {
                const daysLeft = Math.ceil((new Date(a.renewal_date).getTime() - Date.now()) / 86400000)
                const realStatus = a.status === 'suspended' ? 'suspended' : daysLeft < 0 ? 'expired' : 'active'
                return (
                  <tr key={a.id} className="hover:bg-dark-600/30 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: `${SERVICE_COLORS[a.service_type]}20` }}>
                          {SERVICE_ICONS[a.service_type]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white"
                            style={{ color: SERVICE_COLORS[a.service_type] }}>
                            {a.service_type}
                          </p>
                          <p className="text-xs text-gray-400">{a.client_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-300 font-mono truncate max-w-[100px]">{a.email}</span>
                        <button onClick={() => handleCopy(a.email, 'Correo')}
                          className="p-1 text-gray-500 hover:text-brand-blue-400 transition-colors flex-shrink-0"
                          title="Copiar correo">
                          <Copy size={12} />
                        </button>
                        <button onClick={() => handleCopy(a.password, 'Contraseña')}
                          className="text-xs text-gray-600 hover:text-brand-orange-400 transition-colors flex-shrink-0"
                          title="Copiar contraseña">
                          •••
                        </button>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusColor(realStatus)}`}>
                        {getStatusLabel(realStatus)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="text-sm text-gray-300">{formatDate(a.renewal_date)}</p>
                        <p className={`text-xs ${daysLeft < 0 ? 'text-red-400' : daysLeft <= 3 ? 'text-yellow-400' : 'text-gray-500'}`}>
                          {daysLeft < 0 ? `Venció hace ${Math.abs(daysLeft)}d` : daysLeft === 0 ? 'Vence hoy' : `${daysLeft}d restantes`}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-green-400 font-medium text-sm">${a.price}</span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openRenew(a)}
                          className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                          title="Renovar">
                          <RefreshCw size={14} />
                        </button>
                        <button onClick={() => handleMarkExpired(a)}
                          className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-colors"
                          title="Marcar vencida">
                          <Monitor size={14} />
                        </button>
                        <button onClick={() => openEdit(a)}
                          className="p-1.5 text-gray-400 hover:text-brand-orange-400 hover:bg-brand-orange-400/10 rounded-lg transition-colors"
                          title="Editar">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(a)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <EmptyState icon={Monitor} title="Sin cuentas" description="Crea la primera cuenta de streaming" />
          )}
        </div>

        <Pagination page={page} totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
          onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={selected ? 'Editar cuenta' : 'Nueva cuenta'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Cliente *</label>
            <select className="select" value={form.client_id} onChange={e => handleClientChange(e.target.value)}>
              <option value="">Seleccionar cliente</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Servicio *</label>
            <select className="select" value={form.service_type}
              onChange={e => setForm({ ...form, service_type: e.target.value as ServiceType })}>
              {SERVICES.map(s => <option key={s} value={s}>{SERVICE_ICONS[s]} {s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Estado</label>
            <select className="select" value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value as AccountStatus })}>
              <option value="active">Activo</option>
              <option value="expired">Vencido</option>
              <option value="suspended">Suspendido</option>
            </select>
          </div>
          <div>
            <label className="label">Correo *</label>
            <input className="input" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} placeholder="cuenta@email.com" />
          </div>
          <div>
            <label className="label">Contraseña *</label>
            <input className="input" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>
          <div>
            <label className="label">Fecha inicio</label>
            <input className="input" type="date" value={form.start_date}
              onChange={e => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div>
            <label className="label">Fecha renovación *</label>
            <input className="input" type="date" value={form.renewal_date}
              onChange={e => setForm({ ...form, renewal_date: e.target.value })} />
          </div>
          <div>
            <label className="label">Precio ($)</label>
            <input className="input" type="number" value={form.price}
              onChange={e => setForm({ ...form, price: Number(e.target.value) })} placeholder="0" />
          </div>
          <div>
            <label className="label">Contador de perfiles</label>
            <input className="input" type="number" value={form.counter}
              onChange={e => setForm({ ...form, counter: Number(e.target.value) })} placeholder="1" />
          </div>
          <div>
            <label className="label">Estado de cuenta</label>
            <input className="input" value={form.account_status}
              onChange={e => setForm({ ...form, account_status: e.target.value })} placeholder="Premium, Básico..." />
          </div>
          <div>
            <label className="label">Teléfono cliente</label>
            <input className="input opacity-60 cursor-not-allowed" value={form.client_phone} readOnly />
          </div>
          <div className="col-span-2">
            <label className="label">Observaciones</label>
            <textarea className="input resize-none" rows={2} value={form.observations}
              onChange={e => setForm({ ...form, observations: e.target.value })} />
          </div>
          <div className="col-span-2 flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button onClick={handleSave} className="btn-primary flex-1 justify-center">
              {selected ? 'Guardar cambios' : 'Crear cuenta'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Renew Modal */}
      <Modal isOpen={renewModal} onClose={() => setRenewModal(false)} title="Renovar cuenta" size="sm">
        <div className="space-y-4">
          <div className="p-3 bg-dark-600 rounded-lg">
            <p className="text-sm font-medium text-white">{selected?.client_name}</p>
            <p className="text-xs text-gray-400">{selected?.service_type}</p>
          </div>
          <div>
            <label className="label">Nueva fecha de renovación</label>
            <input className="input" type="date" value={newRenewDate}
              onChange={e => setNewRenewDate(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setRenewModal(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button onClick={handleRenew} className="btn-primary flex-1 justify-center">
              <RefreshCw size={14} /> Renovar
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteAccount(deleteTarget.id)
            toast.success('Cuenta eliminada')
            setDeleteTarget(null)
          }
        }}
        title="Eliminar cuenta"
        message={`¿Eliminar la cuenta de ${deleteTarget?.service_type} de ${deleteTarget?.client_name}?`}
        confirmLabel="Eliminar"
        danger
      />
    </div>
  )
}
