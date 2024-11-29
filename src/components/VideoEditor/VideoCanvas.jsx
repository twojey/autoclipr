import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/solid';
import { Button } from '../ui/Button';

export const VideoCanvas = ({ 
  videoFile,
  isPlaying,
  currentTime,
  onTimeUpdate,
  onDurationChange,
  onTogglePlay
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameId = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Chargement de la vidéo
  useEffect(() => {
    if (!videoRef.current || !videoFile) return;

    const video = videoRef.current;
    const videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;
    video.volume = 1;
    
    const handleLoadedMetadata = () => {
      setIsVideoReady(true);
      onDurationChange(video.duration);
      video.currentTime = 0;
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      URL.revokeObjectURL(videoUrl);
    };
  }, [videoFile, onDurationChange]);

  // Gestion de la lecture/pause
  useEffect(() => {
    if (!videoRef.current || !isVideoReady) return;

    if (isPlaying) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, isVideoReady]);

  // Mise à jour du temps actuel
  useEffect(() => {
    if (!videoRef.current || !isVideoReady) return;
    
    if (Math.abs(videoRef.current.currentTime - currentTime) > 0.1) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime, isVideoReady]);

  // Rendu du canvas
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !isVideoReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const render = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      frameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
    };
  }, [isVideoReady]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="hidden"
        onTimeUpdate={(e) => onTimeUpdate(e.target.currentTime)}
        muted={false}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        onClick={onTogglePlay}
      />
    </div>
  );
};
