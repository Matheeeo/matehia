import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { easeOutCubic } from '../lib/easing';

// Center positioned outside viewport (lower-right) to create partial arc effect
const CX = 1420;
const CY = 1240;
const NUM_ARCS = 15;
const R_START = 160;
const R_STEP = 108;

interface Props {
  drawStart?: number;
  drawDuration?: number;
  globalOpacity?: number;
}

export const ArcBackground: React.FC<Props> = ({
  drawStart = 0,
  drawDuration = 80,
  globalOpacity = 1,
}) => {
  const frame = useCurrentFrame();

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: globalOpacity,
        pointerEvents: 'none',
      }}
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Soft aurora glow — purple centered lower-right */}
        <radialGradient id="aurora" cx="74%" cy="82%" r="60%">
          <stop offset="0%" stopColor="rgba(99,102,241,0.14)" />
          <stop offset="40%" stopColor="rgba(79,46,221,0.06)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>

        {/* Secondary cool glow upper-left */}
        <radialGradient id="aurora2" cx="18%" cy="22%" r="45%">
          <stop offset="0%" stopColor="rgba(139,92,246,0.06)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* Aurora fills */}
      <rect width="1920" height="1080" fill="url(#aurora)" />
      <rect width="1920" height="1080" fill="url(#aurora2)" />

      {/* Concentric arcs — draw-in staggered */}
      {Array.from({ length: NUM_ARCS }, (_, i) => {
        const r = R_START + i * R_STEP;
        const circumference = 2 * Math.PI * r;

        // Each arc starts drawing slightly after the previous
        const arcStart = drawStart + (i * drawDuration) / NUM_ARCS;
        const arcEnd = arcStart + drawDuration * 0.45;

        const progress = interpolate(frame, [arcStart, arcEnd], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easeOutCubic,
        });

        const dashOffset = circumference * (1 - progress);
        // Closer rings slightly more opaque
        const strokeOpacity = Math.max(0.018, 0.16 - i * 0.009);

        return (
          <circle
            key={i}
            cx={CX}
            cy={CY}
            r={r}
            fill="none"
            stroke={`rgba(190,195,228,${strokeOpacity})`}
            strokeWidth={1.1}
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${dashOffset}`}
          />
        );
      })}
    </svg>
  );
};
