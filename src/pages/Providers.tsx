import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { Plus, Pencil, Trash2, Truck, Download } from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { getStatusColor, getStatusLabel, formatDate, SERVICE_ICONS, SERVICE_COLORS } from '@/lib/utils'
import { Provider, ServiceType } from '@/types'
import { exportProvidersExcel } from '@/lib/export'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10
const SERVICES: ServiceType[] = [
  'Netflix', 'Prime Video', 'Disney+', 'HBO Max', 'Spotify',
  'YouTube Premium', 'Crunchyroll', 'Vix Premium', 'Paramount+',
]
const emptyForm = {
  name: '', service: 'Netflix' as ServiceType,
  contact: '', renewal_date: '', price: 0,
  status: 'active' as Provider['status'], observations: '',
}

export default function Providers() {
  const { providers, addProvider, updateProvider, deleteProvider } = useStore()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Provider | null>(null)
  const [selected, setSelected] = useState<Provider | null>(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = useMemo(() =>
    providers.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.service.toLowerCase().includes(search.toLowerCase()) ||
      p.contact.includes(search)
    ), [providers, search])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function openCreate() { setSelected(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(p: Provider) {
    setSelected(p)
    setForm({
      name: p.name, service: p.service, contact: p.contact,
      renewal_date: p.renewal_date, price: p.price,
      status: p.status, observations: p.observations || '',
    })
    setModalOpen(true)
  }

  function handleSave() {
    if (!form.name.trim()) { toast.error('El nombre es requerido'); return }
    if (selected) {
      updateProvider(selected.id, form)
      toast.success('Proveedor actualizado')
    } else {
      addProvider(form)
      toast.success('Proveedor creado')
    }
    setModalOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1) }}
          placeholder="Buscar proveedor..." className="flex-1 max-w-sm" />
        <div className="flex gap-2">
          <button onClick={() => exportProvidersExcel(filtered)} className="btn-secondary">
            <Download size={15} /> Excel
          </button>
          <button onClick={openCreate} className="btn-primary whitespace-nowrap">
            <Plus size={16} /> Nuevo proveedor
          </button>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {paginated.map(p => {
          const daysLeft = Math.ceil((new Date(p.renewal_date).getTime() - Date.now()) / 86400000)
          return (
            <div key={p.id} className={`card hover:border-dark-400 transition-all ${
              daysLeft < 0 ? 'border-red-500/30' : daysLeft <= 5 ? 'border-yellow-500/30' : ''
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `${SERVICE_COLORS[p.service]}20` }}>
                    {SERVICE_ICONS[p.service]}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{p.name}</p>
                    <p className="text-xs" style={{ color: SERVICE_COLORS[p.service] }}>{p.service}</p>
                  </div>
                </div>
                <span className={`badge ${getStatusColor(p.status)}`}>
                  {getStatusLabel(p.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div>
                  <p className="text-gray-500">Contacto</p>
                  <p className="text-gray-300">{p.contact}</p>
                </div>
                <div>
                  <p className="text-gray-500">Precio</p>
                  <p className="text-green-400 font-semibold">${p.price}</p>
                </div>
                <div>
                  <p className="text-gray-500">Renovación</p>
                  <p className="text-gray-300">{p.renewal_date ? formatDate(p.renewal_date) : '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Días restantes</p>
                  <p className={daysLeft < 0 ? 'text-red-400' : daysLeft <= 5 ? 'text-yellow-400' : 'text-gray-300'}>
                    {daysLeft < 0 ? `Venció hace ${Math.abs(daysLeft)}d` : `${daysLeft}d`}
                  </p>
                </div>
              </div>

              {p.observations && (
                <p className="text-xs text-gray-500 mb-3 italic">📝 {p.observations}</p>
              )}

              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="btn-secondary flex-1 justify-center text-xs py-1.5">
                  <Pencil size={13} /> Editar
                </button>
                <button onClick={() => setDeleteTarget(p)}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card">
          <EmptyState icon={Truck} title="Sin proveedores" description="Agrega tus proveedores de streaming" />
        </div>
      )}

      <Pagination page={page} totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
        onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={selected ? 'Editar proveedor' : 'Nuevo proveedor'}>
        <div className="space-y-4">
          <div>
            <label className="label">Nombre del proveedor *</label>
            <input className="input" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} placeholder="StreamPro MX" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Servicio</label>
              <select className="select" value={form.service}
                onChange={e => setForm({ ...form, service: e.target.value as ServiceType })}>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Contacto</label>
              <input className="input" value={form.contact}
                onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="555-0000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Fecha renovación</label>
              <input className="input" type="date" value={form.renewal_date}
                onChange={e => setForm({ ...form, renewal_date: e.target.value })} />
            </div>
            <div>
              <label className="label">Precio ($)</label>
              <input className="input" type="number" value={form.price}
                onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="label">Estado</label>
            <select className="select" value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value as Provider['status'] })}>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
          <div>
            <label className="label">Observaciones</label>
            <textarea className="input resize-none" rows={2} value={form.observations}
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
        onConfirm={() => { if (deleteTarget) { deleteProvider(deleteTarget.id); toast.success('Proveedor eliminado'); setDeleteTarget(null) } }}
        title="Eliminar proveedor"
        message={`¿Eliminar el proveedor "${deleteTarget?.name}"?`}
        confirmLabel="Eliminar"
        danger
      />
    </div>
  )
}
