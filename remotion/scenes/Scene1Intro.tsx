import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C } from '../lib/colors';
import { easeOutExpo, easeOutCubic } from '../lib/easing';

const FONT = "'Inter', 'Helvetica Neue', -apple-system, sans-serif";
const LETTERS = 'MATEHIA'.split('');

// 150 frames = 5s
export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 15, 135, 150], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Gold lines: frames 15-50
  const lineScale = interpolate(frame, [15, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });

  // Ambient glow pulse
  const glowOpacity = interpolate(frame, [50, 120], [0, 0.7], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });

  // Subtitle: "UNIFIED INBOX — POUR DIRIGEANTS"
  const subtitleOpacity = interpolate(frame, [90, 120], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subtitleY = interpolate(frame, [90, 120], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutExpo,
  });

  // Eyebrow label
  const eyebrowOpacity = interpolate(frame, [100, 130], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{ background: C.bg, opacity: sceneOpacity }}
    >
      {/* Ambient radial glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -54%)',
        width: 900,
        height: 500,
        background: `radial-gradient(ellipse, ${C.violetMid} 0%, transparent 68%)`,
        opacity: glowOpacity,
        pointerEvents: 'none',
      }} />

      {/* Center content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 0,
      }}>

        {/* Eyebrow */}
        <div style={{
          fontSize: 13,
          fontFamily: FONT,
          fontWeight: 400,
          letterSpacing: 8,
          color: C.gold,
          textTransform: 'uppercase',
          opacity: eyebrowOpacity,
          marginBottom: 36,
        }}>
          Présentation
        </div>

        {/* Gold top line */}
        <div style={{
          width: 160,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
          marginBottom: 40,
          transform: `scaleX(${lineScale})`,
          transformOrigin: 'center',
        }} />

        {/* MATEHIA — letter-by-letter reveal */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          {LETTERS.map((letter, i) => {
            const start = 28 + i * 9;
            const end = start + 28;
            const opacity = interpolate(frame, [start, end], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const y = interpolate(frame, [start, end], [28, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeOutExpo,
            });
            return (
              <span
                key={i}
                style={{
                  fontSize: 128,
                  fontWeight: 200,
                  fontFamily: FONT,
                  letterSpacing: 28,
                  color: C.white,
                  opacity,
                  transform: `translateY(${y}px)`,
                  display: 'inline-block',
                  lineHeight: 1,
                }}
              >
                {letter}
              </span>
            );
          })}
        </div>

        {/* Gold bottom line */}
        <div style={{
          width: 160,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
          marginTop: 40,
          transform: `scaleX(${lineScale})`,
          transformOrigin: 'center',
        }} />

        {/* Subtitle */}
        <div style={{
          marginTop: 32,
          fontSize: 17,
          fontWeight: 300,
          letterSpacing: 7,
          color: C.muted,
          fontFamily: FONT,
          textTransform: 'uppercase',
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
        }}>
          Unified Inbox · Pour Dirigeants
        </div>

      </div>
    </AbsoluteFill>
  );
};
