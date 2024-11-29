import React, { useRef, useEffect } from 'react';

interface VideoProps {
  videoSrc: string;
  startTime: number;
  endTime: number;
  onTimeUpdate?: (currentTime: number) => void;
}

export const VideoComponent: React.FC<VideoProps> = ({ 
  videoSrc, 
  startTime, 
  endTime,
  onTimeUpdate 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = startTime;

    const handleTimeUpdate = () => {
      if (video.currentTime >= endTime) {
        video.pause();
        video.currentTime = endTime;
      }
      onTimeUpdate?.(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [startTime, endTime, onTimeUpdate]);

  return (
    <video
      ref={videoRef}
      src={videoSrc}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
      controls
    />
  );
};

export default VideoComponent;
