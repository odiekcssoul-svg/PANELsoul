import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const PAGE_TITLES: Record<string, string> = {
  '/admin':              'Dashboard',
  '/admin/clients':      'Clientes',
  '/admin/accounts':     'Servicios Streaming',
  '/admin/renewals':     'Renovaciones',
  '/admin/gmail':        'Correos Gmail',
  '/admin/providers':    'Proveedores',
  '/admin/gift-center':  '🎁 Centro de Canje',
  '/admin/accounting':   'Contabilidad',
  '/admin/notifications':'Notificaciones',
  '/admin/activity':     'Registro de Actividad',
  '/admin/import':       'Importar Excel',
  '/admin/settings':     'Configuración',
  '/admin/security':     'Seguridad',
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'StreamAdmin'

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
