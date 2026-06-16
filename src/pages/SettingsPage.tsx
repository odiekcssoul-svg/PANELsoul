import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import {
  Settings as SettingsIcon, MessageCircle, Building2,
  CreditCard, Save, Eye, RefreshCw, CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { DEFAULT_SETTINGS } from '@/types'
import { buildWhatsAppLink } from '@/lib/whatsapp'

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

    </div>
  )
}
