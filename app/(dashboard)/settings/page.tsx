'use client'

import { Settings, Link2, Phone, MessageSquare, Mail } from 'lucide-react'

const CHANNELS = [
  { icon: Mail, label: 'Email (Outlook)', desc: 'Connecté via webhook n8n', color: 'text-sky-400', connected: true },
  { icon: Link2, label: 'LinkedIn', desc: 'Connectez votre compte LinkedIn', color: 'text-blue-500', connected: false },
  { icon: Phone, label: 'WhatsApp', desc: 'Connectez via WhatsApp Business API', color: 'text-green-500', connected: false },
  { icon: MessageSquare, label: 'SMS', desc: 'Connectez via Twilio ou équivalent', color: 'text-purple-400', connected: false },
]

export default function SettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Settings size={22} className="text-gray-400" />
        <h1 className="text-2xl font-bold text-white">Paramètres</h1>
      </div>

      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-800">
          <h2 className="text-sm font-semibold text-gray-300">Configuration des canaux</h2>
        </div>
        {CHANNELS.map(({ icon: Icon, label, desc, color, connected }) => (
          <div key={label} className="flex items-center gap-4 px-6 py-4 border-b border-neutral-800/50 last:border-0">
            <div className={`p-2.5 bg-neutral-800 rounded-xl ${color}`}>
              <Icon size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <div>
              {connected ? (
                <span className="px-2.5 py-1 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                  Connecté
                </span>
              ) : (
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 text-gray-300 hover:bg-neutral-700 border border-neutral-700 transition-colors">
                  Connecter
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
