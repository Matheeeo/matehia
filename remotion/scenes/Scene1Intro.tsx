import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../lib/colors';
import { easeOutExpo, easeOutCubic } from '../lib/easing';
import { ArcBackground } from '../components/ArcBackground';

const FONT = "'Inter', 'Helvetica Neue', -apple-system, sans-serif";

// OmniChat logo — blue/purple gradient square with chat icon
const OmniChatLogo: React.FC<{ scale: number; opacity: number }> = ({ scale, opacity }) => (
  <div style={{ opacity, transform: `scale(${scale})`, display: 'flex', alignItems: 'center', gap: 24 }}>
    {/* Logo square */}
    <div style={{
      width: 88,
      height: 88,
      borderRadius: 22,
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      boxShadow: '0 0 48px rgba(99,102,241,0.45), 0 0 120px rgba(99,102,241,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      {/* Chat icon SVG */}
      <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
        <rect x="4" y="4" width="38" height="29" rx="8" fill="white" fillOpacity="0.92" />
        <path d="M8 36L11 33H5L8 36Z" fill="white" fillOpacity="0.92" />
        <rect x="11" y="13" width="8" height="3" rx="1.5" fill="rgba(79,70,229,0.65)" />
        <rect x="22" y="13" width="13" height="3" rx="1.5" fill="rgba(79,70,229,0.65)" />
        <rect x="11" y="20" width="18" height="3" rx="1.5" fill="rgba(79,70,229,0.65)" />
      </svg>
    </div>

    {/* Text */}
    <div>
      <div style={{
        fontSize: 56,
        fontWeight: 800,
        fontFamily: FONT,
        color: C.white,
        letterSpacing: -1.5,
        lineHeight: 1,
      }}>
        OmniChat
      </div>
      <div style={{
        fontSize: 13,
        fontWeight: 500,
        fontFamily: FONT,
        color: 'rgba(255,255,255,0.38)',
        letterSpacing: 4.5,
        textTransform: 'uppercase',
        marginTop: 6,
      }}>
        Command Hub
      </div>
    </div>
  </div>
);

// 160 frames = 5.3s
export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOpacity = interpolate(frame, [0, 14, 144, 160], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Logo spring reveal: starts at frame 30
  const logoSpring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 18, stiffness: 160, mass: 0.9 },
    durationInFrames: 50,
  });

  const logoOpacity = interpolate(frame, [30, 52], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Vertical scan line: sweeps left→right frames 20–55
  const scanX = interpolate(frame, [20, 55], [-5, 105], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutExpo,
  });
  const scanOpacity = interpolate(frame, [20, 28, 50, 58], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Divider line under logo: frames 75–100
  const dividerScale = interpolate(frame, [75, 105], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });

  // Badge "by Luxee" or tagline: frames 95–125
  const taglineOpacity = interpolate(frame, [95, 122], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const taglineY = interpolate(frame, [95, 122], [14, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutExpo,
  });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOpacity }}>

      {/* Animated arc background — draws in from frame 5 */}
      <ArcBackground drawStart={5} drawDuration={90} />

      {/* Vertical scan line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: `${scanX}%`,
        width: 2,
        height: '100%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.6) 40%, rgba(139,92,246,0.6) 60%, transparent 100%)',
        filter: 'blur(1px)',
        opacity: scanOpacity,
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

        {/* Logo */}
        <OmniChatLogo scale={logoSpring} opacity={logoOpacity} />

        {/* Thin divider */}
        <div style={{
          width: 340,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${C.border}, transparent)`,
          marginTop: 44,
          transform: `scaleX(${dividerScale})`,
          transformOrigin: 'center',
        }} />

        {/* Bottom tagline */}
        <div style={{
          marginTop: 28,
          fontSize: 15,
          fontWeight: 300,
          fontFamily: FONT,
          color: C.muted,
          letterSpacing: 1,
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
        }}>
          Pilotez votre entreprise depuis un seul point de commande
        </div>

      </div>
    </AbsoluteFill>
  );
};
