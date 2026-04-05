'use client'

import { useAuth } from '@/contexts/AuthContext'
import { User } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const initials = (user?.email ?? '?').charAt(0).toUpperCase()

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Profil</h1>

      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-purple-900/40 to-purple-600/10" />
        <div className="px-6 pb-6">
          <div className="-mt-8 mb-4">
            <div className="w-16 h-16 rounded-full bg-purple-600/30 border-4 border-neutral-900 flex items-center justify-center text-2xl font-bold text-purple-300">
              {initials}
            </div>
          </div>
          <p className="text-white font-medium">{user?.email}</p>
          <p className="text-xs text-gray-500 mt-1">Compte connecté via Supabase Auth</p>
        </div>
      </div>

      <div className="mt-6 bg-neutral-900 rounded-2xl border border-neutral-800 p-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Informations</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Adresse e-mail</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-lg text-sm text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-600 mt-1">L'adresse e-mail ne peut pas être modifiée ici.</p>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">ID utilisateur</label>
            <input
              type="text"
              value={user?.id ?? ''}
              disabled
              className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-lg text-xs text-gray-600 cursor-not-allowed font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
