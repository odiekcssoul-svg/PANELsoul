import { useMemo, useState } from 'react'
import { useStore } from '@/store/useStore'
import {
  Users, Monitor, AlertTriangle, RefreshCw,
  DollarSign, TrendingUp, Calendar, Clock,
  ArrowRight, MessageCircle, ChevronRight,
} from 'lucide-react'
import {
  formatCurrency, isRenewalToday, isRenewalThisWeek,
  SERVICE_COLORS, SERVICE_ICONS,
} from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Link } from 'react-router-dom'

// ── Stat card ────────────────────────────────────────────────────────────────
function KPICard({
  icon: Icon, label, value, sub, color, trend,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color: string
  trend?: { value: string; up: boolean }
}) {
  return (
    <div className="card flex flex-col gap-3 min-h-[100px]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend.up ? 'text-green-400' : 'text-red-400'}`}>
          <TrendingUp size={11} className={trend.up ? '' : 'rotate-180'} />
          {trend.value}
        </div>
      )}
    </div>
  )
}

// ── WhatsApp link ─────────────────────────────────────────────────────────────
function buildWhatsApp(phone: string, name: string, service: string, email: string, date: string, price: number, expired: boolean) {
  const clean = phone.replace(/\D/g, '')
  const num = clean.length === 10 ? `52${clean}` : clean
  const emoji: Record<string, string> = {
    'Spotify': '🎵', 'YouTube Premium': '▶️', 'Disney+': '🏰',
    'HBO Max': '👑', 'Prime Video': '📦', 'Netflix': '🎬',
    'Crunchyroll': '⚡', 'Vix Premium': '🌟', 'Paramount+': '⭐',
  }
  const ico = emoji[service] || '📺'
  const msg = expired
    ? `Hola ${name}.\n\nDetectamos que tu servicio ya venció.\n\n${ico} Servicio: ${service}\n📧 Correo: ${email}\n\n💰 Importe de renovación: $${price}\n\n🏦 Banco: Arcus\nCLABE: 706969208356650024\n\nPor favor comparte tu comprobante para reactivar tu servicio.\n\nGracias por tu preferencia.\nSSouL Streaming`
    : `Hola ${name}.\n\nTe recordamos que tu servicio está próximo a vencer.\n\n${ico} Servicio: ${service}\n📧 Correo: ${email}\n\n📅 Fecha de renovación: ${date}\n💰 Importe: $${price}\n\n🏦 Banco: Arcus\nCLABE: 706969208356650024\n\nUna vez realizado el pago comparte tu comprobante para registrar tu renovación.\n\nGracias por tu preferencia.\nSSouL Streaming`
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
}

// ── Tooltip personalizado ─────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-700 border border-dark-500 rounded-xl p-3 shadow-xl min-w-[160px]">
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-xs text-gray-300">{p.name}</span>
          </div>
          <span className="text-xs font-semibold text-white">${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const { clients, accounts, notifications } = useStore()
  const [revenueTab, setRevenueTab] = useState<'service' | 'status'>('service')

  const now = Date.now()
  const DAY = 86_400_000

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const active = accounts.filter(a => a.status === 'active')
    const expired = accounts.filter(a => a.status === 'expired')
    const todayRen = accounts.filter(a => isRenewalToday(a.renewal_date))
    const weekRen = accounts.filter(a => isRenewalThisWeek(a.renewal_date))
    const totalRevenue = active.reduce((s, a) => s + (a.price || 0), 0)
    const expiredRevenue = expired.reduce((s, a) => s + (a.price || 0), 0)
    return { active, expired, todayRen, weekRen, totalRevenue, expiredRevenue }
  }, [accounts])

  // ── Ingresos por servicio ──────────────────────────────────────────────────
  const revenueByService = useMemo(() => {
    const map: Record<string, { revenue: number; count: number; color: string }> = {}
    accounts.filter(a => a.status === 'active').forEach(a => {
      if (!map[a.service_type]) map[a.service_type] = { revenue: 0, count: 0, color: SERVICE_COLORS[a.service_type] || '#6b7280' }
      map[a.service_type].revenue += a.price || 0
      map[a.service_type].count++
    })
    return Object.entries(map)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [accounts])

  // ── Distribución por servicio (pie) ───────────────────────────────────────
  const pieData = useMemo(() => {
    const map: Record<string, number> = {}
    accounts.filter(a => a.status === 'active').forEach(a => {
      map[a.service_type] = (map[a.service_type] || 0) + 1
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value, color: SERVICE_COLORS[name] || '#6b7280' }))
      .sort((a, b) => b.value - a.value)
  }, [accounts])

  // ── Renovaciones urgentes (hoy + vencidas últimos 7 días + próximos 7 días) ─
  const urgentRenewals = useMemo(() => {
    return accounts
      .filter(a => {
        const diff = new Date(a.renewal_date).getTime() - now
        return diff >= -7 * DAY && diff <= 7 * DAY
      })
      .sort((a, b) => new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime())
  }, [accounts])

  // ── Cuentas vencidas sin renovar ─────────────────────────────────────────
  const overdueAccounts = useMemo(() => {
    return accounts
      .filter(a => a.status === 'expired')
      .sort((a, b) => new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime())
      .slice(0, 8)
  }, [accounts])

  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-5">

      {/* ── FILA 1: KPIs ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard
          icon={Users} label="Clientes" color="bg-brand-blue-600"
          value={clients.length}
          sub={`${accounts.length} servicios totales`}
        />
        <KPICard
          icon={Monitor} label="Activas" color="bg-green-600"
          value={kpi.active.length}
          sub={`${Math.round((kpi.active.length / Math.max(accounts.length, 1)) * 100)}% del total`}
          trend={{ value: 'En servicio', up: true }}
        />
        <KPICard
          icon={AlertTriangle} label="Vencidas" color="bg-red-600"
          value={kpi.expired.length}
          sub={`$${kpi.expiredRevenue.toLocaleString()} pendientes`}
          trend={{ value: 'Sin renovar', up: false }}
        />
        <KPICard
          icon={Clock} label="Vencen hoy" color="bg-brand-orange-600"
          value={kpi.todayRen.length}
          sub="Requieren atención"
        />
        <KPICard
          icon={Calendar} label="Esta semana" color="bg-purple-600"
          value={kpi.weekRen.length}
          sub="Próximas 7 días"
        />
        <KPICard
          icon={DollarSign} label="Ingreso mensual" color="bg-emerald-600"
          value={`$${kpi.totalRevenue.toLocaleString()}`}
          sub={`${kpi.active.length} cuentas activas`}
          trend={{ value: 'Cuentas activas', up: true }}
        />
      </div>

      {/* ── FILA 2: Ingresos por servicio + Pie ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Ingresos desglosados por servicio */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-white">Ingresos por servicio</h3>
              <p className="text-xs text-gray-500">Solo cuentas activas · Total: {formatCurrency(kpi.totalRevenue)}</p>
            </div>
          </div>

          {/* Barras horizontales por servicio */}
          <div className="space-y-3">
            {revenueByService.map(s => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{SERVICE_ICONS[s.name] || '📺'}</span>
                    <span className="text-sm text-gray-300">{s.name}</span>
                    <span className="text-xs text-gray-600 bg-dark-600 px-1.5 py-0.5 rounded-full">{s.count}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{formatCurrency(s.revenue)}</span>
                </div>
                <div className="w-full bg-dark-600 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{
                      width: `${(s.revenue / kpi.totalRevenue) * 100}%`,
                      background: s.color,
                    }}
                  />
                </div>
              </div>
            ))}
            {revenueByService.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">Sin datos aún</p>
            )}
          </div>

          {/* Mini chart de barras */}
          {revenueByService.length > 0 && (
            <div className="mt-5 pt-4 border-t border-dark-600">
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={revenueByService} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }}
                    axisLine={false} tickLine={false}
                    tickFormatter={n => n.replace(' Premium', '').replace(' Video', '').replace(' Max', '')} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" name="Ingreso" radius={[4, 4, 0, 0]}>
                    {revenueByService.map((s, i) => (
                      <Cell key={i} fill={s.color} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie distribución */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Distribución</h3>
            <span className="text-xs text-gray-500">{kpi.active.length} activas</span>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={78}
                  dataKey="value" paddingAngle={3} startAngle={90} endAngle={-270}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a1a24', border: '1px solid #3a3a4e', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  formatter={(v: number, name: string) => [`${v} cuentas`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2">
            {pieData.map(s => (
              <div key={s.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <span className="text-xs text-gray-400 flex-1 truncate">{s.name}</span>
                <span className="text-xs font-medium text-white">{s.value}</span>
                <span className="text-xs text-gray-600 w-8 text-right">
                  {Math.round((s.value / kpi.active.length) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILA 3: Renovaciones urgentes + Vencidas ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Renovaciones urgentes con WhatsApp */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-600">
            <div className="flex items-center gap-2">
              <RefreshCw size={15} className="text-brand-orange-400" />
              <h3 className="font-semibold text-white text-sm">Renovaciones urgentes</h3>
              {urgentRenewals.length > 0 && (
                <span className="bg-brand-orange-500/20 text-brand-orange-400 text-xs px-2 py-0.5 rounded-full font-medium">
                  {urgentRenewals.length}
                </span>
              )}
            </div>
            <Link to="/renewals" className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-orange-400 transition-colors">
              Ver todas <ChevronRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-dark-600 max-h-[340px] overflow-y-auto">
            {urgentRenewals.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <RefreshCw size={24} className="text-gray-600" />
                <p className="text-sm text-gray-500">Sin renovaciones urgentes</p>
              </div>
            ) : urgentRenewals.map(a => {
              const daysLeft = Math.ceil((new Date(a.renewal_date).getTime() - now) / DAY)
              const isExpired = daysLeft < 0
              const isToday = daysLeft === 0
              const dateFormatted = format(parseISO(a.renewal_date), 'dd/MM/yyyy')
              const waLink = buildWhatsApp(
                a.client_phone || '', a.client_name || '', a.service_type,
                a.email, dateFormatted, a.price, isExpired
              )
              return (
                <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-600/30 transition-colors">
                  {/* Servicio */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: `${SERVICE_COLORS[a.service_type]}20` }}>
                    {SERVICE_ICONS[a.service_type]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{a.client_name || '—'}</p>
                    <p className="text-xs text-gray-500 truncate">{a.service_type} · {a.email}</p>
                  </div>

                  {/* Días */}
                  <div className="text-right flex-shrink-0 mr-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isExpired ? 'bg-red-500/15 text-red-400' :
                      isToday ? 'bg-brand-orange-500/15 text-brand-orange-400' :
                      'bg-yellow-500/15 text-yellow-400'
                    }`}>
                      {isExpired ? `−${Math.abs(daysLeft)}d` : isToday ? 'Hoy' : `+${daysLeft}d`}
                    </span>
                    <p className="text-xs text-gray-600 mt-0.5">${a.price}</p>
                  </div>

                  {/* WhatsApp */}
                  {(a.client_phone) && (
                    <a href={waLink} target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                      title="Enviar mensaje WhatsApp">
                      <MessageCircle size={15} />
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Vencidas sin renovar */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-600">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-400" />
              <h3 className="font-semibold text-white text-sm">Cuentas vencidas</h3>
              {kpi.expired.length > 0 && (
                <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-medium">
                  {kpi.expired.length}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Pendiente: <span className="text-red-400 font-medium">{formatCurrency(kpi.expiredRevenue)}</span>
            </div>
          </div>

          <div className="divide-y divide-dark-600 max-h-[340px] overflow-y-auto">
            {overdueAccounts.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <AlertTriangle size={24} className="text-gray-600" />
                <p className="text-sm text-gray-500">Sin cuentas vencidas 🎉</p>
              </div>
            ) : overdueAccounts.map(a => {
              const daysAgo = Math.abs(Math.ceil((new Date(a.renewal_date).getTime() - now) / DAY))
              const dateFormatted = format(parseISO(a.renewal_date), 'dd/MM/yyyy')
              const waLink = buildWhatsApp(
                a.client_phone || '', a.client_name || '', a.service_type,
                a.email, dateFormatted, a.price, true
              )
              return (
                <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-600/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: `${SERVICE_COLORS[a.service_type]}20` }}>
                    {SERVICE_ICONS[a.service_type]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{a.client_name || '—'}</p>
                    <p className="text-xs text-gray-500 truncate">{a.service_type} · venció hace {daysAgo}d</p>
                  </div>

                  <div className="text-right flex-shrink-0 mr-2">
                    <p className="text-sm font-semibold text-red-400">${a.price}</p>
                    <p className="text-xs text-gray-600">{dateFormatted}</p>
                  </div>

                  {a.client_phone && (
                    <a href={waLink} target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                      title="Cobrar por WhatsApp">
                      <MessageCircle size={15} />
                    </a>
                  )}
                </div>
              )
            })}
          </div>

          {kpi.expired.length > 8 && (
            <div className="px-4 py-2 border-t border-dark-600">
              <Link to="/renewals" className="flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-brand-orange-400 transition-colors">
                Ver {kpi.expired.length - 8} más <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── FILA 4: Resumen rápido por servicio ───────────────────────────── */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-dark-600 flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">Resumen por servicio</h3>
          <Link to="/accounts" className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-orange-400 transition-colors">
            Ver cuentas <ChevronRight size={13} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Servicio</th>
                <th className="text-center px-3 py-2.5 text-xs text-gray-500 font-medium">Activas</th>
                <th className="text-center px-3 py-2.5 text-xs text-gray-500 font-medium">Vencidas</th>
                <th className="text-center px-3 py-2.5 text-xs text-gray-500 font-medium">Vencen 7d</th>
                <th className="text-right px-4 py-2.5 text-xs text-gray-500 font-medium">Ingreso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {(() => {
                const services = [...new Set(accounts.map(a => a.service_type))]
                return services.map(svc => {
                  const svcAccounts = accounts.filter(a => a.service_type === svc)
                  const active = svcAccounts.filter(a => a.status === 'active').length
                  const expired = svcAccounts.filter(a => a.status === 'expired').length
                  const soon = svcAccounts.filter(a => {
                    const diff = new Date(a.renewal_date).getTime() - now
                    return diff >= 0 && diff <= 7 * DAY
                  }).length
                  const revenue = svcAccounts
                    .filter(a => a.status === 'active')
                    .reduce((s, a) => s + (a.price || 0), 0)
                  return (
                    <tr key={svc} className="hover:bg-dark-600/20 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{SERVICE_ICONS[svc] || '📺'}</span>
                          <span className="text-sm font-medium" style={{ color: SERVICE_COLORS[svc] || '#fff' }}>{svc}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="text-sm font-semibold text-green-400">{active}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`text-sm font-semibold ${expired > 0 ? 'text-red-400' : 'text-gray-600'}`}>{expired}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`text-sm font-semibold ${soon > 0 ? 'text-yellow-400' : 'text-gray-600'}`}>{soon}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="text-sm font-semibold text-white">{formatCurrency(revenue)}</span>
                      </td>
                    </tr>
                  )
                })
              })()}
              {/* Total */}
              {accounts.length > 0 && (
                <tr className="bg-dark-700/50">
                  <td className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</td>
                  <td className="px-3 py-2.5 text-center text-sm font-bold text-green-400">{kpi.active.length}</td>
                  <td className="px-3 py-2.5 text-center text-sm font-bold text-red-400">{kpi.expired.length}</td>
                  <td className="px-3 py-2.5 text-center text-sm font-bold text-yellow-400">{kpi.weekRen.length}</td>
                  <td className="px-4 py-2.5 text-right text-sm font-bold text-white">{formatCurrency(kpi.totalRevenue)}</td>
                </tr>
              )}
            </tbody>
          </table>
          {accounts.length === 0 && (
            <div className="py-12 text-center text-gray-500 text-sm">
              Sin datos — importa tu Excel para ver el resumen
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
