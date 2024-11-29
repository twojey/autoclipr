import React from 'react';
import {AbsoluteFill} from 'remotion';

export const HelloWorld: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1>Hello Remotion!</h1>
    </AbsoluteFill>
  );
};
