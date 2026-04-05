'use client'

import { Zap } from 'lucide-react'

export default function ActionsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-2xl w-full mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Zap size={22} className="text-gray-400" />
        <h1 className="text-2xl font-bold text-white">Actions</h1>
      </div>
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-8 text-center">
        <Zap size={36} className="mx-auto mb-4 text-neutral-700" />
        <p className="text-gray-500 text-sm">Les actions automatiques arrivent bientôt.</p>
        <p className="text-xs text-neutral-700 mt-2">Relances, réponses automatiques, qualifications IA...</p>
      </div>
    </div>
  )
}
