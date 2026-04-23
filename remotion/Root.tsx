import React from 'react';
import { Composition } from 'remotion';
import { MatehiaPresentation } from './MatehiaPresentation';

export const Root: React.FC = () => {
  return (
    <Composition
      id="MatehiaPresentation"
      component={MatehiaPresentation}
      durationInFrames={960}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
