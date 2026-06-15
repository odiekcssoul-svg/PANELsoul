import { useState, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { parseExcelFile, ImportResult } from '@/lib/importExcel'
import {
  Upload, FileSpreadsheet, CheckCircle, AlertCircle,
  Users, Monitor, Mail, Loader2, ChevronDown, ChevronUp, X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { SERVICE_ICONS } from '@/lib/utils'

type Step = 'upload' | 'preview' | 'importing' | 'done'

export default function Import() {
  const { clients, addClient, addAccount, addGmail, fetchAll } = useStore()
  const [step, setStep] = useState<Step>('upload')
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [progress, setProgress] = useState({ current: 0, total: 0, label: '' })
  const [expandSection, setExpandSection] = useState<string | null>('accounts')
  const [importDone, setImportDone] = useState({ clients: 0, accounts: 0, gmail: 0 })
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Solo se aceptan archivos .xlsx o .xls')
      return
    }
    toast.loading('Leyendo archivo...')
    const data = await parseExcelFile(file)
    toast.dismiss()
    if (data.errors.length && !data.accounts.length) {
      toast.error(data.errors[0])
      return
    }
    setResult(data)
    setStep('preview')
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  async function handleImport() {
    if (!result) return
    setStep('importing')

    const total = result.clients.length + result.accounts.length + result.gmailAccounts.length
    let current = 0
    let doneClients = 0
    let doneAccounts = 0
    let doneGmail = 0

    // Construir mapa de nombre → client_id para luego asignar cuentas
    const clientIdMap = new Map<string, string>()

    // Primero: importar clientes
    setProgress({ current, total, label: 'Importando clientes...' })
    for (const c of result.clients) {
      try {
        await addClient({ name: c.name, phone: c.phone, email: c.email, observations: '' })
        doneClients++
      } catch { /* ya existe */ }
      current++
      setProgress({ current, total, label: 'Importando clientes...' })
    }

    // Refrescar para obtener IDs reales
    await fetchAll()
    const { clients: freshClients } = useStore.getState()
    for (const fc of freshClients) {
      clientIdMap.set(fc.name.toUpperCase().trim(), fc.id)
    }

    // Segundo: importar cuentas
    setProgress({ current, total, label: 'Importando cuentas de streaming...' })
    for (const a of result.accounts) {
      const clientId = clientIdMap.get(a.client_name.toUpperCase().trim()) || ''
      try {
        await addAccount({
          client_id: clientId,
          client_name: a.client_name,
          client_phone: a.client_phone,
          email: a.email,
          password: a.password,
          service_type: a.service_type as any,
          account_status: a.account_status,
          status: a.status,
          start_date: a.start_date,
          renewal_date: a.renewal_date,
          price: a.price,
          counter: a.counter,
          observations: a.observations,
        })
        doneAccounts++
      } catch { /* duplicado */ }
      current++
      setProgress({ current, total, label: 'Importando cuentas de streaming...' })
    }

    // Tercero: importar gmail
    setProgress({ current, total, label: 'Importando cuentas Gmail...' })
    for (const g of result.gmailAccounts) {
      try {
        await addGmail({ email: g.email, password: g.password, status: g.status, observations: '' })
        doneGmail++
      } catch { /* duplicado */ }
      current++
      setProgress({ current, total, label: 'Importando cuentas Gmail...' })
    }

    setImportDone({ clients: doneClients, accounts: doneAccounts, gmail: doneGmail })
    setStep('done')
    toast.success('¡Importación completada!')
  }

  // Agrupar cuentas por servicio para el preview
  const accountsByService = result?.accounts.reduce((acc, a) => {
    const key = a.service_type
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {} as Record<string, typeof result.accounts>) ?? {}

  return (
    <div className="max-w-3xl space-y-6">

      {/* ── PASO 1: SUBIR ARCHIVO ── */}
      {step === 'upload' && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`card flex flex-col items-center justify-center py-16 border-2 border-dashed cursor-pointer transition-all
            ${dragging ? 'border-brand-orange-500 bg-brand-orange-500/5' : 'border-dark-400 hover:border-dark-300'}`}
          onClick={() => fileRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
            <FileSpreadsheet size={32} className="text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Sube tu Excel de SSouL Streaming</h3>
          <p className="text-gray-400 text-sm text-center max-w-sm mb-6">
            Arrastra tu archivo aquí o haz click para seleccionarlo. Se importarán clientes, cuentas de streaming y correos Gmail.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Upload size={14} />
            <span>Formato: .xlsx o .xls</span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      )}

      {/* ── PASO 2: PREVIEW ── */}
      {step === 'preview' && result && (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card text-center">
              <Users size={20} className="text-brand-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{result.summary.clients}</p>
              <p className="text-xs text-gray-500">Clientes</p>
            </div>
            <div className="card text-center">
              <Monitor size={20} className="text-brand-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{result.summary.accounts}</p>
              <p className="text-xs text-gray-500">Cuentas</p>
            </div>
            <div className="card text-center">
              <Mail size={20} className="text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{result.summary.gmail}</p>
              <p className="text-xs text-gray-500">Gmail</p>
            </div>
          </div>

          {/* Clientes */}
          <div className="card p-0 overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-dark-600/30"
              onClick={() => setExpandSection(expandSection === 'clients' ? null : 'clients')}
            >
              <div className="flex items-center gap-3">
                <Users size={16} className="text-brand-blue-400" />
                <span className="font-medium text-white">Clientes ({result.clients.length})</span>
              </div>
              {expandSection === 'clients' ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            {expandSection === 'clients' && (
              <div className="border-t border-dark-600 divide-y divide-dark-600 max-h-60 overflow-y-auto">
                {result.clients.map((c, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-brand-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {c.name.charAt(0)}
                      </div>
                      <span className="text-sm text-white">{c.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{c.phone}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cuentas por servicio */}
          <div className="card p-0 overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-dark-600/30"
              onClick={() => setExpandSection(expandSection === 'accounts' ? null : 'accounts')}
            >
              <div className="flex items-center gap-3">
                <Monitor size={16} className="text-brand-orange-400" />
                <span className="font-medium text-white">Cuentas de streaming ({result.accounts.length})</span>
              </div>
              {expandSection === 'accounts' ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            {expandSection === 'accounts' && (
              <div className="border-t border-dark-600 max-h-80 overflow-y-auto">
                {Object.entries(accountsByService).map(([service, accs]) => (
                  <div key={service}>
                    <div className="px-4 py-2 bg-dark-700 flex items-center gap-2">
                      <span className="text-lg">{SERVICE_ICONS[service] || '📺'}</span>
                      <span className="text-sm font-medium text-white">{service}</span>
                      <span className="text-xs text-gray-500 ml-auto">{accs.length} cuentas</span>
                    </div>
                    {accs.map((a, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-2 border-t border-dark-600/50">
                        <div>
                          <p className="text-xs text-gray-300 font-mono">{a.email}</p>
                          <p className="text-xs text-gray-500">{a.client_name || 'Sin cliente'}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            a.status === 'expired' ? 'bg-red-400/10 text-red-400' : 'bg-green-400/10 text-green-400'
                          }`}>
                            {a.status === 'expired' ? 'Vencida' : 'Activa'}
                          </span>
                          {a.price > 0 && <p className="text-xs text-gray-500 mt-0.5">${a.price}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gmail */}
          {result.gmailAccounts.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-dark-600/30"
                onClick={() => setExpandSection(expandSection === 'gmail' ? null : 'gmail')}
              >
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-red-400" />
                  <span className="font-medium text-white">Gmail ({result.gmailAccounts.length})</span>
                </div>
                {expandSection === 'gmail' ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              {expandSection === 'gmail' && (
                <div className="border-t border-dark-600 divide-y divide-dark-600 max-h-60 overflow-y-auto">
                  {result.gmailAccounts.map((g, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-sm font-mono text-gray-300">{g.email}</span>
                      <span className="text-xs text-gray-500">••••••••</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Errores */}
          {result.errors.length > 0 && (
            <div className="card border-yellow-500/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">Advertencias ({result.errors.length})</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-gray-400">{e}</p>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button onClick={() => { setStep('upload'); setResult(null) }}
              className="btn-secondary flex-1 justify-center">
              <X size={15} /> Cancelar
            </button>
            <button onClick={handleImport} className="btn-primary flex-1 justify-center">
              <Upload size={15} /> Importar {result.summary.accounts + result.summary.clients + result.summary.gmail} registros
            </button>
          </div>
        </>
      )}

      {/* ── PASO 3: IMPORTANDO ── */}
      {step === 'importing' && (
        <div className="card flex flex-col items-center py-16 gap-6">
          <Loader2 size={40} className="text-brand-orange-400 animate-spin" />
          <div className="text-center">
            <p className="text-white font-medium">{progress.label}</p>
            <p className="text-gray-400 text-sm mt-1">{progress.current} / {progress.total} registros</p>
          </div>
          <div className="w-full max-w-xs bg-dark-600 rounded-full h-2">
            <div
              className="bg-brand-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: progress.total ? `${(progress.current / progress.total) * 100}%` : '0%' }}
            />
          </div>
        </div>
      )}

      {/* ── PASO 4: LISTO ── */}
      {step === 'done' && (
        <div className="card flex flex-col items-center py-16 gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle size={36} className="text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">¡Importación completa!</h3>
            <p className="text-gray-400 text-sm">Todos tus datos están en la app</p>
          </div>
          <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
            <div className="bg-dark-600 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{importDone.clients}</p>
              <p className="text-xs text-gray-500">Clientes</p>
            </div>
            <div className="bg-dark-600 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{importDone.accounts}</p>
              <p className="text-xs text-gray-500">Cuentas</p>
            </div>
            <div className="bg-dark-600 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{importDone.gmail}</p>
              <p className="text-xs text-gray-500">Gmail</p>
            </div>
          </div>
          <button onClick={() => { setStep('upload'); setResult(null) }} className="btn-secondary">
            Importar otro archivo
          </button>
        </div>
      )}
    </div>
  )
}
