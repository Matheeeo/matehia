import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../lib/colors';
import { easeOutExpo, easeInExpo, easeOutCubic } from '../lib/easing';
import { ArcBackground } from '../components/ArcBackground';

const FONT = "'Inter', 'Helvetica Neue', -apple-system, sans-serif";

const WORDS = [
  { text: 'Pilotez.', color: C.orange },
  { text: 'Priorisez.', color: C.purple },
  { text: 'Exécutez.', color: C.white },
];

// 150 frames = 5s
export const Scene4Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOpacity = interpolate(frame, [0, 22, 132, 150], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const arcOpacity = interpolate(frame, [0, 50], [0.5, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const bloomOpacity = interpolate(frame, [15, 80], [0, 0.9], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });

  // Logo spring: frame 18
  const logoSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 24, stiffness: 140, mass: 1.0 },
    durationInFrames: 55,
  });
  const logoOpacity = interpolate(frame, [18, 42], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Shimmer: frames 45–95
  const shimmerX = interpolate(frame, [45, 95], [-220, 1140], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeInExpo,
  });
  const shimmerOpacity = interpolate(frame, [45, 54, 88, 96], [0, 0.55, 0.55, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Divider: frames 70–95
  const dividerScale = interpolate(frame, [70, 96], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });

  // CTA: frames 118–138
  const ctaOpacity = interpolate(frame, [118, 138], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ctaY = interpolate(frame, [118, 138], [14, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutExpo,
  });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOpacity }}>

      <ArcBackground drawStart={0} drawDuration={1} globalOpacity={arcOpacity} />

      {/* Purple bloom */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -54%)',
        width: 1100,
        height: 580,
        background: `radial-gradient(ellipse, rgba(99,102,241,0.28) 0%, rgba(79,46,221,0.08) 50%, transparent 70%)`,
        opacity: bloomOpacity,
        pointerEvents: 'none',
      }} />

      {/* Shimmer sweep */}
      <div style={{
        position: 'absolute',
        top: '28%',
        left: shimmerX,
        width: 180,
        height: 240,
        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.28), rgba(139,92,246,0.18), transparent)',
        opacity: shimmerOpacity,
        transform: 'skewX(-10deg)',
        pointerEvents: 'none',
      }} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}>

        {/* Logo */}
        <div style={{
          opacity: logoOpacity,
          transform: `scale(${logoSpring})`,
          display: 'flex',
          alignItems: 'center',
          gap: 26,
          marginBottom: 0,
        }}>
          <div style={{
            width: 92,
            height: 92,
            borderRadius: 24,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            boxShadow: '0 0 70px rgba(99,102,241,0.55), 0 0 180px rgba(99,102,241,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="48" height="48" viewBox="0 0 46 46" fill="none">
              <rect x="4" y="4" width="38" height="29" rx="8" fill="white" fillOpacity="0.92" />
              <path d="M8 36L11 33H5L8 36Z" fill="white" fillOpacity="0.92" />
              <rect x="11" y="13" width="8" height="3" rx="1.5" fill="rgba(79,70,229,0.65)" />
              <rect x="22" y="13" width="13" height="3" rx="1.5" fill="rgba(79,70,229,0.65)" />
              <rect x="11" y="20" width="18" height="3" rx="1.5" fill="rgba(79,70,229,0.65)" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 60, fontWeight: 800, fontFamily: FONT, color: C.white, letterSpacing: -2, lineHeight: 1 }}>OmniChat</div>
            <div style={{ fontSize: 13, fontWeight: 500, fontFamily: FONT, color: 'rgba(255,255,255,0.32)', letterSpacing: 4.5, textTransform: 'uppercase', marginTop: 7 }}>Command Hub</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: 320,
          height: 1,
          background: `linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)`,
          marginTop: 50,
          marginBottom: 44,
          transform: `scaleX(${dividerScale})`,
          transformOrigin: 'center',
          opacity: logoOpacity,
        }} />

        {/* Tagline words */}
        <div style={{ display: 'flex', gap: 22 }}>
          {WORDS.map((w, i) => {
            const start = 82 + i * 12;
            const wOpacity = interpolate(frame, [start, start + 26], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            const wY = interpolate(frame, [start, start + 26], [22, 0], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutExpo,
            });
            return (
              <span key={w.text} style={{
                fontSize: 44,
                fontWeight: 700,
                fontFamily: FONT,
                letterSpacing: -1,
                color: w.color,
                opacity: wOpacity,
                transform: `translateY(${wY}px)`,
                display: 'inline-block',
              }}>
                {w.text}
              </span>
            );
          })}
        </div>

        {/* CTA badge */}
        <div style={{
          marginTop: 42,
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '11px 26px',
          borderRadius: 100,
          border: `1px solid rgba(99,102,241,0.3)`,
          background: 'rgba(99,102,241,0.08)',
        }}>
          <span style={{ fontSize: 15, fontWeight: 300, fontFamily: FONT, color: C.muted, letterSpacing: 0.2 }}>
            Le Command Hub pour dirigeants ambitieux
          </span>
        </div>

      </div>
    </AbsoluteFill>
  );
};
