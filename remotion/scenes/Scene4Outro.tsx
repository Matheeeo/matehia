import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C } from '../lib/colors';
import { easeOutExpo, easeOutCubic, easeInExpo } from '../lib/easing';

const FONT = "'Inter', 'Helvetica Neue', -apple-system, sans-serif";
const LETTERS = 'MATEHIA'.split('');

// 120 frames = 4s
export const Scene4Outro: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 20, 105, 120], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Glow builds: frames 10-80
  const glowOpacity = interpolate(frame, [10, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });

  // Gold lines: frames 15-45
  const lineScale = interpolate(frame, [15, 48], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });

  // MATEHIA letters stagger
  // Tagline: frames 80-108
  const taglineOpacity = interpolate(frame, [80, 108], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const taglineY = interpolate(frame, [80, 108], [14, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutExpo,
  });

  // Gold shimmer sweep across the title
  // We simulate a shimmer by moving a bright overlay left to right
  const shimmerX = interpolate(frame, [50, 90], [-200, 1400], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeInExpo,
  });
  const shimmerOpacity = interpolate(frame, [50, 55, 85, 90], [0, 0.6, 0.6, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOpacity }}>

      {/* Ambient violet glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -54%)',
        width: 1000,
        height: 550,
        background: `radial-gradient(ellipse, ${C.violetMid} 0%, transparent 68%)`,
        opacity: glowOpacity,
        pointerEvents: 'none',
      }} />

      {/* Gold shimmer sweep */}
      <div style={{
        position: 'absolute',
        top: '38%',
        left: shimmerX,
        width: 180,
        height: 160,
        background: `linear-gradient(90deg, transparent, rgba(201,169,110,0.15), transparent)`,
        opacity: shimmerOpacity,
        pointerEvents: 'none',
        transform: 'skewX(-12deg)',
      }} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}>

        {/* Gold top line */}
        <div style={{
          width: 160,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
          marginBottom: 44,
          transform: `scaleX(${lineScale})`,
          transformOrigin: 'center',
        }} />

        {/* MATEHIA letters — staggered fade-in */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, position: 'relative' }}>
          {LETTERS.map((letter, i) => {
            const start = 22 + i * 8;
            const end = start + 30;
            const opacity = interpolate(frame, [start, end], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const y = interpolate(frame, [start, end], [24, 0], {
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
          marginTop: 44,
          transform: `scaleX(${lineScale})`,
          transformOrigin: 'center',
          marginBottom: 36,
        }} />

        {/* Tagline */}
        <div style={{
          fontSize: 18,
          fontWeight: 300,
          letterSpacing: 5,
          color: C.gold,
          fontFamily: FONT,
          textTransform: 'uppercase',
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
        }}>
          Reprenez le contrôle.
        </div>

      </div>
    </AbsoluteFill>
  );
};
