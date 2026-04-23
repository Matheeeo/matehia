import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../lib/colors';
import { easeOutExpo, easeOutCubic } from '../lib/easing';
import { ArcBackground } from '../components/ArcBackground';

const FONT = "'Inter', 'Helvetica Neue', -apple-system, sans-serif";

// Hero headline broken into words for staggered reveal
const LINE1_WORDS = ['Pilotez', 'votre', 'entreprise', 'depuis'];
const LINE2_WORDS = ['un', 'seul', 'point', 'de', 'commande'];

interface WordRevealProps {
  word: string;
  startFrame: number;
  style?: React.CSSProperties;
}

const WordReveal: React.FC<WordRevealProps> = ({ word, startFrame, style }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, startFrame + 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutExpo,
  });
  return (
    <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', ...style }}>
      <span style={{
        display: 'inline-block',
        transform: `translateY(${(1 - progress) * 105}%)`,
        opacity: progress,
      }}>
        {word}
      </span>
    </span>
  );
};

const TILES = [
  { label: 'Priorités', icon: '⊙', accent: C.purple },
  { label: 'Messages', icon: '□', accent: C.purple },
  { label: 'Agenda', icon: '▦', accent: C.blue },
  { label: 'Clients', icon: '◉', accent: C.green },
  { label: 'Outils IA', icon: '⚡', accent: C.orange, badge: 'BÊTA' },
  { label: 'Réglages', icon: '⚙', accent: C.muted },
] as const;

// 170 frames = 5.7s
export const Scene2ValueProp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOpacity = interpolate(frame, [0, 16, 154, 170], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // "LUXEE COMMAND CENTER" badge: frames 8-28
  const badgeOpacity = interpolate(frame, [8, 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const badgeY = interpolate(frame, [8, 28], [10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutExpo,
  });

  // Line 1 words start at frame 20, stagger 8 each
  // Line 2 words start at frame 52 (after line 1 + small pause), stagger 8 each

  // Subtitle: frames 105–132
  const subtitleOpacity = interpolate(frame, [105, 132], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subtitleY = interpolate(frame, [105, 132], [14, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });

  // Command bar: frames 115–140
  const cmdBarScale = spring({
    frame: frame - 115,
    fps,
    config: { damping: 20, stiffness: 200, mass: 0.7 },
    durationInFrames: 30,
  });
  const cmdBarOpacity = interpolate(frame, [115, 138], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Tiles cascade: frames 128 + i*7
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOpacity }}>

      <ArcBackground drawStart={0} drawDuration={60} globalOpacity={0.9} />

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
          marginBottom: 36,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 18px',
          borderRadius: 100,
          border: `1px solid ${C.borderLight}`,
          background: 'rgba(99,102,241,0.08)',
        }}>
          <span style={{ fontSize: 12 }}>⚡</span>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            fontFamily: FONT,
            color: C.purple,
            letterSpacing: 3.5,
            textTransform: 'uppercase',
          }}>
            Luxee Command Center
          </span>
        </div>

        {/* Headline line 1 — word-by-word reveal */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0 18px',
          fontSize: 82,
          fontWeight: 800,
          fontFamily: FONT,
          color: C.white,
          letterSpacing: -2.5,
          lineHeight: 1.08,
          marginBottom: 4,
        }}>
          {LINE1_WORDS.map((word, i) => (
            <WordReveal key={word} word={word} startFrame={20 + i * 9} />
          ))}
        </div>

        {/* Headline line 2 */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0 18px',
          fontSize: 82,
          fontWeight: 800,
          fontFamily: FONT,
          color: C.purple,
          letterSpacing: -2.5,
          lineHeight: 1.08,
          marginBottom: 32,
        }}>
          {LINE2_WORDS.map((word, i) => (
            <WordReveal key={word} word={word} startFrame={56 + i * 9} />
          ))}
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 18,
          fontWeight: 300,
          fontFamily: FONT,
          color: C.muted,
          textAlign: 'center',
          maxWidth: 680,
          lineHeight: 1.6,
          letterSpacing: 0.1,
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          marginBottom: 40,
        }}>
          Actions, messageries, agenda et clients dans un cockpit fluide,
          rapide et prêt à exécuter.
        </div>

        {/* AI Command bar */}
        <div style={{
          width: 660,
          padding: '16px 22px',
          borderRadius: 14,
          border: `1px solid ${C.borderLight}`,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 48,
          opacity: cmdBarOpacity,
          transform: `scaleY(${cmdBarScale})`,
          transformOrigin: 'center',
        }}>
          <span style={{ fontSize: 20, opacity: 0.7 }}>⚡</span>
          <span style={{
            fontSize: 16,
            fontWeight: 300,
            fontFamily: FONT,
            color: 'rgba(255,255,255,0.35)',
            flex: 1,
          }}>
            Décrivez un besoin, l&apos;IA vous guide puis exécute
          </span>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
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
          gridTemplateColumns: 'repeat(3, 200px)',
          gridTemplateRows: 'repeat(2, 60px)',
          gap: 10,
        }}>
          {TILES.map((tile, i) => {
            const tileOpacity = interpolate(frame, [135 + i * 7, 155 + i * 7], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const tileY = interpolate(frame, [135 + i * 7, 155 + i * 7], [16, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeOutExpo,
            });
            return (
              <div
                key={tile.label}
                style={{
                  opacity: tileOpacity,
                  transform: `translateY(${tileY}px)`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '0 18px',
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  background: C.bgCard,
                }}
              >
                <span style={{ fontSize: 15, opacity: 0.8 }}>{tile.icon}</span>
                <span style={{
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: FONT,
                  color: C.white,
                  letterSpacing: -0.2,
                }}>
                  {tile.label}
                </span>
                {'badge' in tile && tile.badge && (
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    fontFamily: FONT,
                    color: C.purple,
                    letterSpacing: 1,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: C.purpleDim,
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
