import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../lib/colors';
import { easeOutExpo, easeInExpo, easeOutCubic } from '../lib/easing';
import { ArcBackground } from '../components/ArcBackground';

const FONT = "'Inter', 'Helvetica Neue', -apple-system, sans-serif";

const TAGLINE_WORDS = ['Pilotez.', 'Priorisez.', 'Exécutez.'];

// 90 frames = 3s
export const Scene4Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOpacity = interpolate(frame, [0, 16, 78, 90], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Arc glow builds up strongly: full intensity
  const arcOpacity = interpolate(frame, [0, 40], [0.4, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Purple bloom behind logo
  const bloomOpacity = interpolate(frame, [10, 55], [0, 0.8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });

  // Logo spring: frame 12
  const logoSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 20, stiffness: 180, mass: 0.8 },
    durationInFrames: 40,
  });
  const logoOpacity = interpolate(frame, [12, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Shimmer sweep across the OmniChat text: frames 30–62
  const shimmerX = interpolate(frame, [30, 62], [-220, 1100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeInExpo,
  });
  const shimmerOpacity = interpolate(frame, [30, 36, 58, 64], [0, 0.5, 0.5, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Tagline words: staggered from frame 45
  // CTA link: frame 64
  const ctaOpacity = interpolate(frame, [64, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ctaY = interpolate(frame, [64, 80], [12, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutExpo,
  });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOpacity }}>

      {/* Full arcs, fully drawn */}
      <ArcBackground drawStart={0} drawDuration={1} globalOpacity={arcOpacity} />

      {/* Purple bloom behind content */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -52%)',
        width: 900,
        height: 480,
        background: `radial-gradient(ellipse, ${C.purpleGlow} 0%, transparent 68%)`,
        opacity: bloomOpacity,
        pointerEvents: 'none',
      }} />

      {/* Shimmer overlay */}
      <div style={{
        position: 'absolute',
        top: '32%',
        left: shimmerX,
        width: 160,
        height: 200,
        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.25), rgba(139,92,246,0.15), transparent)',
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

        {/* Logo block */}
        <div style={{
          opacity: logoOpacity,
          transform: `scale(${logoSpring})`,
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          marginBottom: 52,
        }}>
          {/* Logo square */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            boxShadow: '0 0 56px rgba(99,102,241,0.5), 0 0 140px rgba(99,102,241,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="42" height="42" viewBox="0 0 46 46" fill="none">
              <rect x="4" y="4" width="38" height="29" rx="8" fill="white" fillOpacity="0.92" />
              <path d="M8 36L11 33H5L8 36Z" fill="white" fillOpacity="0.92" />
              <rect x="11" y="13" width="8" height="3" rx="1.5" fill="rgba(79,70,229,0.65)" />
              <rect x="22" y="13" width="13" height="3" rx="1.5" fill="rgba(79,70,229,0.65)" />
              <rect x="11" y="20" width="18" height="3" rx="1.5" fill="rgba(79,70,229,0.65)" />
            </svg>
          </div>
          <div>
            <div style={{
              fontSize: 52,
              fontWeight: 800,
              fontFamily: FONT,
              color: C.white,
              letterSpacing: -1.5,
              lineHeight: 1,
            }}>OmniChat</div>
            <div style={{
              fontSize: 12,
              fontWeight: 500,
              fontFamily: FONT,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: 4,
              textTransform: 'uppercase',
              marginTop: 5,
            }}>Command Hub</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: 280,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${C.borderLight}, transparent)`,
          marginBottom: 40,
          opacity: logoOpacity,
        }} />

        {/* Tagline — 3 words staggered */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 40 }}>
          {TAGLINE_WORDS.map((word, i) => {
            const start = 40 + i * 9;
            const wordOpacity = interpolate(frame, [start, start + 20], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            const wordY = interpolate(frame, [start, start + 20], [18, 0], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutExpo,
            });
            return (
              <span
                key={word}
                style={{
                  fontSize: 38,
                  fontWeight: 700,
                  fontFamily: FONT,
                  letterSpacing: -0.8,
                  color: i === 0 ? C.orange : i === 1 ? C.purple : C.white,
                  opacity: wordOpacity,
                  transform: `translateY(${wordY}px)`,
                  display: 'inline-block',
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 24px',
          borderRadius: 100,
          border: `1px solid ${C.borderLight}`,
          background: 'rgba(99,102,241,0.08)',
        }}>
          <span style={{ fontSize: 14, fontWeight: 400, fontFamily: FONT, color: C.muted, letterSpacing: 0.2 }}>
            Le Command Hub pour dirigeants ambitieux
          </span>
        </div>

      </div>
    </AbsoluteFill>
  );
};
