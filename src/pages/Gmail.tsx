import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { Plus, Pencil, Trash2, Mail, Copy, Eye, EyeOff } from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { getStatusColor, getStatusLabel, formatDate, copyToClipboard } from '@/lib/utils'
import { GmailAccount } from '@/types'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10
const emptyForm = { email: '', password: '', status: 'active' as GmailAccount['status'], observations: '' }

export default function Gmail() {
  const { gmailAccounts, addGmail, updateGmail, deleteGmail } = useStore()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<GmailAccount | null>(null)
  const [selected, setSelected] = useState<GmailAccount | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [showPassId, setShowPassId] = useState<string | null>(null)

  const filtered = useMemo(() =>
    gmailAccounts.filter(g =>
      g.email.toLowerCase().includes(search.toLowerCase()) ||
      (g.observations || '').toLowerCase().includes(search.toLowerCase())
    ), [gmailAccounts, search])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function openCreate() { setSelected(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(g: GmailAccount) {
    setSelected(g)
    setForm({ email: g.email, password: g.password, status: g.status, observations: g.observations || '' })
    setModalOpen(true)
  }

  function handleSave() {
    if (!form.email.trim()) { toast.error('El correo es requerido'); return }
    if (selected) {
      updateGmail(selected.id, form)
      toast.success('Cuenta actualizada')
    } else {
      addGmail(form)
      toast.success('Cuenta creada')
    }
    setModalOpen(false)
  }

  const statusCounts = useMemo(() => ({
    active: gmailAccounts.filter(g => g.status === 'active').length,
    inactive: gmailAccounts.filter(g => g.status === 'inactive').length,
    banned: gmailAccounts.filter(g => g.status === 'banned').length,
  }), [gmailAccounts])

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Activas', count: statusCounts.active, color: 'text-green-400' },
          { label: 'Inactivas', count: statusCounts.inactive, color: 'text-gray-400' },
          { label: 'Baneadas', count: statusCounts.banned, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1) }}
          placeholder="Buscar correo..." className="flex-1 max-w-sm" />
        <button onClick={openCreate} className="btn-primary whitespace-nowrap">
          <Plus size={16} /> Nuevo correo
        </button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Correo</th>
                <th className="table-header">Contraseña</th>
                <th className="table-header">Estado</th>
                <th className="table-header hidden md:table-cell">Creación</th>
                <th className="table-header hidden lg:table-cell">Observaciones</th>
                <th className="table-header text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(g => (
                <tr key={g.id} className="hover:bg-dark-600/30 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-red-400 flex-shrink-0" />
                      <span className="text-sm text-white font-mono">{g.email}</span>
                      <button onClick={() => { copyToClipboard(g.email); toast.success('Correo copiado') }}
                        className="p-1 text-gray-500 hover:text-brand-blue-400 transition-colors">
                        <Copy size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-gray-300">
                        {showPassId === g.id ? g.password : '••••••••'}
                      </span>
                      <button onClick={() => setShowPassId(showPassId === g.id ? null : g.id)}
                        className="p-1 text-gray-500 hover:text-gray-300 transition-colors">
                        {showPassId === g.id ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button onClick={() => { copyToClipboard(g.password); toast.success('Contraseña copiada') }}
                        className="p-1 text-gray-500 hover:text-brand-orange-400 transition-colors">
                        <Copy size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${getStatusColor(g.status)}`}>
                      {getStatusLabel(g.status)}
                    </span>
                  </td>
                  <td className="table-cell hidden md:table-cell text-gray-400 text-sm">
                    {formatDate(g.created_at)}
                  </td>
                  <td className="table-cell hidden lg:table-cell text-gray-400 text-sm max-w-[200px] truncate">
                    {g.observations || '—'}
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(g)}
                        className="p-1.5 text-gray-400 hover:text-brand-orange-400 hover:bg-brand-orange-400/10 rounded-lg transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(g)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <EmptyState icon={Mail} title="Sin cuentas Gmail" description="Agrega tus cuentas de Gmail" />
          )}
        </div>
        <Pagination page={page} totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
          onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={selected ? 'Editar correo' : 'Nuevo correo'}>
        <div className="space-y-4">
          <div>
            <label className="label">Correo Gmail *</label>
            <input className="input" type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} placeholder="cuenta@gmail.com" />
          </div>
          <div>
            <label className="label">Contraseña *</label>
            <input className="input" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>
          <div>
            <label className="label">Estado</label>
            <select className="select" value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value as GmailAccount['status'] })}>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="banned">Baneado</option>
            </select>
          </div>
          <div>
            <label className="label">Observaciones</label>
            <textarea className="input resize-none" rows={3} value={form.observations}
              onChange={e => setForm({ ...form, observations: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button onClick={handleSave} className="btn-primary flex-1 justify-center">
              {selected ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) { deleteGmail(deleteTarget.id); toast.success('Cuenta eliminada'); setDeleteTarget(null) } }}
        title="Eliminar correo"
        message={`¿Eliminar "${deleteTarget?.email}"?`}
        confirmLabel="Eliminar"
        danger
      />
    </div>
  )
}
