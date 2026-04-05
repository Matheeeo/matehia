'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { MessageSquare, User, Zap, Settings, LogOut } from 'lucide-react'
import clsx from 'clsx'

const NAV_ITEMS = [
  { href: '/conversations', label: 'Conversations', icon: MessageSquare },
  { href: '/actions', label: 'Actions', icon: Zap },
  { href: '/profile', label: 'Profil', icon: User },
  { href: '/settings', label: 'Paramètres', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!session) router.replace('/login')
  }, [session, router])

  if (!session) return null

  const initials = (user?.email ?? '?').charAt(0).toUpperCase()

  return (
    <div className="flex h-full bg-black">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-neutral-800 flex flex-col bg-neutral-950">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-neutral-800 shrink-0">
          <MessageSquare size={22} className="text-purple-500 mr-2" />
          <span className="text-lg font-semibold text-white">Matehia</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-purple-600/20 text-purple-400'
                  : 'text-gray-400 hover:bg-neutral-800 hover:text-white'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-neutral-800 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300 text-sm font-semibold">
              {initials}
            </div>
            <span className="text-sm text-gray-400 truncate flex-1">{user?.email}</span>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
