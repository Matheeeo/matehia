import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C } from '../lib/colors';
import { easeOutExpo, easeOutCubic } from '../lib/easing';

const FONT = "'Inter', 'Helvetica Neue', -apple-system, sans-serif";

const CHANNELS = [
  { emoji: '✉', label: 'Email' },
  { emoji: '📱', label: 'SMS' },
  { emoji: '💬', label: 'WhatsApp' },
  { emoji: '💼', label: 'LinkedIn' },
] as const;

// 150 frames = 5s
export const Scene2ValueProp: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 18, 132, 150], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Eyebrow: frames 10-35
  const eyebrowOpacity = interpolate(frame, [10, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // "Inbox unifiée": frames 20-55
  const line1Opacity = interpolate(frame, [20, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const line1Y = interpolate(frame, [20, 55], [48, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutExpo,
  });

  // "pour dirigeants": frames 35-70
  const line2Opacity = interpolate(frame, [35, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const line2Y = interpolate(frame, [35, 70], [48, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutExpo,
  });

  // Gold divider: frames 65-85
  const dividerScale = interpolate(frame, [65, 88], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });

  // Ambient glow
  const glowOpacity = interpolate(frame, [30, 90], [0, 0.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOpacity }}>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: '45%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 1100,
        height: 600,
        background: `radial-gradient(ellipse, ${C.violetDim} 0%, transparent 70%)`,
        opacity: glowOpacity,
        pointerEvents: 'none',
      }} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
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
          marginBottom: 40,
        }}>
          Le Problème Résolu
        </div>

        {/* "Inbox unifiée" */}
        <div style={{
          fontSize: 100,
          fontWeight: 200,
          fontFamily: FONT,
          color: C.white,
          letterSpacing: -3,
          lineHeight: 1.05,
          opacity: line1Opacity,
          transform: `translateY(${line1Y}px)`,
          textAlign: 'center',
        }}>
          Inbox unifiée
        </div>

        {/* "pour dirigeants" */}
        <div style={{
          fontSize: 100,
          fontWeight: 200,
          fontFamily: FONT,
          color: C.violet,
          letterSpacing: -3,
          lineHeight: 1.05,
          opacity: line2Opacity,
          transform: `translateY(${line2Y}px)`,
          textAlign: 'center',
          marginBottom: 64,
        }}>
          pour dirigeants
        </div>

        {/* Gold divider */}
        <div style={{
          width: 220,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
          transform: `scaleX(${dividerScale})`,
          transformOrigin: 'center',
          marginBottom: 56,
        }} />

        {/* Channel pills */}
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
          {CHANNELS.map((ch, i) => {
            const start = 82 + i * 10;
            const pillOpacity = interpolate(frame, [start, start + 22], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const pillY = interpolate(frame, [start, start + 22], [18, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeOutExpo,
            });
            return (
              <div
                key={ch.label}
                style={{
                  opacity: pillOpacity,
                  transform: `translateY(${pillY}px)`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '13px 26px',
                  borderRadius: 100,
                  border: `1px solid ${C.border}`,
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <span style={{ fontSize: 22 }}>{ch.emoji}</span>
                <span style={{
                  fontSize: 16,
                  fontWeight: 300,
                  color: C.muted,
                  fontFamily: FONT,
                  letterSpacing: 0.3,
                }}>
                  {ch.label}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </AbsoluteFill>
  );
};
