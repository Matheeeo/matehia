'use client'

import dynamic from 'next/dynamic'

// Remotion Player must be client-side only (no SSR)
const Player = dynamic(
  () => import('@remotion/player').then((m) => m.Player),
  { ssr: false }
)

// Lazy-load the composition to avoid server-side Remotion context issues
const MatehiaPresentation = dynamic(
  () => import('../../remotion/MatehiaPresentation').then((m) => m.MatehiaPresentation),
  { ssr: false }
)

export default function PreviewPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0c0c1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      gap: 20,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        color: 'rgba(255,255,255,0.35)',
        fontSize: 13,
        fontFamily: 'system-ui, sans-serif',
        letterSpacing: 1,
      }}>
        <span style={{ color: '#6366f1', fontWeight: 600 }}>OmniChat</span>
        <span>·</span>
        <span>Motion Design Preview</span>
      </div>

      <div style={{ width: '100%', maxWidth: 1280, borderRadius: 12, overflow: 'hidden', boxShadow: '0 0 80px rgba(99,102,241,0.15)' }}>
        <Player
          // @ts-expect-error — dynamic import type mismatch at build time
          component={MatehiaPresentation}
          durationInFrames={600}
          fps={30}
          compositionWidth={1920}
          compositionHeight={1080}
          style={{ width: '100%' }}
          controls
          loop
        />
      </div>

      <div style={{
        color: 'rgba(255,255,255,0.2)',
        fontSize: 11,
        fontFamily: 'system-ui, sans-serif',
        letterSpacing: 0.5,
      }}>
        600 frames · 30 fps · 20s · 1920×1080
      </div>
    </div>
  )
}
