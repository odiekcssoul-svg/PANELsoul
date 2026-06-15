import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { Plus, Pencil, Trash2, Users, Phone, Mail, Eye } from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import { Client } from '@/types'
import toast from 'react-hot-toast'
import { SERVICE_ICONS } from '@/lib/utils'

const PAGE_SIZE = 10

const emptyForm = { name: '', phone: '', email: '', observations: '' }

export default function Clients() {
  const { clients, accounts, addClient, updateClient, deleteClient } = useStore()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selected, setSelected] = useState<Client | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = useMemo(() =>
    clients.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    ), [clients, search])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  function openCreate() {
    setSelected(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(c: Client) {
    setSelected(c)
    setForm({ name: c.name, phone: c.phone, email: c.email, observations: c.observations || '' })
    setModalOpen(true)
  }

  function openHistory(c: Client) {
    setSelected(c)
    setHistoryOpen(true)
  }

  function handleSave() {
    if (!form.name.trim()) { toast.error('El nombre es requerido'); return }
    if (selected) {
      updateClient(selected.id, form)
      toast.success('Cliente actualizado')
    } else {
      addClient(form)
      toast.success('Cliente creado')
    }
    setModalOpen(false)
  }

  function handleDelete() {
    if (deleteTarget) {
      deleteClient(deleteTarget.id)
      toast.success('Cliente eliminado')
      setDeleteTarget(null)
    }
  }

  const clientAccounts = selected
    ? accounts.filter(a => a.client_id === selected.id)
    : []

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Buscar cliente..." className="max-w-sm" />
        </div>
        <button onClick={openCreate} className="btn-primary whitespace-nowrap">
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Nombre</th>
                <th className="table-header hidden sm:table-cell">Teléfono</th>
                <th className="table-header hidden md:table-cell">Correo</th>
                <th className="table-header hidden lg:table-cell">Registro</th>
                <th className="table-header hidden xl:table-cell">Servicios</th>
                <th className="table-header text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(c => {
                const svc = accounts.filter(a => a.client_id === c.id)
                return (
                  <tr key={c.id} className="hover:bg-dark-600/30 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue-600 to-brand-blue-800 
                          flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{c.name}</p>
                          <p className="text-xs text-gray-500 sm:hidden">{c.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Phone size={13} /> {c.phone}
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Mail size={13} /> {c.email}
                      </div>
                    </td>
                    <td className="table-cell hidden lg:table-cell text-gray-400">{formatDate(c.created_at)}</td>
                    <td className="table-cell hidden xl:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {svc.slice(0, 3).map(a => (
                          <span key={a.id} title={a.service_type} className="text-lg leading-none">
                            {SERVICE_ICONS[a.service_type] || '📺'}
                          </span>
                        ))}
                        {svc.length > 3 && <span className="text-xs text-gray-500">+{svc.length - 3}</span>}
                        {svc.length === 0 && <span className="text-xs text-gray-600">Sin servicios</span>}
                      </div>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openHistory(c)}
                          className="p-1.5 text-gray-400 hover:text-brand-blue-400 hover:bg-brand-blue-400/10 rounded-lg transition-colors"
                          title="Historial">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => openEdit(c)}
                          className="p-1.5 text-gray-400 hover:text-brand-orange-400 hover:bg-brand-orange-400/10 rounded-lg transition-colors"
                          title="Editar">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(c)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Eliminar">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <EmptyState icon={Users} title="Sin clientes" description="Crea tu primer cliente para comenzar" />
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage}
          totalItems={filtered.length} pageSize={PAGE_SIZE} />
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={selected ? 'Editar cliente' : 'Nuevo cliente'}>
        <div className="space-y-4">
          <div>
            <label className="label">Nombre *</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nombre completo" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Teléfono</label>
              <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="555-0000" />
            </div>
            <div>
              <label className="label">Correo</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" />
            </div>
          </div>
          <div>
            <label className="label">Observaciones</label>
            <textarea className="input resize-none" rows={3} value={form.observations}
              onChange={e => setForm({ ...form, observations: e.target.value })} placeholder="Notas adicionales..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button onClick={handleSave} className="btn-primary flex-1 justify-center">
              {selected ? 'Guardar cambios' : 'Crear cliente'}
            </button>
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal isOpen={historyOpen} onClose={() => setHistoryOpen(false)}
        title={`Historial: ${selected?.name}`} size="lg">
        <div>
          <p className="text-xs text-gray-500 mb-3">Servicios contratados</p>
          {clientAccounts.length === 0 ? (
            <p className="text-gray-500 text-sm py-6 text-center">Este cliente no tiene servicios</p>
          ) : (
            <div className="space-y-2">
              {clientAccounts.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-dark-600 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{SERVICE_ICONS[a.service_type]}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{a.service_type}</p>
                      <p className="text-xs text-gray-500">{a.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${a.status === 'active' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                      {a.status === 'active' ? 'Activo' : 'Vencido'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Renueva: {formatDate(a.renewal_date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar cliente"
        message={`¿Estás seguro de eliminar a "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
      />
    </div>
  )
}
