import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Monitor, RefreshCw,
  Mail, Truck, Bell, Shield, LogOut, Play, X,
  Activity, FileSpreadsheet, Wallet,
} from 'lucide-react'
import { useStore } from '@/store/useStore'

const NAV = [
  { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/clients',      icon: Users,           label: 'Clientes' },
  { to: '/admin/accounts',     icon: Monitor,         label: 'Servicios Streaming' },
  { to: '/admin/renewals',     icon: RefreshCw,       label: 'Renovaciones' },
  { to: '/admin/gmail',        icon: Mail,            label: 'Correos Gmail' },
  { to: '/admin/providers',    icon: Truck,           label: 'Proveedores' },
  { to: '/admin/accounting',   icon: Wallet,          label: 'Contabilidad' },
  { to: '/admin/notifications',icon: Bell,            label: 'Notificaciones' },
  { to: '/admin/activity',     icon: Activity,        label: 'Actividad' },
  { to: '/admin/import',       icon: FileSpreadsheet, label: 'Importar Excel' },
  { to: '/admin/security',     icon: Shield,          label: 'Seguridad' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { currentUser, logout, notifications } = useStore()
  const unread = notifications.filter(n => !n.read).length

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[260px] bg-dark-800 border-r border-dark-600 
          z-50 flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-dark-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-orange-500 to-brand-orange-700 
              flex items-center justify-center shadow-glow-orange">
              <Play size={16} className="text-white" fill="white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm leading-none">StreamAdmin</h1>
              <p className="text-xs text-gray-500 mt-0.5">Gestión de Streaming</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={17} />
              <span>{label}</span>
              {label === 'Notificaciones' && unread > 0 && (
                <span className="ml-auto bg-brand-orange-500 text-white text-xs font-bold 
                  w-5 h-5 rounded-full flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-dark-600">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue-500 to-brand-blue-700 
              flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {currentUser?.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut size={17} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
