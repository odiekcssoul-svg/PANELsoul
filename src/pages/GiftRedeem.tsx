import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Gift, ArrowRight, Check, Copy, AlertCircle,
  User, Phone, Mail, Loader2, ShieldCheck, ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'

type Step = 'register' | 'code' | 'result'

interface ClientData {
  name: string
  countryCode: string
  phone: string
  email: string
  accepted: boolean
}

interface RedeemResult {
  product: string
  email: string
  password: string
  pin?: string
  redeemed_at: string
}

// ── Países con código ─────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: '+52', flag: '🇲🇽', name: 'México' },
  { code: '+1',  flag: '🇺🇸', name: 'EE.UU.' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+51', flag: '🇵🇪', name: 'Perú' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+593',flag: '🇪🇨', name: 'Ecuador' },
  { code: '+502',flag: '🇬🇹', name: 'Guatemala' },
  { code: '+503',flag: '🇸🇻', name: 'El Salvador' },
  { code: '+504',flag: '🇭🇳', name: 'Honduras' },
  { code: '+505',flag: '🇳🇮', name: 'Nicaragua' },
  { code: '+506',flag: '🇨🇷', name: 'Costa Rica' },
  { code: '+34', flag: '🇪🇸', name: 'España' },
]

function getDeviceInfo() {
  const ua = navigator.userAgent
  const browser = ua.includes('Chrome') ? 'Chrome'
    : ua.includes('Firefox') ? 'Firefox'
    : ua.includes('Safari') ? 'Safari'
    : ua.includes('Edge') ? 'Edge' : 'Otro'
  const os = ua.includes('Windows') ? 'Windows'
    : ua.includes('Mac') ? 'macOS'
    : ua.includes('Android') ? 'Android'
    : ua.includes('iPhone') || ua.includes('iPad') ? 'iOS' : 'Otro'
  const device = /Mobi|Android/i.test(ua) ? 'Móvil' : 'Escritorio'
  return { browser, os, device }
}

export default function GiftRedeem() {
  const [step, setStep] = useState<Step>('register')
  const [clientData, setClientData] = useState<ClientData>({
    name: '', countryCode: '+52', phone: '', email: '', accepted: false,
  })
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<RedeemResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [countryOpen, setCountryOpen] = useState(false)

  const fullPhone = `${clientData.countryCode}${clientData.phone.replace(/\D/g, '')}`
  const selectedCountry = COUNTRIES.find(c => c.code === clientData.countryCode) ?? COUNTRIES[0]

  // ── Paso 1: Registrar ─────────────────────────────────────────────────────
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!clientData.name.trim()) { setError('El nombre es requerido'); return }
    if (!clientData.phone.trim() || clientData.phone.replace(/\D/g,'').length < 7) {
      setError('Ingresa un número de teléfono válido'); return
    }
    if (!clientData.accepted) { setError('Debes aceptar el tratamiento de datos'); return }
    setLoading(true)
    // Solo avanzar al paso 2 — el cliente se crea al momento del canje via RPC
    setLoading(false)
    setStep('code')
  }

  // ── Paso 2: Canjear código via RPC (SECURITY DEFINER — bypasea RLS) ───────
  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!code.trim()) { setError('Ingresa un código'); return }

    setLoading(true)
    const { browser, os, device } = getDeviceInfo()

    const { data, error } = await supabase.rpc('redeem_gift_code', {
      p_code:         code.trim().toUpperCase(),
      p_client_name:  clientData.name.trim(),
      p_client_phone: fullPhone,
      p_client_email: clientData.email.trim() || null,
      p_browser:      browser,
      p_os:           os,
      p_device:       device,
    })

    setLoading(false)

    if (error || !data) {
      setError('Error de conexión. Intenta de nuevo.')
      return
    }

    if (!data.success) {
      setError(data.error || 'Error al canjear el código.')
      return
    }

    setResult({
      product:     data.product,
      email:       data.email,
      password:    data.password,
      pin:         data.pin ?? undefined,
      redeemed_at: data.redeemed_at,
    })
    setStep('result')
  }

  function copyAll() {
    if (!result) return
    navigator.clipboard.writeText(
      `Producto: ${result.product}\nCorreo: ${result.email}\nContraseña: ${result.password}`
    )
    setCopied(true)
    toast.success('Datos copiados')
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="min-h-screen bg-[#060610] flex items-center justify-center px-4 py-12">
      {/* Fondo */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(#3b82f6 1px,transparent 1px),linear-gradient(90deg,#3b82f6 1px,transparent 1px)', backgroundSize: '55px 55px' }}/>
        <div className="absolute w-96 h-96 rounded-full opacity-[0.07] top-10 left-1/4"
          style={{ background: 'radial-gradient(circle,#3b82f6,transparent)', filter: 'blur(80px)' }}/>
        <div className="absolute w-80 h-80 rounded-full opacity-[0.05] bottom-10 right-1/4"
          style={{ background: 'radial-gradient(circle,#8b5cf6,transparent)', filter: 'blur(70px)' }}/>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 0 25px rgba(124,58,237,0.4)' }}>
            <Gift size={26} className="text-white"/>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">Centro de Canje</h1>
            <p className="text-slate-400 text-sm">Soul Streaming · Regalos digitales</p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['register','code','result'] as Step[]).map((s, i) => {
            const currentIdx = ['register','code','result'].indexOf(step)
            const thisIdx = i
            const done = currentIdx > thisIdx
            const active = currentIdx === thisIdx
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${active ? 'bg-violet-600 text-white shadow-lg' : done ? 'bg-green-600 text-white' : 'bg-dark-600 text-gray-500'}`}>
                  {done ? <Check size={12}/> : i + 1}
                </div>
                {i < 2 && <div className={`w-8 h-px ${done ? 'bg-green-600' : 'bg-dark-500'}`}/>}
              </div>
            )
          })}
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 sm:p-8"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0"/>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* ── PASO 1 ── */}
          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">🎁 Reclama tu regalo</h2>
                <p className="text-slate-400 text-sm mt-1">Completa tus datos para recibir tu cuenta de regalo.</p>
              </div>

              {/* Nombre */}
              <div>
                <label className="label">Nombre completo *</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                  <input className="input pl-9" value={clientData.name}
                    onChange={e => setClientData(d => ({ ...d, name: e.target.value }))}
                    placeholder="Tu nombre completo"/>
                </div>
              </div>

              {/* Teléfono con selector de país */}
              <div>
                <label className="label">WhatsApp / Teléfono *</label>
                <div className="flex gap-2">
                  {/* Selector país */}
                  <div className="relative">
                    <button type="button" onClick={() => setCountryOpen(!countryOpen)}
                      className="flex items-center gap-1.5 h-full px-3 rounded-lg text-sm font-medium text-white whitespace-nowrap"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', minWidth: 80 }}>
                      <span>{selectedCountry.flag}</span>
                      <span className="text-xs text-gray-300">{selectedCountry.code}</span>
                      <ChevronDown size={12} className="text-gray-500"/>
                    </button>
                    {countryOpen && (
                      <div className="absolute top-full left-0 mt-1 z-50 rounded-xl overflow-hidden shadow-2xl"
                        style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', width: 200, maxHeight: 240, overflowY: 'auto' }}>
                        {COUNTRIES.map(c => (
                          <button key={c.code} type="button"
                            onClick={() => { setClientData(d => ({ ...d, countryCode: c.code })); setCountryOpen(false) }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors ${clientData.countryCode === c.code ? 'bg-violet-600/20 text-violet-300' : 'text-gray-300'}`}>
                            <span>{c.flag}</span>
                            <span className="flex-1 text-left">{c.name}</span>
                            <span className="text-gray-500">{c.code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Número */}
                  <div className="relative flex-1">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                    <input className="input pl-9" value={clientData.phone}
                      onChange={e => setClientData(d => ({ ...d, phone: e.target.value.replace(/\D/g, '') }))}
                      placeholder="Número sin código" type="tel" inputMode="numeric"/>
                  </div>
                </div>
                {clientData.phone && <p className="text-xs text-gray-600 mt-1">Número completo: {fullPhone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="label">Correo electrónico <span className="text-gray-500 font-normal">(opcional)</span></label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                  <input className="input pl-9" value={clientData.email}
                    onChange={e => setClientData(d => ({ ...d, email: e.target.value }))}
                    placeholder="correo@ejemplo.com" type="email"/>
                </div>
              </div>

              {/* Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer mt-2">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input type="checkbox" className="sr-only" checked={clientData.accepted}
                    onChange={e => setClientData(d => ({ ...d, accepted: e.target.checked }))}/>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${clientData.accepted ? 'bg-violet-600 border-violet-600' : 'border-gray-600 bg-dark-600'}`}>
                    {clientData.accepted && <Check size={11} className="text-white"/>}
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Acepto el tratamiento de mis datos personales y autorizo el envío de información sobre promociones, novedades y soporte.
                </p>
              </label>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all mt-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: loading ? 'none' : '0 0 20px rgba(124,58,237,0.35)' }}>
                {loading ? <Loader2 size={16} className="animate-spin"/> : <><span>Continuar</span><ArrowRight size={15}/></>}
              </button>
            </form>
          )}

          {/* ── PASO 2 ── */}
          {step === 'code' && (
            <form onSubmit={handleRedeem} className="space-y-5">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-white">Ingresa tu código</h2>
                <p className="text-slate-400 text-sm mt-1">Escribe el código de regalo que recibiste.</p>
              </div>
              <div>
                <label className="label">Código de regalo</label>
                <input className="input text-center font-mono text-lg tracking-widest uppercase"
                  value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX-XXXX" maxLength={30} autoFocus/>
              </div>
              <button type="submit" disabled={loading || !code.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                {loading ? <Loader2 size={16} className="animate-spin"/> : <><Gift size={15}/> Canjear ahora</>}
              </button>
              <button type="button" onClick={() => { setStep('register'); setError('') }}
                className="w-full text-slate-500 text-xs hover:text-slate-300 transition-colors py-1">
                ← Volver
              </button>
            </form>
          )}

          {/* ── PASO 3 ── */}
          {step === 'result' && result && (
            <div className="space-y-5">
              <div className="flex flex-col items-center text-center gap-3 pb-4 border-b border-white/5">
                <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center"
                  style={{ boxShadow: '0 0 20px rgba(34,197,94,0.2)' }}>
                  <Check size={26} className="text-green-400"/>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">¡Canje exitoso!</h2>
                  <p className="text-slate-400 text-sm mt-1">Aquí están los datos de tu cuenta</p>
                </div>
              </div>
              <div className="rounded-xl p-5 space-y-3"
                style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                {[
                  { label: 'Producto',    value: result.product,  icon: '🎬', mono: false },
                  { label: 'Correo',      value: result.email,    icon: '📧', mono: true },
                  { label: 'Contraseña',  value: result.password, icon: '🔑', mono: true },
                  ...(result.pin ? [{ label: 'Perfil / PIN', value: result.pin, icon: '👤', mono: false }] : []),
                ].map(f => (
                  <div key={f.label} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">{f.icon} {f.label}</p>
                      <p className={`text-sm text-white font-medium break-all ${f.mono ? 'font-mono' : ''}`}>{f.value}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(f.value); toast.success(`${f.label} copiado`) }}
                      className="flex-shrink-0 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                      <Copy size={13}/>
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-slate-600">
                Canjeado el {new Date(result.redeemed_at).toLocaleString('es-MX')}
              </p>
              <button onClick={copyAll}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
                style={{ background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`, color: copied ? '#4ade80' : '#94a3b8' }}>
                {copied ? <><Check size={14}/> ¡Copiado!</> : <><Copy size={14}/> Copiar todos los datos</>}
              </button>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
                <ShieldCheck size={15} className="text-yellow-400 flex-shrink-0"/>
                <p className="text-xs text-yellow-300/70">Guarda estos datos en un lugar seguro. No podrás verlos de nuevo.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
