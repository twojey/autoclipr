import React from 'react';
import { AbsoluteFill } from 'remotion';

export const RemotionVideo = {
  '720p': {
    width: 1280,
    height: 720,
    fps: 30,
  },
  '1080p': {
    width: 1920,
    height: 1080,
    fps: 30,
  },
  '2k': {
    width: 2560,
    height: 1440,
    fps: 30,
  },
};

export const RemotionComposition = ({
  videoSrc,
  startTime,
  endTime,
  scale,
  position,
}) => {
  return (
    <AbsoluteFill>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'black',
        }}
      >
        <video
          src={videoSrc}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
