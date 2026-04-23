import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C } from '../lib/colors';
import { easeOutExpo, easeOutCubic } from '../lib/easing';

const FONT = "'Inter', 'Helvetica Neue', -apple-system, sans-serif";

const FEATURES = [
  {
    number: '01',
    title: "Tout en un seul endroit",
    body: "Email, SMS, WhatsApp, LinkedIn — chaque message centralisé dans une interface unique, épurée.",
    accent: C.violet,
  },
  {
    number: '02',
    title: "Résumé IA instantané",
    body: "Chaque conversation synthétisée en une ligne. Vous saisissez l’essentiel en un coup d’œil.",
    accent: C.gold,
  },
  {
    number: '03',
    title: "Priorité intelligente",
    body: "Les messages critiques remontent automatiquement. Plus aucune urgence ne vous échappe.",
    accent: C.white,
  },
] as const;

// Each card occupies ~60 frames, with 15-frame overlap → 3 cards = ~150 frames
// Total: 180 frames = 6s
export const Scene3Features: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 18, 162, 180], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Section eyebrow
  const eyebrowOpacity = interpolate(frame, [10, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Heading: frames 20-50
  const headingOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const headingY = interpolate(frame, [20, 50], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutExpo,
  });

  // Gold line
  const lineScale = interpolate(frame, [45, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOpacity }}>

      {/* Subtle glow */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 1200,
        height: 400,
        background: `radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '0 120px',
      }}>

        {/* Eyebrow */}
        <div style={{
          fontSize: 13,
          fontFamily: FONT,
          fontWeight: 400,
          letterSpacing: 7,
          color: C.gold,
          textTransform: 'uppercase',
          opacity: eyebrowOpacity,
          marginBottom: 28,
        }}>
          Fonctionnalités
        </div>

        {/* Section heading */}
        <div style={{
          fontSize: 56,
          fontWeight: 200,
          fontFamily: FONT,
          color: C.white,
          letterSpacing: -1.5,
          opacity: headingOpacity,
          transform: `translateY(${headingY}px)`,
          textAlign: 'center',
          marginBottom: 20,
        }}>
          Conçu pour aller à l'essentiel
        </div>

        {/* Gold divider */}
        <div style={{
          width: 160,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
          transform: `scaleX(${lineScale})`,
          transformOrigin: 'center',
          marginBottom: 64,
        }} />

        {/* Feature cards */}
        <div style={{ display: 'flex', gap: 32, width: '100%', maxWidth: 1400 }}>
          {FEATURES.map((feat, i) => {
            const cardStart = 60 + i * 22;
            const cardOpacity = interpolate(frame, [cardStart, cardStart + 30], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const cardY = interpolate(frame, [cardStart, cardStart + 30], [40, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeOutExpo,
            });
            // Accent line width on card reveal
            const accentWidth = interpolate(frame, [cardStart + 10, cardStart + 40], [0, 40], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeOutCubic,
            });

            return (
              <div
                key={feat.number}
                style={{
                  flex: 1,
                  padding: '40px 36px',
                  borderRadius: 16,
                  border: `1px solid ${C.border}`,
                  background: 'rgba(255,255,255,0.02)',
                  opacity: cardOpacity,
                  transform: `translateY(${cardY}px)`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                }}
              >
                {/* Number */}
                <div style={{
                  fontSize: 12,
                  fontWeight: 400,
                  fontFamily: FONT,
                  letterSpacing: 4,
                  color: feat.accent,
                  opacity: 0.6,
                  marginBottom: 20,
                }}>
                  {feat.number}
                </div>

                {/* Accent line */}
                <div style={{
                  width: accentWidth,
                  height: 2,
                  background: feat.accent,
                  borderRadius: 2,
                  marginBottom: 24,
                }} />

                {/* Title */}
                <div style={{
                  fontSize: 24,
                  fontWeight: 300,
                  fontFamily: FONT,
                  color: C.white,
                  letterSpacing: -0.3,
                  lineHeight: 1.3,
                  marginBottom: 16,
                }}>
                  {feat.title}
                </div>

                {/* Body */}
                <div style={{
                  fontSize: 16,
                  fontWeight: 300,
                  fontFamily: FONT,
                  color: C.muted,
                  lineHeight: 1.7,
                  letterSpacing: 0.1,
                }}>
                  {feat.body}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </AbsoluteFill>
  );
};
