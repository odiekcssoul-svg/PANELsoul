import { Menu, Bell, Search } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  onMenuClick: () => void
  title: string
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const { notifications } = useStore()
  const unread = notifications.filter(n => !n.read).length
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  return (
    <header className="sticky top-0 z-30 bg-dark-800/80 backdrop-blur-md border-b border-dark-600 px-4 py-3 flex items-center gap-3">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
      >
        <Menu size={20} />
      </button>

      <h2 className="font-semibold text-white text-base flex-1 lg:flex-none">{title}</h2>

      {/* Global search */}
      <div className="hidden md:flex flex-1 max-w-xs relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          className="input pl-8 py-2 text-xs"
          placeholder="Buscar en todo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-brand-orange-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
