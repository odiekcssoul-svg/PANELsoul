import { useStore } from '@/store/useStore'
import { Bell, RefreshCw, AlertTriangle, Info, CheckCheck } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const iconMap = {
  renewal: RefreshCw,
  expiration: AlertTriangle,
  info: Info,
  warning: AlertTriangle,
}

const colorMap = {
  renewal: 'text-brand-orange-400 bg-brand-orange-400/10',
  expiration: 'text-red-400 bg-red-400/10',
  info: 'text-brand-blue-400 bg-brand-blue-400/10',
  warning: 'text-yellow-400 bg-yellow-400/10',
}

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useStore()
  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">
            {unread > 0 ? `${unread} sin leer` : 'Todo leído'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllNotificationsRead} className="btn-secondary text-xs">
            <CheckCheck size={14} /> Marcar todo leído
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card flex flex-col items-center py-16">
          <Bell size={40} className="text-gray-600 mb-3" />
          <p className="text-gray-400">Sin notificaciones</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const Icon = iconMap[n.type] || Info
            const color = colorMap[n.type] || colorMap.info

            return (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`card cursor-pointer transition-all hover:border-dark-400 ${!n.read ? 'border-dark-400' : 'opacity-60'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-brand-orange-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-600 mt-1">{formatDate(n.created_at)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
