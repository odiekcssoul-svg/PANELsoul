import { useStore } from '@/store/useStore'
import { Activity, Plus, Pencil, Trash2, RefreshCw, Shield, Info } from 'lucide-react'

const actionIcons: Record<string, React.ElementType> = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  renew: RefreshCw,
  login: Shield,
}

const actionColors: Record<string, string> = {
  create: 'text-green-400 bg-green-400/10',
  update: 'text-brand-blue-400 bg-brand-blue-400/10',
  delete: 'text-red-400 bg-red-400/10',
  renew: 'text-brand-orange-400 bg-brand-orange-400/10',
  login: 'text-purple-400 bg-purple-400/10',
}

const entityLabels: Record<string, string> = {
  client: 'Cliente',
  account: 'Cuenta',
  provider: 'Proveedor',
  gmail: 'Gmail',
  system: 'Sistema',
}

const actionLabels: Record<string, string> = {
  create: 'Creó',
  update: 'Actualizó',
  delete: 'Eliminó',
  renew: 'Renovó',
  login: 'Inició sesión',
}

export default function ActivityPage() {
  const { activityLog } = useStore()

  return (
    <div className="max-w-3xl space-y-4">
      {activityLog.length === 0 ? (
        <div className="card flex flex-col items-center py-16">
          <Activity size={40} className="text-gray-600 mb-3" />
          <p className="text-gray-400">Sin actividad registrada</p>
          <p className="text-gray-600 text-sm mt-1">Las acciones aparecerán aquí</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-dark-600">
            <p className="text-sm text-gray-400">{activityLog.length} acciones registradas</p>
          </div>
          <div className="divide-y divide-dark-600">
            {activityLog.map(log => {
              const Icon = actionIcons[log.action] || Info
              const color = actionColors[log.action] || 'text-gray-400 bg-gray-400/10'
              return (
                <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-dark-600/20 transition-colors">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${color}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-medium">{log.user_name}</span>
                      {' '}{actionLabels[log.action] || log.action}{' '}
                      <span className="text-gray-400">{entityLabels[log.entity] || log.entity}</span>
                    </p>
                    {log.details && (
                      <p className="text-xs text-gray-500 mt-0.5">{log.details}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-600 flex-shrink-0">
                    {new Date(log.created_at).toLocaleString('es-MX', { 
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
