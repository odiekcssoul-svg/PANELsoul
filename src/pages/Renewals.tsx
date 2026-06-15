import { useMemo, useState } from 'react'
import { useStore } from '@/store/useStore'
import { RefreshCw, Calendar, AlertTriangle, CheckCircle, Clock, MessageCircle } from 'lucide-react'
import { formatDate, SERVICE_ICONS, SERVICE_COLORS } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'
import { StreamingAccount } from '@/types'
import toast from 'react-hot-toast'
import { SearchInput } from '@/components/ui/SearchInput'

type Tab = 'today' | 'upcoming' | 'overdue' | 'all'

function buildWhatsApp(a: StreamingAccount, isExpired: boolean) {
  const phone = (a.client_phone || '').replace(/\D/g, '')
  const num = phone.length === 10 ? `52${phone}` : phone
  if (!num) return ''

  const emoji: Record<string, string> = {
    'Spotify': '🎵', 'YouTube Premium': '▶️', 'Disney+': '🏰',
    'HBO Max': '👑', 'Prime Video': '📦', 'Netflix': '🎬',
    'Crunchyroll': '⚡', 'Vix Premium': '🌟', 'Paramount+': '⭐',
  }
  const ico = emoji[a.service_type] || '📺'
  const date = formatDate(a.renewal_date)
  const name = a.client_name || 'Cliente'

  const msg = isExpired
    ? `Hola ${name}.\n\nDetectamos que tu servicio ya venció.\n\n${ico} Servicio: ${a.service_type}\n📧 Correo: ${a.email}\n\n💰 Importe de renovación: $${a.price}\n\n🏦 Banco: Arcus\nCLABE: 706969208356650024\n\nPor favor comparte tu comprobante para reactivar tu servicio.\n\nGracias por tu preferencia.\nSSouL Streaming`
    : `Hola ${name}.\n\nTe recordamos que tu servicio está próximo a vencer.\n\n${ico} Servicio: ${a.service_type}\n📧 Correo: ${a.email}\n\n📅 Fecha de renovación: ${date}\n💰 Importe: $${a.price}\n\n🏦 Banco: Arcus\nCLABE: 706969208356650024\n\nUna vez realizado el pago comparte tu comprobante para registrar tu renovación.\n\nGracias por tu preferencia.\nSSouL Streaming`

  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
}

export default function Renewals() {
  const { accounts, renewAccount } = useStore()
  const [tab, setTab] = useState<Tab>('today')
  const [search, setSearch] = useState('')
  const [renewModal, setRenewModal] = useState(false)
  const [selected, setSelected] = useState<StreamingAccount | null>(null)
  const [newDate, setNewDate] = useState('')

  const { today, upcoming, overdue } = useMemo(() => {
    const now = Date.now()
    const day = 86400000
    return {
      today: accounts.filter(a => {
        const diff = new Date(a.renewal_date).getTime() - now
        return diff >= -day && diff < day
      }),
      upcoming: accounts.filter(a => {
        const diff = new Date(a.renewal_date).getTime() - now
        return diff >= day && diff <= 7 * day
      }),
      overdue: accounts.filter(a => new Date(a.renewal_date).getTime() < now - day),
    }
  }, [accounts])

  const allFiltered = useMemo(() => {
    const q = search.toLowerCase()
    const base = tab === 'today' ? today
      : tab === 'upcoming' ? upcoming
      : tab === 'overdue' ? overdue
      : accounts
    return base.filter(a =>
      !search ||
      (a.client_name || '').toLowerCase().includes(q) ||
      a.service_type.toLowerCase().includes(q)
    )
  }, [tab, search, today, upcoming, overdue, accounts])

  function openRenew(a: StreamingAccount) {
    setSelected(a)
    const d = new Date(a.renewal_date)
    d.setMonth(d.getMonth() + 1)
    setNewDate(d.toISOString().split('T')[0])
    setRenewModal(true)
  }

  function handleRenew() {
    if (selected && newDate) {
      renewAccount(selected.id, newDate)
      toast.success('Cuenta renovada')
      setRenewModal(false)
    }
  }

  const tabs = [
    { key: 'today' as Tab, label: 'Hoy', count: today.length, color: 'text-brand-orange-400', icon: Clock },
    { key: 'upcoming' as Tab, label: 'Próximas', count: upcoming.length, color: 'text-brand-blue-400', icon: Calendar },
    { key: 'overdue' as Tab, label: 'Vencidas', count: overdue.length, color: 'text-red-400', icon: AlertTriangle },
    { key: 'all' as Tab, label: 'Todas', count: accounts.length, color: 'text-gray-400', icon: RefreshCw },
  ]

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`card text-left transition-all ${tab === t.key ? 'border-brand-orange-500/50' : ''}`}
          >
            <div className="flex items-center gap-3">
              <t.icon size={20} className={t.color} />
              <div>
                <p className="text-2xl font-bold text-white">{t.count}</p>
                <p className="text-xs text-gray-500">{t.label}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Tabs + search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 bg-dark-700 p-1 rounded-xl">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-dark-500 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`ml-1.5 text-xs ${t.color}`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar..." className="max-w-xs" />
        </div>
      </div>

      {/* Cards */}
      {allFiltered.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <CheckCircle size={40} className="text-green-400 mb-3" />
          <p className="text-gray-300 font-medium">Sin renovaciones en esta categoría</p>
          <p className="text-gray-500 text-sm">¡Todo al día!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {allFiltered.map(a => {
            const daysLeft = Math.ceil((new Date(a.renewal_date).getTime() - Date.now()) / 86400000)
            const isOverdue = daysLeft < 0
            const isToday = daysLeft === 0

            return (
              <div key={a.id} className={`card border transition-all hover:scale-[1.01] ${
                isOverdue ? 'border-red-500/30' :
                isToday ? 'border-brand-orange-500/30' : 'border-dark-500'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: `${SERVICE_COLORS[a.service_type]}20` }}>
                      {SERVICE_ICONS[a.service_type]}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{a.client_name}</p>
                      <p className="text-xs" style={{ color: SERVICE_COLORS[a.service_type] }}>
                        {a.service_type}
                      </p>
                    </div>
                  </div>
                  <span className={`badge text-xs ${
                    isOverdue ? 'text-red-400 bg-red-400/10' :
                    isToday ? 'text-brand-orange-400 bg-brand-orange-400/10' :
                    'text-brand-blue-400 bg-brand-blue-400/10'
                  }`}>
                    {isOverdue ? `Venció hace ${Math.abs(daysLeft)}d` :
                     isToday ? 'Vence hoy' : `${daysLeft}d restantes`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <p className="text-gray-500">Teléfono</p>
                    <p className="text-gray-300">{a.client_phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Renovación</p>
                    <p className="text-gray-300">{formatDate(a.renewal_date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Precio</p>
                    <p className="text-green-400 font-medium">${a.price}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Estado</p>
                    <p className={a.status === 'active' ? 'text-green-400' : 'text-red-400'}>
                      {a.status === 'active' ? 'Activo' : 'Vencido'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-1">
                  <button onClick={() => openRenew(a)} className="btn-primary flex-1 justify-center text-xs py-1.5">
                    <RefreshCw size={12} /> Renovar ahora
                  </button>
                  {a.client_phone && (() => {
                    const waLink = buildWhatsApp(a, isOverdue)
                    return waLink ? (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Enviar mensaje de renovación por WhatsApp"
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/20 transition-colors text-xs font-medium flex-shrink-0"
                      >
                        <MessageCircle size={13} />
                        WA
                      </a>
                    ) : null
                  })()}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Renew modal */}
      <Modal isOpen={renewModal} onClose={() => setRenewModal(false)} title="Renovar cuenta" size="sm">
        <div className="space-y-4">
          <div className="p-3 bg-dark-600 rounded-lg flex items-center gap-3">
            <span className="text-2xl">{selected && SERVICE_ICONS[selected.service_type]}</span>
            <div>
              <p className="font-medium text-white">{selected?.client_name}</p>
              <p className="text-xs text-gray-400">{selected?.service_type} · ${selected?.price}</p>
            </div>
          </div>
          <div>
            <label className="label">Nueva fecha de renovación</label>
            <input className="input" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setRenewModal(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button onClick={handleRenew} className="btn-primary flex-1 justify-center">
              <RefreshCw size={14} /> Renovar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
