import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { Plus, Pencil, Trash2, Truck, Download } from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  getStatusColor, getStatusLabel, formatDate,
  getServiceIcon, getServiceColor,
  getAllServices, getCustomServices, saveCustomServices,
  DEFAULT_CUSTOM_ICON, DEFAULT_CUSTOM_COLOR,
} from '@/lib/utils'
import { Provider, ServiceType } from '@/types'
import { exportProvidersExcel } from '@/lib/export'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

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

  // Servicios dinámicos + modal de nuevo servicio
  const [services, setServices] = useState<string[]>(() => getAllServices())
  const [newSvcModal, setNewSvcModal] = useState(false)
  const [newSvcName, setNewSvcName] = useState('')
  const [newSvcIcon, setNewSvcIcon] = useState(DEFAULT_CUSTOM_ICON)
  const [newSvcColor, setNewSvcColor] = useState(DEFAULT_CUSTOM_COLOR)

  function openNewServiceModal() {
    setNewSvcName('')
    setNewSvcIcon(DEFAULT_CUSTOM_ICON)
    setNewSvcColor(DEFAULT_CUSTOM_COLOR)
    setNewSvcModal(true)
  }

  function handleAddService() {
    const trimmed = newSvcName.trim()
    if (!trimmed) { toast.error('Escribe el nombre del servicio'); return }
    if (services.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Ese servicio ya existe'); return
    }
    const existing = getCustomServices()
    saveCustomServices([...existing, { name: trimmed, icon: newSvcIcon, color: newSvcColor }])
    const updated = getAllServices()
    setServices(updated)
    setForm(f => ({ ...f, service: trimmed as ServiceType }))
    setNewSvcModal(false)
    toast.success(`Servicio "${trimmed}" agregado`)
  }

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
                    style={{ background: `${getServiceColor(p.service)}20` }}>
                    {getServiceIcon(p.service)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{p.name}</p>
                    <p className="text-xs" style={{ color: getServiceColor(p.service) }}>{p.service}</p>
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
              <div className="flex gap-2">
                <select className="select flex-1" value={form.service}
                  onChange={e => setForm({ ...form, service: e.target.value as ServiceType })}>
                  {services.map(s => <option key={s} value={s}>{getServiceIcon(s)} {s}</option>)}
                </select>
                <button type="button" onClick={openNewServiceModal}
                  className="btn-secondary px-3 flex-shrink-0" title="Agregar servicio personalizado">
                  <Plus size={15} />
                </button>
              </div>
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

      {/* New custom service modal */}
      <Modal isOpen={newSvcModal} onClose={() => setNewSvcModal(false)}
        title="Agregar servicio personalizado" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Nombre del servicio *</label>
            <input
              className="input"
              value={newSvcName}
              onChange={e => setNewSvcName(e.target.value)}
              placeholder="Ej: Canela TV, MUBI, Apple TV..."
              onKeyDown={e => e.key === 'Enter' && handleAddService()}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Emoji / ícono</label>
              <input
                className="input text-center text-2xl"
                value={newSvcIcon}
                onChange={e => setNewSvcIcon(e.target.value)}
                placeholder="📺"
                maxLength={4}
              />
              <p className="text-xs text-gray-500 mt-1">Pega un emoji</p>
            </div>
            <div>
              <label className="label">Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  className="h-10 w-14 rounded-lg border border-dark-400 bg-dark-600 cursor-pointer p-1"
                  value={newSvcColor}
                  onChange={e => setNewSvcColor(e.target.value)}
                />
                <input
                  className="input flex-1 font-mono text-sm"
                  value={newSvcColor}
                  onChange={e => setNewSvcColor(e.target.value)}
                  placeholder="#6366F1"
                  maxLength={7}
                />
              </div>
            </div>
          </div>
          {newSvcName.trim() && (
            <div className="p-3 bg-dark-600 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: `${newSvcColor}20` }}>
                {newSvcIcon || DEFAULT_CUSTOM_ICON}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: newSvcColor }}>
                  {newSvcName.trim()}
                </p>
                <p className="text-xs text-gray-500">Vista previa</p>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button onClick={() => setNewSvcModal(false)} className="btn-secondary flex-1 justify-center">
              Cancelar
            </button>
            <button onClick={handleAddService} className="btn-primary flex-1 justify-center">
              <Plus size={15} /> Agregar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
