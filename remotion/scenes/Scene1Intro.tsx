import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../lib/colors';
import { easeOutExpo, easeOutCubic } from '../lib/easing';
import { ArcBackground } from '../components/ArcBackground';

const FONT = "'Inter', 'Helvetica Neue', -apple-system, sans-serif";
const LETTERS = 'OMNICHAT'.split('');

const OmniChatLogo: React.FC<{ scale: number; opacity: number }> = ({ scale, opacity }) => (
  <div style={{ opacity, transform: `scale(${scale})`, display: 'flex', alignItems: 'center', gap: 28 }}>
    <div style={{
      width: 100,
      height: 100,
      borderRadius: 26,
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      boxShadow: '0 0 60px rgba(99,102,241,0.5), 0 0 160px rgba(99,102,241,0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width="52" height="52" viewBox="0 0 46 46" fill="none">
        <rect x="4" y="4" width="38" height="29" rx="8" fill="white" fillOpacity="0.92" />
        <path d="M8 36L11 33H5L8 36Z" fill="white" fillOpacity="0.92" />
        <rect x="11" y="13" width="8" height="3" rx="1.5" fill="rgba(79,70,229,0.65)" />
        <rect x="22" y="13" width="13" height="3" rx="1.5" fill="rgba(79,70,229,0.65)" />
        <rect x="11" y="20" width="18" height="3" rx="1.5" fill="rgba(79,70,229,0.65)" />
      </svg>
    </div>
    <div>
      <div style={{
        fontSize: 62,
        fontWeight: 800,
        fontFamily: FONT,
        color: C.white,
        letterSpacing: -2,
        lineHeight: 1,
      }}>
        OmniChat
      </div>
      <div style={{
        fontSize: 13,
        fontWeight: 500,
        fontFamily: FONT,
        color: 'rgba(255,255,255,0.35)',
        letterSpacing: 5,
        textTransform: 'uppercase',
        marginTop: 8,
      }}>
        Command Hub
      </div>
    </div>
  </div>
);

// 210 frames = 7s
export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOpacity = interpolate(frame, [0, 18, 192, 210], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Logo spring reveal: frame 45
  const logoSpring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 22, stiffness: 130, mass: 1.1 },
    durationInFrames: 60,
  });
  const logoOpacity = interpolate(frame, [45, 72], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scan line: frames 28–75
  const scanX = interpolate(frame, [28, 75], [-5, 105], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutExpo,
  });
  const scanOpacity = interpolate(frame, [28, 38, 65, 78], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Divider line: frames 105–138
  const dividerScale = interpolate(frame, [105, 140], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });

  // Tagline: frames 130–165
  const taglineOpacity = interpolate(frame, [130, 165], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const taglineY = interpolate(frame, [130, 165], [18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutExpo,
  });

  // Subtle badge "by Luxee": frames 160–185
  const badgeOpacity = interpolate(frame, [160, 185], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOpacity }}>
      <ArcBackground drawStart={5} drawDuration={110} />

      {/* Scan line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: `${scanX}%`,
        width: 2,
        height: '100%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.7) 40%, rgba(139,92,246,0.7) 60%, transparent 100%)',
        filter: 'blur(1px)',
        opacity: scanOpacity,
        pointerEvents: 'none',
      }} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}>
        <OmniChatLogo scale={logoSpring} opacity={logoOpacity} />

        {/* Divider */}
        <div style={{
          width: 380,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${C.borderLight}, transparent)`,
          marginTop: 52,
          transform: `scaleX(${dividerScale})`,
          transformOrigin: 'center',
        }} />

        {/* Tagline */}
        <div style={{
          marginTop: 32,
          fontSize: 17,
          fontWeight: 300,
          fontFamily: FONT,
          color: C.muted,
          letterSpacing: 0.8,
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          textAlign: 'center',
        }}>
          Pilotez votre entreprise depuis un seul point de commande
        </div>

        {/* Badge */}
        <div style={{
          marginTop: 24,
          opacity: badgeOpacity,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '6px 16px',
          borderRadius: 100,
          border: `1px solid rgba(99,102,241,0.25)`,
          background: 'rgba(99,102,241,0.07)',
        }}>
          <span style={{ fontSize: 10, fontWeight: 600, fontFamily: FONT, color: C.purple, letterSpacing: 3, textTransform: 'uppercase' }}>
            ⚡ Luxee Command Center
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
