import { useMemo } from 'react'
import { useStore } from '@/store/useStore'
import {
  Users, Monitor, AlertTriangle, RefreshCw,
  DollarSign, TrendingUp, Calendar,
} from 'lucide-react'
import { formatCurrency, isExpired, isRenewalToday, isRenewalThisWeek, SERVICE_COLORS } from '@/lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { format, subMonths, startOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { Link } from 'react-router-dom'

function StatCard({ icon: Icon, label, value, color, sub }: {
  icon: React.ElementType, label: string, value: number | string, color: string, sub?: string
}) {
  return (
    <div className="stat-card">
      <div className={`p-3 rounded-xl ${color} flex-shrink-0`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { clients, accounts, notifications } = useStore()

  const stats = useMemo(() => {
    const active = accounts.filter(a => a.status === 'active').length
    const expired = accounts.filter(a => a.status === 'expired' || isExpired(a.renewal_date)).length
    const todayRen = accounts.filter(a => isRenewalToday(a.renewal_date)).length
    const weekRen = accounts.filter(a => isRenewalThisWeek(a.renewal_date)).length
    const monthRevenue = accounts
      .filter(a => a.status === 'active')
      .reduce((sum, a) => sum + a.price, 0)

    return { active, expired, todayRen, weekRen, monthRevenue }
  }, [accounts])

  // Revenue by month (last 6 months, simulated from prices)
  const revenueData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(startOfMonth(new Date()), 5 - i)
      const monthLabel = format(date, 'MMM', { locale: es })
      // Simulate slight variation
      const base = stats.monthRevenue
      const variation = 0.7 + (i * 0.06) + (Math.sin(i) * 0.05)
      return { month: monthLabel, revenue: Math.round(base * variation) }
    })
  }, [stats.monthRevenue])

  // Service distribution
  const serviceData = useMemo(() => {
    const map: Record<string, number> = {}
    accounts.forEach(a => {
      map[a.service_type] = (map[a.service_type] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({
      name, value, color: SERVICE_COLORS[name] || '#6b7280',
    })).sort((a, b) => b.value - a.value)
  }, [accounts])

  const unread = notifications.filter(n => !n.read).length

  // Upcoming renewals (next 7 days)
  const upcoming = accounts
    .filter(a => {
      const days = Math.ceil((new Date(a.renewal_date).getTime() - Date.now()) / 86400000)
      return days >= 0 && days <= 7
    })
    .sort((a, b) => new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Users} label="Clientes" value={clients.length} color="bg-brand-blue-600" />
        <StatCard icon={Monitor} label="Cuentas activas" value={stats.active} color="bg-green-600" />
        <StatCard icon={AlertTriangle} label="Vencidas" value={stats.expired} color="bg-red-600" />
        <StatCard icon={RefreshCw} label="Renuevan hoy" value={stats.todayRen} color="bg-brand-orange-600" />
        <StatCard icon={Calendar} label="Esta semana" value={stats.weekRen} color="bg-purple-600" />
        <StatCard
          icon={DollarSign}
          label="Ingreso mensual"
          value={formatCurrency(stats.monthRevenue)}
          color="bg-emerald-600"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">Ingresos mensuales</h3>
              <p className="text-xs text-gray-500">Últimos 6 meses</p>
            </div>
            <TrendingUp size={18} className="text-brand-orange-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1a1a24', border: '1px solid #3a3a4e', borderRadius: 8, color: '#fff' }}
                formatter={(v: number) => [formatCurrency(v), 'Ingreso']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2}
                fill="url(#revGrad)" dot={{ fill: '#f97316', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Services pie */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Servicios más vendidos</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={serviceData} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                dataKey="value" paddingAngle={2}>
                {serviceData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1a1a24', border: '1px solid #3a3a4e', borderRadius: 8, color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {serviceData.slice(0, 5).map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-gray-400 truncate">{s.name}</span>
                </div>
                <span className="text-gray-300 font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming renewals */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Próximas renovaciones</h3>
            <Link to="/renewals" className="text-xs text-brand-orange-400 hover:text-brand-orange-300">
              Ver todas →
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">Sin renovaciones esta semana</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map(a => {
                const days = Math.ceil((new Date(a.renewal_date).getTime() - Date.now()) / 86400000)
                return (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-dark-600 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white">{a.client_name}</p>
                      <p className="text-xs text-gray-500">{a.service_type}</p>
                    </div>
                    <span className={`badge text-xs ${days === 0 ? 'text-red-400 bg-red-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                      {days === 0 ? 'Hoy' : `${days}d`}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Notifications panel */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">
              Notificaciones
              {unread > 0 && (
                <span className="ml-2 bg-brand-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unread}
                </span>
              )}
            </h3>
            <Link to="/notifications" className="text-xs text-brand-orange-400 hover:text-brand-orange-300">
              Ver todas →
            </Link>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 5).map(n => (
              <div key={n.id} className={`flex items-start gap-3 py-2 border-b border-dark-600 last:border-0 ${!n.read ? 'opacity-100' : 'opacity-50'}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  n.type === 'renewal' ? 'bg-brand-orange-400' :
                  n.type === 'expiration' ? 'bg-red-400' : 'bg-brand-blue-400'
                }`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white">{n.title}</p>
                  <p className="text-xs text-gray-500 truncate">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
