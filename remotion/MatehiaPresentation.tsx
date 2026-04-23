import React from 'react';
import { AbsoluteFill, Series } from 'remotion';
import { Scene1Intro } from './scenes/Scene1Intro';
import { Scene2ValueProp } from './scenes/Scene2ValueProp';
import { Scene3Features } from './scenes/Scene3Features';
import { Scene4Outro } from './scenes/Scene4Outro';

// Total: 150 + 150 + 180 + 120 = 600 frames = 20s at 30fps
export const MatehiaPresentation: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#080808' }}>
      {/*
        Font loading: Inter from Google Fonts.
        In offline environments, falls back to Helvetica Neue / system-ui.
        Swap this import for a self-hosted font once design assets are provided.
      */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500&display=swap');
        * { -webkit-font-smoothing: antialiased; box-sizing: border-box; }
      `}</style>

      <Series>
        <Series.Sequence durationInFrames={150}>
          <Scene1Intro />
        </Series.Sequence>

        <Series.Sequence durationInFrames={150}>
          <Scene2ValueProp />
        </Series.Sequence>

        <Series.Sequence durationInFrames={180}>
          <Scene3Features />
        </Series.Sequence>

        <Series.Sequence durationInFrames={120}>
          <Scene4Outro />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
