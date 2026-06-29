import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/store/useStore'
import {
  Gift, Users, Tag, Package, BarChart3, Plus, Pencil, Trash2,
  Copy, Check, X, Upload, Download, MessageCircle, Search,
  RefreshCw, ToggleLeft, ToggleRight, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle, Clock, Loader2, FileSpreadsheet,
} from 'lucide-react'
import { GiftCode, GiftClient, GiftInventory, GiftRedemption } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { format, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

type Tab = 'dashboard' | 'clients' | 'codes' | 'inventory' | 'history'
const PAGE = 12

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KCard({ icon: Icon, label, value, color, sub }: { icon: React.ElementType, label: string, value: string | number, color: string, sub?: string }) {
  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-lg ${color}`}><Icon size={14} className="text-white"/></div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-600">{sub}</p>}
    </div>
  )
}

// ── Empty ─────────────────────────────────────────────────────────────────────
function Empty({ icon: Icon, text }: { icon: React.ElementType, text: string }) {
  return (
    <div className="flex flex-col items-center py-14 gap-3">
      <Icon size={32} className="text-gray-700"/>
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  )
}

const emptyCode = { name: '', code: '', product: '', description: '', start_date: format(new Date(), 'yyyy-MM-dd'), expiry_date: '', max_redemptions: 0, max_per_user: 1, status: 'active' as 'active' | 'inactive' }

export default function GiftCenter() {
  const { currentUser } = useStore()
  const ownerId = currentUser?.id

  const [tab, setTab] = useState<Tab>('dashboard')
  const [loading, setLoading] = useState(false)

  // Data
  const [codes, setCodes] = useState<GiftCode[]>([])
  const [clients, setClients] = useState<GiftClient[]>([])
  const [inventory, setInventory] = useState<GiftInventory[]>([])
  const [redemptions, setRedemptions] = useState<GiftRedemption[]>([])

  // Modals
  const [codeModal, setCodeModal] = useState(false)
  const [codeForm, setCodeForm] = useState(emptyCode)
  const [editCode, setEditCode] = useState<GiftCode | null>(null)
  const [deleteCode, setDeleteCode] = useState<GiftCode | null>(null)
  const [clientModal, setClientModal] = useState<GiftClient | null>(null)
  const [deleteClient, setDeleteClientTarget] = useState<GiftClient | null>(null)
  const [invModal, setInvModal] = useState(false)
  const [invForm, setInvForm] = useState({ product: '', email: '', password: '', gift_code_id: '' })
  const [csvLoading, setCsvLoading] = useState(false)

  // Search/filter
  const [searchClient, setSearchClient] = useState('')
  const [searchInv, setSearchInv] = useState('')
  const [clientPage, setClientPage] = useState(1)
  const [invPage, setInvPage] = useState(1)
  const [redPage, setRedPage] = useState(1)

  useEffect(() => { if (ownerId) loadAll() }, [ownerId])

  async function loadAll() {
    setLoading(true)
    const [c, cl, inv, r] = await Promise.all([
      supabase.from('gift_codes').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }),
      supabase.from('gift_clients').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }),
      supabase.from('gift_inventory').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }),
      supabase.from('gift_redemptions').select('*').eq('owner_id', ownerId).order('redeemed_at', { ascending: false }),
    ])
    if (c.data) setCodes(c.data as GiftCode[])
    if (cl.data) setClients(cl.data as GiftClient[])
    if (inv.data) setInventory(inv.data as GiftInventory[])
    if (r.data) setRedemptions(r.data as GiftRedemption[])
    setLoading(false)
  }

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const today = format(new Date(), 'yyyy-MM-dd')
  const kpi = useMemo(() => {
    const todayRed = redemptions.filter(r => r.redeemed_at?.startsWith(today) && r.status === 'completed').length
    const monthRed = redemptions.filter(r => r.redeemed_at?.startsWith(format(new Date(), 'yyyy-MM')) && r.status === 'completed').length
    const available = inventory.filter(i => i.status === 'available').length
    const delivered = inventory.filter(i => i.status === 'delivered').length
    const activeCodes = codes.filter(c => c.status === 'active').length
    const expiredCodes = codes.filter(c => c.expiry_date && new Date(c.expiry_date) < new Date()).length
    const todayClients = clients.filter(c => c.created_at?.startsWith(today)).length
    const conversion = clients.length > 0 ? Math.round((redemptions.filter(r => r.status === 'completed').length / clients.length) * 100) : 0
    return { todayRed, monthRed, available, delivered, activeCodes, expiredCodes, todayClients, conversion }
  }, [codes, clients, inventory, redemptions])

  // ── Codes CRUD ───────────────────────────────────────────────────────────────
  async function saveCode() {
    if (!codeForm.name || !codeForm.code || !codeForm.product) { toast.error('Nombre, código y producto son requeridos'); return }
    if (editCode) {
      const { error } = await supabase.from('gift_codes').update({ ...codeForm }).eq('id', editCode.id)
      if (!error) { toast.success('Código actualizado'); await loadAll() }
    } else {
      const { error } = await supabase.from('gift_codes').insert({ ...codeForm, owner_id: ownerId, redemption_count: 0 })
      if (!error) { toast.success('Código creado'); await loadAll() }
      else toast.error(error.message)
    }
    setCodeModal(false); setEditCode(null); setCodeForm(emptyCode)
  }

  async function toggleCode(c: GiftCode) {
    const newStatus = c.status === 'active' ? 'inactive' : 'active'
    await supabase.from('gift_codes').update({ status: newStatus }).eq('id', c.id)
    setCodes(prev => prev.map(x => x.id === c.id ? { ...x, status: newStatus } : x))
  }

  async function confirmDeleteCode() {
    if (!deleteCode) return
    await supabase.from('gift_codes').delete().eq('id', deleteCode.id)
    setCodes(prev => prev.filter(c => c.id !== deleteCode.id))
    toast.success('Código eliminado'); setDeleteCode(null)
  }

  function duplicateCode(c: GiftCode) {
    setEditCode(null)
    setCodeForm({ name: c.name + ' (copia)', code: c.code + '_2', product: c.product, description: c.description || '', start_date: c.start_date, expiry_date: c.expiry_date || '', max_redemptions: c.max_redemptions, max_per_user: c.max_per_user, status: 'active' })
    setCodeModal(true)
  }

  // ── Inventory ────────────────────────────────────────────────────────────────
  async function saveInventory() {
    if (!invForm.product || !invForm.email || !invForm.password) { toast.error('Producto, correo y contraseña son requeridos'); return }
    const { error } = await supabase.from('gift_inventory').insert({ ...invForm, owner_id: ownerId, gift_code_id: invForm.gift_code_id || null, status: 'available' })
    if (!error) { toast.success('Cuenta agregada'); await loadAll() }
    setInvModal(false); setInvForm({ product: '', email: '', password: '', gift_code_id: '' })
  }

  async function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setCsvLoading(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const wb = XLSX.read(ev.target!.result, { type: 'array' })
      const rows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' })
      const items = rows.slice(1).filter(r => r[0] && r[1] && r[2]).map(r => ({ owner_id: ownerId, product: String(r[0]).trim(), email: String(r[1]).trim(), password: String(r[2]).trim(), gift_code_id: r[3] ? String(r[3]).trim() : null, status: 'available' }))
      if (items.length > 0) {
        const { error } = await supabase.from('gift_inventory').insert(items)
        if (!error) { toast.success(`${items.length} cuentas importadas`); await loadAll() }
        else toast.error('Error al importar')
      }
      setCsvLoading(false)
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  async function deleteInventoryItem(id: string) {
    await supabase.from('gift_inventory').delete().eq('id', id)
    setInventory(prev => prev.filter(i => i.id !== id))
    toast.success('Cuenta eliminada')
  }

  // ── Clients ───────────────────────────────────────────────────────────────────
  async function deleteClientItem() {
    if (!deleteClient) return
    await supabase.from('gift_clients').delete().eq('id', deleteClient.id)
    setClients(prev => prev.filter(c => c.id !== deleteClient.id))
    toast.success('Cliente eliminado'); setDeleteClientTarget(null)
  }

  function exportClientsExcel() {
    const data = clients.map(c => ({ Nombre: c.name, Teléfono: c.phone, Correo: c.email || '', IP: c.ip_address || '', País: c.country || '', Ciudad: c.city || '', Dispositivo: c.device || '', Registro: formatDate(c.created_at) }))
    const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Clientes'); XLSX.writeFile(wb, 'clientes-canje.xlsx')
    toast.success('Exportado')
  }

  const filteredClients = useMemo(() => clients.filter(c => !searchClient || c.name.toLowerCase().includes(searchClient.toLowerCase()) || c.phone.includes(searchClient) || (c.email || '').toLowerCase().includes(searchClient.toLowerCase())), [clients, searchClient])
  const filteredInv = useMemo(() => inventory.filter(i => !searchInv || i.email.toLowerCase().includes(searchInv.toLowerCase()) || i.product.toLowerCase().includes(searchInv.toLowerCase())), [inventory, searchInv])
  const paginatedClients = filteredClients.slice((clientPage - 1) * PAGE, clientPage * PAGE)
  const paginatedInv = filteredInv.slice((invPage - 1) * PAGE, invPage * PAGE)
  const paginatedRed = redemptions.slice((redPage - 1) * PAGE, redPage * PAGE)

  const TABS = [
    { key: 'dashboard' as Tab, icon: BarChart3,    label: 'Dashboard' },
    { key: 'clients'   as Tab, icon: Users,        label: 'Clientes',   count: clients.length },
    { key: 'codes'     as Tab, icon: Tag,           label: 'Códigos',    count: codes.length },
    { key: 'inventory' as Tab, icon: Package,       label: 'Inventario', count: inventory.filter(i=>i.status==='available').length },
    { key: 'history'   as Tab, icon: RefreshCw,     label: 'Historial',  count: redemptions.length },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Gift size={18} className="text-violet-400"/>
          </div>
          <div>
            <h2 className="font-bold text-white">Centro de Canje</h2>
            <p className="text-xs text-gray-500">Gestión de regalos digitales</p>
          </div>
        </div>
        <a href="/canjear" target="_blank"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-600/15 border border-violet-500/25 text-violet-400 text-xs font-medium hover:bg-violet-600/25 transition-colors">
          <Gift size={12}/> Ver página pública
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-700 p-1 rounded-xl overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${tab === t.key ? 'bg-dark-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            <t.icon size={13}/> {t.label}
            {t.count != null && t.count > 0 && <span className="text-violet-400 font-bold">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ──────────────────────────────────────────────────────────── */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KCard icon={Users}      label="Clientes"         value={clients.length}       color="bg-brand-blue-600"  sub={`+${kpi.todayClients} hoy`}/>
            <KCard icon={Tag}        label="Códigos activos"  value={kpi.activeCodes}       color="bg-violet-600"/>
            <KCard icon={Package}    label="Disponibles"      value={kpi.available}         color="bg-green-600"/>
            <KCard icon={CheckCircle}label="Entregadas"       value={kpi.delivered}         color="bg-brand-orange-600"/>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KCard icon={Gift}       label="Canjes hoy"       value={kpi.todayRed}          color="bg-emerald-600"/>
            <KCard icon={RefreshCw}  label="Canjes este mes"  value={kpi.monthRed}          color="bg-cyan-600"/>
            <KCard icon={Clock}      label="Códigos vencidos" value={kpi.expiredCodes}       color="bg-red-600"/>
            <KCard icon={BarChart3}  label="Conversión"       value={`${kpi.conversion}%`}  color="bg-purple-600"  sub="Registros → Canjes"/>
          </div>

          {/* Últimos canjes */}
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-600 flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">Últimos canjes</h3>
              <button onClick={() => setTab('history')} className="text-xs text-gray-500 hover:text-violet-400 transition-colors">Ver todos →</button>
            </div>
            <div className="divide-y divide-dark-600">
              {redemptions.slice(0, 6).map(r => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-600/20">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0"><Gift size={13} className="text-violet-400"/></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{r.code_used}</p>
                    <p className="text-xs text-gray-500">{r.product} · {r.device || 'Desconocido'}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{r.status === 'completed' ? 'Completado' : 'Fallido'}</span>
                  <p className="text-xs text-gray-600 flex-shrink-0">{r.redeemed_at ? new Date(r.redeemed_at).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</p>
                </div>
              ))}
              {redemptions.length === 0 && <Empty icon={Gift} text="Sin canjes aún"/>}
            </div>
          </div>
        </div>
      )}

      {/* ── CLIENTES ──────────────────────────────────────────────────────────── */}
      {tab === 'clients' && (
        <div className="card p-0 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-dark-600">
            <div className="flex-1 min-w-[180px]"><SearchInput value={searchClient} onChange={v => { setSearchClient(v); setClientPage(1) }} placeholder="Buscar cliente..."/></div>
            <div className="flex gap-2">
              <button onClick={exportClientsExcel} className="btn-secondary text-xs"><FileSpreadsheet size={13}/> Excel</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead><tr className="border-b border-dark-600">
                <th className="table-header">Nombre</th>
                <th className="table-header">Teléfono</th>
                <th className="table-header hidden md:table-cell">Correo</th>
                <th className="table-header hidden lg:table-cell">Dispositivo</th>
                <th className="table-header hidden lg:table-cell">Registro</th>
                <th className="table-header text-right">Acciones</th>
              </tr></thead>
              <tbody>
                {paginatedClients.map(c => (
                  <tr key={c.id} className="hover:bg-dark-600/20 border-b border-dark-600/40 last:border-0">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{c.name.charAt(0).toUpperCase()}</div>
                        <p className="text-sm font-medium text-white">{c.name}</p>
                      </div>
                    </td>
                    <td className="table-cell text-gray-300 text-sm">{c.phone}</td>
                    <td className="table-cell hidden md:table-cell text-gray-400 text-xs">{c.email || '—'}</td>
                    <td className="table-cell hidden lg:table-cell text-gray-500 text-xs">{c.device || '—'} · {c.browser || '—'}</td>
                    <td className="table-cell hidden lg:table-cell text-gray-500 text-xs">{formatDate(c.created_at)}</td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setClientModal(c)} className="p-1.5 text-gray-400 hover:text-violet-400 hover:bg-violet-400/10 rounded-lg transition-colors" title="Ver detalle"><Search size={13}/></button>
                        {c.phone && <a href={`https://wa.me/52${c.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-colors" title="WhatsApp"><MessageCircle size={13}/></a>}
                        <button onClick={() => setDeleteClientTarget(c)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredClients.length === 0 && <Empty icon={Users} text="Sin clientes registrados"/>}
          </div>
          <Pagination page={clientPage} totalPages={Math.ceil(filteredClients.length / PAGE)} onPageChange={setClientPage} totalItems={filteredClients.length} pageSize={PAGE}/>
        </div>
      )}

      {/* ── CÓDIGOS ──────────────────────────────────────────────────────────── */}
      {tab === 'codes' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => { setEditCode(null); setCodeForm(emptyCode); setCodeModal(true) }} className="btn-primary text-xs"><Plus size={13}/> Nuevo código</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {codes.map(c => {
              const expired = c.expiry_date && new Date(c.expiry_date) < new Date()
              const pct = c.max_redemptions > 0 ? Math.round((c.redemption_count / c.max_redemptions) * 100) : 0
              return (
                <div key={c.id} className="card hover:border-dark-400 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-white text-sm">{c.name}</p>
                      <code className="text-xs text-violet-400 font-mono bg-violet-500/10 px-2 py-0.5 rounded mt-1 inline-block">{c.code}</code>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'active' && !expired ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {expired ? 'Vencido' : c.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{c.product}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div><p className="text-gray-500">Canjes</p><p className="text-white">{c.redemption_count}{c.max_redemptions > 0 ? ` / ${c.max_redemptions}` : ' / ∞'}</p></div>
                    <div><p className="text-gray-500">Vence</p><p className="text-white">{c.expiry_date ? formatDate(c.expiry_date) : 'Sin límite'}</p></div>
                  </div>
                  {c.max_redemptions > 0 && <div className="w-full bg-dark-600 rounded-full h-1 mb-3"><div className="h-1 rounded-full bg-violet-500 transition-all" style={{ width: `${Math.min(pct, 100)}%` }}/></div>}
                  <div className="flex gap-1 flex-wrap">
                    <button onClick={() => { setEditCode(c); setCodeForm({ name: c.name, code: c.code, product: c.product, description: c.description || '', start_date: c.start_date, expiry_date: c.expiry_date || '', max_redemptions: c.max_redemptions, max_per_user: c.max_per_user, status: c.status }); setCodeModal(true) }} className="btn-secondary text-xs py-1"><Pencil size={11}/> Editar</button>
                    <button onClick={() => duplicateCode(c)} className="btn-secondary text-xs py-1"><Copy size={11}/> Duplicar</button>
                    <button onClick={() => toggleCode(c)} className="btn-secondary text-xs py-1">{c.status === 'active' ? <ToggleRight size={13} className="text-green-400"/> : <ToggleLeft size={13} className="text-gray-500"/>}</button>
                    <button onClick={() => setDeleteCode(c)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={13}/></button>
                  </div>
                </div>
              )
            })}
            {codes.length === 0 && <div className="card col-span-3"><Empty icon={Tag} text="Sin códigos creados"/></div>}
          </div>
        </div>
      )}

      {/* ── INVENTARIO ───────────────────────────────────────────────────────── */}
      {tab === 'inventory' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[180px]"><SearchInput value={searchInv} onChange={v => { setSearchInv(v); setInvPage(1) }} placeholder="Buscar cuenta..."/></div>
            <div className="flex gap-2">
              <label className="btn-secondary text-xs cursor-pointer">
                {csvLoading ? <Loader2 size={13} className="animate-spin"/> : <><Upload size={13}/> CSV</>}
                <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleCSV}/>
              </label>
              <button onClick={() => setInvModal(true)} className="btn-primary text-xs"><Plus size={13}/> Agregar cuenta</button>
            </div>
          </div>
          <p className="text-xs text-gray-600">Formato CSV: columnas Producto, Correo, Contraseña, CódigoAsociado (opcional)</p>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead><tr className="border-b border-dark-600">
                  <th className="table-header">Producto</th>
                  <th className="table-header">Correo</th>
                  <th className="table-header hidden md:table-cell">Estado</th>
                  <th className="table-header hidden lg:table-cell">Código</th>
                  <th className="table-header text-right">Acción</th>
                </tr></thead>
                <tbody>
                  {paginatedInv.map(i => (
                    <tr key={i.id} className="hover:bg-dark-600/20 border-b border-dark-600/40 last:border-0">
                      <td className="table-cell"><p className="text-sm text-white">{i.product}</p></td>
                      <td className="table-cell"><p className="text-xs font-mono text-gray-300">{i.email}</p></td>
                      <td className="table-cell hidden md:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${i.status === 'available' ? 'bg-green-500/10 text-green-400' : i.status === 'delivered' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400'}`}>
                          {i.status === 'available' ? 'Disponible' : i.status === 'delivered' ? 'Entregada' : 'Suspendida'}
                        </span>
                      </td>
                      <td className="table-cell hidden lg:table-cell text-xs text-gray-500">{codes.find(c => c.id === i.gift_code_id)?.code || '—'}</td>
                      <td className="table-cell text-right">
                        <button onClick={() => deleteInventoryItem(i.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={13}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredInv.length === 0 && <Empty icon={Package} text="Sin cuentas en inventario"/>}
            </div>
            <Pagination page={invPage} totalPages={Math.ceil(filteredInv.length / PAGE)} onPageChange={setInvPage} totalItems={filteredInv.length} pageSize={PAGE}/>
          </div>
        </div>
      )}

      {/* ── HISTORIAL ───────────────────────────────────────────────────────── */}
      {tab === 'history' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-dark-600 flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm">Historial de canjes</h3>
            <span className="text-xs text-gray-500">{redemptions.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead><tr className="border-b border-dark-600">
                <th className="table-header">Código</th>
                <th className="table-header">Producto</th>
                <th className="table-header hidden md:table-cell">Cuenta entregada</th>
                <th className="table-header hidden lg:table-cell">Dispositivo</th>
                <th className="table-header hidden lg:table-cell">Fecha</th>
                <th className="table-header">Estado</th>
              </tr></thead>
              <tbody>
                {paginatedRed.map(r => (
                  <tr key={r.id} className="hover:bg-dark-600/20 border-b border-dark-600/40 last:border-0">
                    <td className="table-cell"><code className="text-xs text-violet-400 font-mono">{r.code_used}</code></td>
                    <td className="table-cell text-sm text-gray-300">{r.product || '—'}</td>
                    <td className="table-cell hidden md:table-cell text-xs font-mono text-gray-400">{r.account_email || '—'}</td>
                    <td className="table-cell hidden lg:table-cell text-xs text-gray-500">{r.device || '—'} · {r.browser || '—'}</td>
                    <td className="table-cell hidden lg:table-cell text-xs text-gray-500">{r.redeemed_at ? new Date(r.redeemed_at).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td className="table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {r.status === 'completed' ? 'Completado' : 'Fallido'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {redemptions.length === 0 && <Empty icon={RefreshCw} text="Sin historial de canjes"/>}
          </div>
          <Pagination page={redPage} totalPages={Math.ceil(redemptions.length / PAGE)} onPageChange={setRedPage} totalItems={redemptions.length} pageSize={PAGE}/>
        </div>
      )}

      {/* ── MODAL CÓDIGO ─────────────────────────────────────────────────────── */}
      <Modal isOpen={codeModal} onClose={() => { setCodeModal(false); setEditCode(null); setCodeForm(emptyCode) }}
        title={editCode ? 'Editar código' : 'Nuevo código'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Nombre del código *</label>
            <input className="input" value={codeForm.name} onChange={e => setCodeForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Promo Julio 2026"/>
          </div>
          <div>
            <label className="label">Código *</label>
            <input className="input font-mono uppercase" value={codeForm.code} onChange={e => setCodeForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="REGALO2026"/>
          </div>
          <div>
            <label className="label">Producto *</label>
            <input className="input" value={codeForm.product} onChange={e => setCodeForm(f => ({ ...f, product: e.target.value }))} placeholder="Netflix, Spotify..."/>
          </div>
          <div>
            <label className="label">Fecha inicio</label>
            <input className="input" type="date" value={codeForm.start_date} onChange={e => setCodeForm(f => ({ ...f, start_date: e.target.value }))}/>
          </div>
          <div>
            <label className="label">Fecha vencimiento</label>
            <input className="input" type="date" value={codeForm.expiry_date} onChange={e => setCodeForm(f => ({ ...f, expiry_date: e.target.value }))}/>
          </div>
          <div>
            <label className="label">Límite total (0 = ilimitado)</label>
            <input className="input" type="number" min="0" value={codeForm.max_redemptions} onChange={e => setCodeForm(f => ({ ...f, max_redemptions: Number(e.target.value) }))}/>
          </div>
          <div>
            <label className="label">Máx. por usuario</label>
            <input className="input" type="number" min="1" value={codeForm.max_per_user} onChange={e => setCodeForm(f => ({ ...f, max_per_user: Number(e.target.value) }))}/>
          </div>
          <div className="col-span-2">
            <label className="label">Descripción</label>
            <textarea className="input resize-none" rows={2} value={codeForm.description} onChange={e => setCodeForm(f => ({ ...f, description: e.target.value }))} placeholder="Descripción opcional..."/>
          </div>
          <div className="col-span-2">
            <label className="label">Estado</label>
            <select className="select" value={codeForm.status} onChange={e => setCodeForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
          <div className="col-span-2 flex gap-3 pt-2">
            <button onClick={() => { setCodeModal(false); setEditCode(null) }} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button onClick={saveCode} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white transition-all" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
              {editCode ? 'Guardar cambios' : 'Crear código'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL INVENTARIO ─────────────────────────────────────────────────── */}
      <Modal isOpen={invModal} onClose={() => setInvModal(false)} title="Agregar cuenta al inventario">
        <div className="space-y-4">
          <div>
            <label className="label">Producto *</label>
            <input className="input" value={invForm.product} onChange={e => setInvForm(f => ({ ...f, product: e.target.value }))} placeholder="Netflix, Spotify..."/>
          </div>
          <div>
            <label className="label">Correo *</label>
            <input className="input font-mono" value={invForm.email} onChange={e => setInvForm(f => ({ ...f, email: e.target.value }))} placeholder="cuenta@email.com"/>
          </div>
          <div>
            <label className="label">Contraseña *</label>
            <input className="input font-mono" value={invForm.password} onChange={e => setInvForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••"/>
          </div>
          <div>
            <label className="label">Código asociado (opcional)</label>
            <select className="select" value={invForm.gift_code_id} onChange={e => setInvForm(f => ({ ...f, gift_code_id: e.target.value }))}>
              <option value="">Sin código (disponible para cualquiera)</option>
              {codes.map(c => <option key={c.id} value={c.id}>{c.code} — {c.product}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setInvModal(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button onClick={saveInventory} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
              <Plus size={14}/> Agregar
            </button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL DETALLE CLIENTE ─────────────────────────────────────────────── */}
      <Modal isOpen={!!clientModal} onClose={() => setClientModal(null)} title="Detalle del cliente" size="lg">
        {clientModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-violet-600 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">{clientModal.name.charAt(0).toUpperCase()}</div>
              <div>
                <p className="text-lg font-bold text-white">{clientModal.name}</p>
                <p className="text-sm text-gray-400">{clientModal.phone}</p>
                {clientModal.email && <p className="text-xs text-gray-500">{clientModal.email}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'IP', value: clientModal.ip_address },
                { label: 'País', value: clientModal.country },
                { label: 'Ciudad', value: clientModal.city },
                { label: 'Dispositivo', value: clientModal.device },
                { label: 'Navegador', value: clientModal.browser },
                { label: 'Sistema', value: clientModal.os },
                { label: 'Registro', value: formatDate(clientModal.created_at) },
                { label: 'Último acceso', value: formatDate(clientModal.last_seen) },
              ].map(f => f.value ? (
                <div key={f.label} className="bg-dark-600 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{f.label}</p>
                  <p className="text-sm text-white">{f.value}</p>
                </div>
              ) : null)}
            </div>
            {/* Historial de este cliente */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Historial de canjes</p>
              {redemptions.filter(r => r.client_id === clientModal.id).length === 0
                ? <p className="text-gray-600 text-sm">Sin canjes</p>
                : redemptions.filter(r => r.client_id === clientModal.id).map(r => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-dark-600 last:border-0">
                    <div>
                      <code className="text-xs text-violet-400 font-mono">{r.code_used}</code>
                      <p className="text-xs text-gray-500">{r.product}</p>
                    </div>
                    <p className="text-xs text-gray-600">{r.redeemed_at ? new Date(r.redeemed_at).toLocaleDateString('es-MX') : ''}</p>
                  </div>
                ))
              }
            </div>
            {clientModal.phone && (
              <a href={`https://wa.me/52${clientModal.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-colors">
                <MessageCircle size={15}/> Abrir WhatsApp
              </a>
            )}
          </div>
        )}
      </Modal>

      {/* ── CONFIRMS ─────────────────────────────────────────────────────────── */}
      <ConfirmDialog isOpen={!!deleteCode} onClose={() => setDeleteCode(null)} onConfirm={confirmDeleteCode}
        title="Eliminar código" message={`¿Eliminar el código "${deleteCode?.code}"?`} confirmLabel="Eliminar" danger/>
      <ConfirmDialog isOpen={!!deleteClient} onClose={() => setDeleteClientTarget(null)} onConfirm={deleteClientItem}
        title="Eliminar cliente" message={`¿Eliminar a "${deleteClient?.name}"?`} confirmLabel="Eliminar" danger/>

    </div>
  )
}
