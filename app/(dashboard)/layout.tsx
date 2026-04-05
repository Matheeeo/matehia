'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { MessageSquare, User, Zap, Settings, LogOut, Menu, X } from 'lucide-react'
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
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!session) router.replace('/login')
  }, [session, router])

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false) }, [pathname])

  if (!session) return null

  const initials = (user?.email ?? '?').charAt(0).toUpperCase()

  return (
    <div className="flex h-full bg-black">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-neutral-800 flex-col bg-neutral-950">
        <div className="h-16 flex items-center px-6 border-b border-neutral-800 shrink-0">
          <MessageSquare size={22} className="text-purple-500 mr-2" />
          <span className="text-lg font-semibold text-white">Matehia</span>
        </div>
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

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile drawer panel ── */}
      <aside className={clsx(
        'md:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-neutral-950 border-r border-neutral-800 transition-transform duration-300',
        drawerOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-purple-500" />
            <span className="text-base font-semibold text-white">Matehia</span>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="text-gray-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-3 rounded-lg mb-1 text-sm font-medium transition-colors',
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
        <div className="p-4 border-t border-neutral-800 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300 text-sm font-semibold">
              {initials}
            </div>
            <span className="text-xs text-gray-400 truncate flex-1">{user?.email}</span>
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

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-neutral-800 bg-neutral-950 shrink-0">
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-gray-400 hover:text-white p-1 -ml-1"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-purple-500" />
            <span className="text-base font-semibold text-white">Matehia</span>
          </div>
        </div>

        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
