import { Shield, Key, Lock, Eye, EyeOff, Check } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function Security() {
  const { currentUser } = useStore()
  const [showPasswords, setShowPasswords] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)
    if (error) {
      toast.error('Error al actualizar: ' + error.message)
    } else {
      toast.success('Contraseña actualizada correctamente')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Role badge */}
      <div className="card flex items-center gap-4">
        <div className="p-3 rounded-xl bg-brand-blue-500/10">
          <Shield size={24} className="text-brand-blue-400" />
        </div>
        <div>
          <p className="font-semibold text-white">Tu rol actual</p>
          <p className="text-sm text-gray-400">
            {currentUser?.role === 'admin' ? '👑 Administrador — acceso completo' : '👤 Empleado — acceso limitado'}
          </p>
        </div>
        <span className={`ml-auto badge ${
          currentUser?.role === 'admin' ? 'text-brand-orange-400 bg-brand-orange-400/10' : 'text-brand-blue-400 bg-brand-blue-400/10'
        }`}>
          {currentUser?.role === 'admin' ? 'Admin' : 'Empleado'}
        </span>
      </div>

      {/* Change password */}
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <Key size={18} className="text-brand-orange-400" />
          <h3 className="font-semibold text-white">Cambiar contraseña</h3>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label">Nueva contraseña</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                className="input pr-10"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
              />
              <button type="button" onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Confirmar contraseña</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              className="input"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              required
            />
          </div>
          {newPassword && (
            <div className="space-y-1">
              {[
                { label: 'Al menos 8 caracteres', ok: newPassword.length >= 8 },
                { label: 'Las contraseñas coinciden', ok: newPassword === confirmPassword && confirmPassword.length > 0 },
              ].map(r => (
                <div key={r.label} className={`flex items-center gap-2 text-xs ${r.ok ? 'text-green-400' : 'text-gray-500'}`}>
                  <Check size={12} className={r.ok ? 'opacity-100' : 'opacity-30'} />
                  {r.label}
                </div>
              ))}
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Actualizando...
              </span>
            ) : (
              <><Lock size={14} /> Actualizar contraseña</>
            )}
          </button>
        </form>
      </div>

      {/* Permissions info */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Lock size={18} className="text-gray-400" />
          <h3 className="font-semibold text-white">Permisos por rol</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left py-2 text-gray-400 font-medium">Módulo</th>
                <th className="text-center py-2 text-brand-orange-400 font-medium">Admin</th>
                <th className="text-center py-2 text-brand-blue-400 font-medium">Empleado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {[
                ['Dashboard', true, true],
                ['Clientes', true, true],
                ['Cuentas Streaming', true, true],
                ['Renovaciones', true, true],
                ['Gmail', true, true],
                ['Proveedores', true, false],
                ['Notificaciones', true, true],
                ['Seguridad', true, false],
                ['Exportar datos', true, true],
              ].map(([mod, admin, emp]) => (
                <tr key={mod as string}>
                  <td className="py-2 text-gray-300">{mod as string}</td>
                  <td className="py-2 text-center">{admin ? '✅' : '❌'}</td>
                  <td className="py-2 text-center">{emp ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
