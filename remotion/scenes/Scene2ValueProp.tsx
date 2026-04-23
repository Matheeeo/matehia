import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../lib/colors';
import { easeOutExpo, easeOutCubic } from '../lib/easing';
import { ArcBackground } from '../components/ArcBackground';

const FONT = "'Inter', 'Helvetica Neue', -apple-system, sans-serif";

const LINE1_WORDS = ['Pilotez', 'votre', 'entreprise', 'depuis'];
const LINE2_WORDS = ['un', 'seul', 'point', 'de', 'commande'];

interface WordRevealProps {
  word: string;
  startFrame: number;
  color?: string;
}
const WordReveal: React.FC<WordRevealProps> = ({ word, startFrame, color = C.white }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, startFrame + 32], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutExpo,
  });
  return (
    <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
      <span style={{
        display: 'inline-block',
        transform: `translateY(${(1 - progress) * 110}%)`,
        opacity: Math.min(1, progress * 1.4),
        color,
      }}>
        {word}
      </span>
    </span>
  );
};

const TILES = [
  { label: 'Priorités', icon: '⊙' },
  { label: 'Messages', icon: '□' },
  { label: 'Agenda', icon: '▦' },
  { label: 'Clients', icon: '◉' },
  { label: 'Outils IA', icon: '⚡', badge: 'BÊTA' },
  { label: 'Réglages', icon: '⚙' },
] as const;

// 240 frames = 8s
export const Scene2ValueProp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOpacity = interpolate(frame, [0, 20, 220, 240], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Badge: frames 12–40
  const badgeOpacity = interpolate(frame, [12, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const badgeY = interpolate(frame, [12, 40], [12, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutExpo,
  });

  // Line 1: start 30, stagger 13
  // Line 2: start 85, stagger 13
  // Subtitle: 170–205
  const subtitleOpacity = interpolate(frame, [170, 205], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subtitleY = interpolate(frame, [170, 205], [18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });

  // Command bar: frame 190
  const cmdSpring = spring({
    frame: frame - 190,
    fps,
    config: { damping: 22, stiffness: 180, mass: 0.8 },
    durationInFrames: 35,
  });
  const cmdOpacity = interpolate(frame, [190, 215], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Divider under title: frames 150–175
  const dividerScale = interpolate(frame, [150, 178], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOpacity }}>
      <ArcBackground drawStart={0} drawDuration={80} globalOpacity={0.85} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '0 120px',
      }}>

        {/* Badge */}
        <div style={{
          opacity: badgeOpacity,
          transform: `translateY(${badgeY}px)`,
          marginBottom: 44,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 20px',
          borderRadius: 100,
          border: `1px solid rgba(99,102,241,0.3)`,
          background: 'rgba(99,102,241,0.08)',
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, fontFamily: FONT, color: C.purple, letterSpacing: 3.5, textTransform: 'uppercase' }}>
            ⚡ Luxee Command Center
          </span>
        </div>

        {/* Line 1 */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0 20px',
          fontSize: 88,
          fontWeight: 800,
          fontFamily: FONT,
          letterSpacing: -3,
          lineHeight: 1.06,
          marginBottom: 6,
        }}>
          {LINE1_WORDS.map((word, i) => (
            <WordReveal key={word} word={word} startFrame={30 + i * 13} color={C.white} />
          ))}
        </div>

        {/* Line 2 — indigo */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0 20px',
          fontSize: 88,
          fontWeight: 800,
          fontFamily: FONT,
          letterSpacing: -3,
          lineHeight: 1.06,
          marginBottom: 0,
        }}>
          {LINE2_WORDS.map((word, i) => (
            <WordReveal key={word} word={word} startFrame={85 + i * 13} color={C.purple} />
          ))}
        </div>

        {/* Gold-style divider */}
        <div style={{
          width: 260,
          height: 1,
          background: `linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)`,
          marginTop: 40,
          marginBottom: 36,
          transform: `scaleX(${dividerScale})`,
          transformOrigin: 'center',
        }} />

        {/* Subtitle */}
        <div style={{
          fontSize: 20,
          fontWeight: 300,
          fontFamily: FONT,
          color: C.muted,
          textAlign: 'center',
          maxWidth: 720,
          lineHeight: 1.65,
          letterSpacing: 0.1,
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          marginBottom: 48,
        }}>
          Actions, messageries, agenda et clients dans un cockpit fluide,
          rapide et prêt à exécuter.
        </div>

        {/* Command bar */}
        <div style={{
          width: 700,
          padding: '18px 24px',
          borderRadius: 16,
          border: `1px solid ${C.borderLight}`,
          background: 'rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 52,
          opacity: cmdOpacity,
          transform: `scaleY(${cmdSpring})`,
          transformOrigin: 'center',
        }}>
          <span style={{ fontSize: 20, opacity: 0.6 }}>⚡</span>
          <span style={{ fontSize: 16, fontWeight: 300, fontFamily: FONT, color: 'rgba(255,255,255,0.3)', flex: 1 }}>
            Décrivez un besoin, l&apos;IA vous guide puis exécute
          </span>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: C.purple,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Module tiles 3×2 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 210px)',
          gridTemplateRows: 'repeat(2, 64px)',
          gap: 12,
        }}>
          {TILES.map((tile, i) => {
            const start = 205 + i * 10;
            const tileOpacity = interpolate(frame, [start, start + 26], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            const tileY = interpolate(frame, [start, start + 26], [18, 0], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutExpo,
            });
            return (
              <div key={tile.label} style={{
                opacity: tileOpacity,
                transform: `translateY(${tileY}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 20px',
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                background: C.bgCard,
              }}>
                <span style={{ fontSize: 16, opacity: 0.7 }}>{tile.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 500, fontFamily: FONT, color: C.white, letterSpacing: -0.2 }}>
                  {tile.label}
                </span>
                {'badge' in tile && tile.badge && (
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    fontFamily: FONT,
                    color: C.purple,
                    letterSpacing: 1,
                    padding: '2px 7px',
                    borderRadius: 4,
                    background: 'rgba(99,102,241,0.12)',
                    marginLeft: 'auto',
                  }}>
                    {tile.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </AbsoluteFill>
  );
};
