import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import {
  Settings as SettingsIcon, MessageCircle, Building2,
  CreditCard, Save, Eye, RefreshCw, CheckCircle, Tv, Trash2, Plus,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { DEFAULT_SETTINGS } from '@/types'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import {
  getCustomServices, saveCustomServices, getAllServices,
  DEFAULT_CUSTOM_ICON, DEFAULT_CUSTOM_COLOR, getServiceIcon, getServiceColor,
  type CustomService,
} from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'

const VARIABLES = [
  { tag: '{nombre}',   desc: 'Nombre del cliente' },
  { tag: '{emoji}',    desc: 'Emoji del servicio' },
  { tag: '{servicio}', desc: 'Nombre del servicio (ej: Netflix)' },
  { tag: '{correo}',   desc: 'Correo de la cuenta' },
  { tag: '{fecha}',    desc: 'Fecha de renovación' },
  { tag: '{precio}',   desc: 'Precio' },
  { tag: '{banco}',    desc: 'Nombre del banco' },
  { tag: '{clabe}',    desc: 'CLABE interbancaria' },
  { tag: '{negocio}',  desc: 'Nombre de tu negocio' },
]

export default function SettingsPage() {
  const { settings, saveSettings } = useStore()
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [previewTab, setPreviewTab] = useState<'renewal' | 'expired'>('renewal')

  // Servicios personalizados
  const [customServices, setCustomServices] = useState<CustomService[]>(() => getCustomServices())
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
    const all = getAllServices()
    if (all.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Ese servicio ya existe'); return
    }
    const updated = [...customServices, { name: trimmed, icon: newSvcIcon, color: newSvcColor }]
    saveCustomServices(updated)
    setCustomServices(updated)
    setNewSvcModal(false)
    toast.success(`Servicio "${trimmed}" agregado`)
  }

  function handleDeleteService(name: string) {
    const updated = customServices.filter(s => s.name !== name)
    saveCustomServices(updated)
    setCustomServices(updated)
    toast.success(`Servicio "${name}" eliminado`)
  }

  // Sincronizar cuando carguen los settings desde Supabase
  useEffect(() => { setForm(settings) }, [settings])

  async function handleSave() {
    if (!form.whatsapp_number.trim()) {
      toast.error('El número de WhatsApp es requerido')
      return
    }
    setSaving(true)
    await saveSettings(form)
    setSaving(false)
    toast.success('Configuración guardada')
  }

  function resetDefaults() {
    setForm(DEFAULT_SETTINGS)
    toast('Mensajes restablecidos a los valores por defecto', { icon: '↩️' })
  }

  // Preview del mensaje con datos de ejemplo
  const previewLink = buildWhatsAppLink({
    clientName: 'JUAN EJEMPLO',
    clientPhone: form.whatsapp_number || '5200000000000',
    serviceType: 'Netflix',
    email: 'ejemplo@email.com',
    renewalDate: '15/07/2026',
    price: 150,
    isExpired: previewTab === 'expired',
    settings: form,
  })

  const previewMsg = (previewTab === 'renewal' ? form.msg_renewal : form.msg_expired)
    .replace(/{nombre}/g,   'JUAN EJEMPLO')
    .replace(/{emoji}/g,    '🎬')
    .replace(/{servicio}/g, 'Netflix')
    .replace(/{correo}/g,   'ejemplo@email.com')
    .replace(/{fecha}/g,    '15/07/2026')
    .replace(/\$\{precio\}/g, '150')
    .replace(/{precio}/g,   '150')
    .replace(/{banco}/g,    form.bank_name || 'Arcus')
    .replace(/{clabe}/g,    form.bank_clabe || '706969208356650024')
    .replace(/{negocio}/g,  form.business_name || 'Soul Streaming')

  return (
    <div className="max-w-4xl space-y-6">

      {/* ── Info banner ─────────────────────────────────────────────────── */}
      <div className="card border-blue-500/30 bg-blue-500/5 flex items-start gap-3">
        <SettingsIcon size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-white">Configuración de tu panel</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Cada administrador tiene su propia configuración. Los mensajes de WhatsApp
            se generarán con tus datos bancarios y nombre de negocio.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Columna izquierda: formulario ────────────────────────────── */}
        <div className="space-y-5">

          {/* Negocio */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={16} className="text-brand-orange-400" />
              <h3 className="font-semibold text-white text-sm">Datos del negocio</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Nombre del negocio</label>
                <input className="input" value={form.business_name}
                  onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                  placeholder="Soul Streaming" />
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle size={16} className="text-green-400" />
              <h3 className="font-semibold text-white text-sm">WhatsApp de contacto</h3>
            </div>
            <div>
              <label className="label">Número (10 dígitos, sin código de país)</label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-dark-600 border border-dark-400 rounded-lg text-gray-400 text-sm">+52</span>
                <input className="input" value={form.whatsapp_number}
                  onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  placeholder="6613519349" maxLength={10} />
              </div>
              <p className="text-xs text-gray-600 mt-1">Este número aparecerá en los links de WhatsApp que generes</p>
            </div>
          </div>

          {/* Banco */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={16} className="text-brand-blue-400" />
              <h3 className="font-semibold text-white text-sm">Datos de pago</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Banco / Método de pago</label>
                <input className="input" value={form.bank_name}
                  onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))}
                  placeholder="Arcus, BBVA, OXXO..." />
              </div>
              <div>
                <label className="label">CLABE / Número de cuenta</label>
                <input className="input font-mono" value={form.bank_clabe}
                  onChange={e => setForm(f => ({ ...f, bank_clabe: e.target.value }))}
                  placeholder="706969208356650024" />
              </div>
            </div>
          </div>

          {/* Servicios personalizados */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tv size={16} className="text-brand-orange-400" />
                <h3 className="font-semibold text-white text-sm">Servicios personalizados</h3>
              </div>
              <button onClick={openNewServiceModal} className="btn-primary py-1 px-3 text-xs">
                <Plus size={13} /> Agregar
              </button>
            </div>
            {customServices.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-3">
                No tienes servicios personalizados.<br />Usa el botón "+" para agregar.
              </p>
            ) : (
              <div className="space-y-2">
                {customServices.map(svc => (
                  <div key={svc.name}
                    className="flex items-center justify-between p-2 bg-dark-600 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{svc.icon}</span>
                      <span className="text-sm font-medium" style={{ color: svc.color }}>
                        {svc.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteService(svc.name)}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Eliminar servicio">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Variables disponibles */}
          <div className="card">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Variables disponibles</p>
            <div className="space-y-1.5">
              {VARIABLES.map(v => (
                <div key={v.tag} className="flex items-center gap-2">
                  <code className="text-xs bg-dark-600 text-brand-orange-400 px-1.5 py-0.5 rounded font-mono">{v.tag}</code>
                  <span className="text-xs text-gray-500">{v.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Columna derecha: mensajes + preview ──────────────────────── */}
        <div className="space-y-5">

          {/* Mensaje de renovación próxima */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw size={15} className="text-yellow-400" />
              <h3 className="font-semibold text-white text-sm">Mensaje — próximo a vencer</h3>
            </div>
            <textarea
              className="input resize-none font-mono text-xs leading-relaxed"
              rows={10}
              value={form.msg_renewal}
              onChange={e => setForm(f => ({ ...f, msg_renewal: e.target.value }))}
            />
          </div>

          {/* Mensaje vencido */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle size={15} className="text-red-400" />
              <h3 className="font-semibold text-white text-sm">Mensaje — servicio vencido</h3>
            </div>
            <textarea
              className="input resize-none font-mono text-xs leading-relaxed"
              rows={10}
              value={form.msg_expired}
              onChange={e => setForm(f => ({ ...f, msg_expired: e.target.value }))}
            />
          </div>

          {/* Preview */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Eye size={15} className="text-gray-400" />
                <h3 className="font-semibold text-white text-sm">Vista previa</h3>
              </div>
              <div className="flex gap-1 bg-dark-600 p-0.5 rounded-lg">
                {(['renewal','expired'] as const).map(t => (
                  <button key={t} onClick={() => setPreviewTab(t)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${previewTab === t ? 'bg-dark-400 text-white' : 'text-gray-500'}`}>
                    {t === 'renewal' ? 'Por vencer' : 'Vencido'}
                  </button>
                ))}
              </div>
            </div>
            {/* Burbuja estilo WhatsApp */}
            <div className="bg-[#0b1416] rounded-xl p-3 border border-dark-500">
              <div className="bg-[#005c4b] rounded-xl rounded-tl-none p-3 max-w-xs ml-auto">
                <pre className="text-xs text-white whitespace-pre-wrap font-sans leading-relaxed">{previewMsg}</pre>
              </div>
            </div>
            {previewLink && (
              <a href={previewLink} target="_blank" rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors">
                <MessageCircle size={13}/> Probar en WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Botones ──────────────────────────────────────────────────────── */}
      <div className="flex gap-3 justify-end">
        <button onClick={resetDefaults} className="btn-secondary">
          <RefreshCw size={14}/> Restablecer mensajes
        </button>
        <button onClick={handleSave} disabled={saving} className="btn-primary px-8">
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Guardando...
            </span>
          ) : (
            <><Save size={14}/> Guardar configuración</>
          )}
        </button>
      </div>

      {/* Modal nuevo servicio personalizado */}
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
