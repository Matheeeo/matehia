import React from 'react';
import { AbsoluteFill, Series } from 'remotion';
import { Scene1Intro } from './scenes/Scene1Intro';
import { Scene2ValueProp } from './scenes/Scene2ValueProp';
import { Scene3Features } from './scenes/Scene3Features';
import { Scene4Outro } from './scenes/Scene4Outro';

// Total: 160 + 170 + 180 + 90 = 600 frames = 20s @ 30fps
export const MatehiaPresentation: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#0c0c1a' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&display=swap');
        * { -webkit-font-smoothing: antialiased; box-sizing: border-box; }
      `}</style>

      <Series>
        {/* 5.3s — Logo OmniChat + arcs concentriques */}
        <Series.Sequence durationInFrames={160}>
          <Scene1Intro />
        </Series.Sequence>

        {/* 5.7s — Hero headline mot par mot + command bar + tuiles */}
        <Series.Sequence durationInFrames={170}>
          <Scene2ValueProp />
        </Series.Sequence>

        {/* 6s — Spotlight par feature (Messageries / Actions / Aujourd'hui) */}
        <Series.Sequence durationInFrames={180}>
          <Scene3Features />
        </Series.Sequence>

        {/* 3s — Outro shimmer + "Pilotez. Priorisez. Exécutez." */}
        <Series.Sequence durationInFrames={90}>
          <Scene4Outro />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
