import React, { useEffect, useRef, useState, useCallback } from 'react';

const VideoCanvas = ({
  videoRef,
  isPlaying,
  currentTime,
  onTimeUpdate,
  onDurationChange,
  scale = 1,
  position = { x: 0, y: 0 },
  src,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);
  const frameId = useRef(null);
  const lastUpdateTime = useRef(0);

  // Optimisation du chargement de la vidéo
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setIsLoaded(false);
    video.src = src;
    video.preload = "auto";

    const handleCanPlay = () => {
      setIsLoaded(true);
      onDurationChange(video.duration);
    };

    video.addEventListener('canplay', handleCanPlay);
    
    // Optimisations de performance
    video.addEventListener('loadedmetadata', () => {
      video.width = video.videoWidth;
      video.height = video.videoHeight;
    });

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
    };
  }, [src, videoRef, onDurationChange]);

  // Gestion optimisée de la lecture/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLoaded) return;

    const playVideo = async () => {
      if (isPlaying) {
        try {
          // Utiliser une promesse pour la lecture
          const playPromise = video.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Error playing video:', error);
          }
        }
      } else {
        video.pause();
      }
    };

    playVideo();
  }, [isPlaying, isLoaded]);

  // Gestion optimisée du currentTime
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLoaded || Math.abs(video.currentTime - currentTime) < 0.1) return;
    video.currentTime = currentTime;
  }, [currentTime, isLoaded]);

  // Utilisation de requestAnimationFrame pour les mises à jour de temps
  const updateTime = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;

    const now = performance.now();
    if (now - lastUpdateTime.current >= 32) { // ~30fps
      onTimeUpdate(video.currentTime);
      lastUpdateTime.current = now;
    }

    frameId.current = requestAnimationFrame(updateTime);
  }, [isPlaying, onTimeUpdate]);

  // Gestion optimisée des mises à jour de temps
  useEffect(() => {
    if (isPlaying) {
      frameId.current = requestAnimationFrame(updateTime);
    } else if (frameId.current) {
      cancelAnimationFrame(frameId.current);
    }

    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
    };
  }, [isPlaying, updateTime]);

  return (
    <div ref={containerRef} className="relative w-full aspect-video bg-gray-900 overflow-hidden">
      {/* Container vidéo avec optimisations */}
      <div className="absolute inset-0 flex items-center justify-center">
        <video
          ref={videoRef}
          className="absolute w-full h-full object-cover"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale3d(${scale}, ${scale}, 1)`,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          playsInline
          preload="auto"
        />
      </div>

      {/* Overlay 9:16 centré */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="border-2 border-white/30 z-10"
          style={{
            height: '80%',
            width: `${(9/16) * 80}vh`,
            aspectRatio: '9/16',
          }}
        />
      </div>
    </div>
  );
};

export default VideoCanvas;
