import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useStore } from '@/store/useStore'
import { AppLayout } from '@/components/layout/AppLayout'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Clients from '@/pages/Clients'
import Accounts from '@/pages/Accounts'
import Renewals from '@/pages/Renewals'
import Gmail from '@/pages/Gmail'
import Providers from '@/pages/Providers'
import Notifications from '@/pages/Notifications'
import ActivityPage from '@/pages/Activity'
import Security from '@/pages/Security'
import Import from '@/pages/Import'
import Accounting from '@/pages/Accounting'
import SettingsPage from '@/pages/SettingsPage'
import GiftCenter from '@/pages/GiftCenter'
import GiftRedeem from '@/pages/GiftRedeem'
import { Play } from 'lucide-react'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authLoading } = useStore()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700
          flex items-center justify-center shadow-glow-blue">
          <Play size={24} className="text-white" fill="white" />
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Cargando...
        </div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />
}

export default function App() {
  const { initAuth } = useStore()

  useEffect(() => {
    initAuth()
  }, [])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a24',
            color: '#f3f4f6',
            border: '1px solid #3a3a4e',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#3b82f6', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Landing pública */}
        <Route path="/" element={<Landing />} />

        {/* Página pública de canje */}
        <Route path="/canjear" element={<GiftRedeem />} />
        <Route path="/redeem" element={<GiftRedeem />} />

        {/* Admin login */}
        <Route path="/admin/login" element={<Login />} />

        {/* Panel admin protegido */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="renewals" element={<Renewals />} />
          <Route path="gmail" element={<Gmail />} />
          <Route path="providers" element={<Providers />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="security" element={<Security />} />
          <Route path="import" element={<Import />} />
          <Route path="accounting" element={<Accounting />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="gift-center" element={<GiftCenter />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
