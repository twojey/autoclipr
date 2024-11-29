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
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const backgroundVideoRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [overlayDimensions, setOverlayDimensions] = useState({ width: 0, height: 0 });
  const videoUrlRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [justDragged, setJustDragged] = useState(false);

  // Position et échelle de la vidéo
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  // Constantes de zoom
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 3;
  const ZOOM_FACTOR = 0.08; // 8% de changement par cran
  const ZOOM_ANIMATION_DURATION = 0.1; // 100ms pour une animation fluide

  // Calcul des dimensions de l'overlay 9:16
  const calculateOverlayDimensions = useCallback(() => {
    if (!containerRef.current) return { width: 0, height: 0 };
    const container = containerRef.current;
    const containerHeight = container.clientHeight;
    const overlayHeight = containerHeight * 0.8;
    const overlayWidth = (overlayHeight * 9) / 16;
    return { width: overlayWidth, height: overlayHeight };
  }, []);

  // Mise à jour des dimensions lors du redimensionnement
  useEffect(() => {
    const updateDimensions = () => {
      setOverlayDimensions(calculateOverlayDimensions());
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [calculateOverlayDimensions]);

  // Création de l'URL de la vidéo
  useEffect(() => {
    if (videoFile) {
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = URL.createObjectURL(videoFile);
    }
    return () => {
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    };
  }, [videoFile]);

  // Ajustement initial de la vidéo
  useEffect(() => {
    if (!videoRef.current || !videoFile) return;

    const handleVideoLoad = () => {
      const video = videoRef.current;
      const container = containerRef.current;
      
      if (!video || !container || !video.videoWidth || !video.videoHeight) return;
      
      // On veut que la hauteur soit 80% de la hauteur du container
      const targetHeight = container.clientHeight * 0.8;
      const newScale = targetHeight / video.clientHeight;
      
      // Animation fluide vers la position initiale
      animate(scale, newScale, { duration: 0.3 });
      animate(x, 0, { duration: 0.3 });
      animate(y, 0, { duration: 0.3 });
    };

    videoRef.current.addEventListener('loadedmetadata', handleVideoLoad);
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', handleVideoLoad);
      }
    };
  }, [scale, x, y, videoFile]);

  // Synchronisation de la vidéo de fond
  useEffect(() => {
    const video = videoRef.current;
    const bgVideo = backgroundVideoRef.current;
    if (!video || !bgVideo) return;

    const syncVideos = () => {
      if (Math.abs(bgVideo.currentTime - video.currentTime) > 0.1) {
        bgVideo.currentTime = video.currentTime;
      }
    };

    video.addEventListener('timeupdate', syncVideos);
    return () => video.removeEventListener('timeupdate', syncVideos);
  }, []);

  // Gestion de la lecture vidéo
  useEffect(() => {
    const video = videoRef.current;
    const bgVideo = backgroundVideoRef.current;
    if (!video || !bgVideo) return;

    if (isPlaying) {
      video.play().catch(console.error);
      bgVideo.play().catch(console.error);
    } else {
      video.pause();
      bgVideo.pause();
    }
  }, [isPlaying]);

  // Synchronisation du temps
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !video.duration || !Number.isFinite(currentTime) || Math.abs(video.currentTime - currentTime) < 0.1) return;
    video.currentTime = currentTime;
  }, [currentTime]);

  // Gestion du zoom
  const handleZoom = useCallback((direction) => {
    const currentScale = scale.get();
    const zoomFactor = direction === 'in' ? (1 + ZOOM_FACTOR) : (1 - ZOOM_FACTOR);
    const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentScale * zoomFactor));
    
    // Animation rapide avec spring pour plus de fluidité
    animate(scale, newScale, {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.5,
      velocity: 100
    });
  }, [scale]);

  // Gestion du zoom à la molette
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastWheelTime = 0;
    const WHEEL_TIMEOUT = 50; // 50ms entre chaque événement de molette

    const wheelHandler = (e) => {
      if (!isHovering) return;
      e.preventDefault();

      const now = Date.now();
      if (now - lastWheelTime < WHEEL_TIMEOUT) return;
      lastWheelTime = now;

      const direction = e.deltaY < 0 ? 'in' : 'out';
      handleZoom(direction);
    };

    container.addEventListener('wheel', wheelHandler, { passive: false });
    return () => container.removeEventListener('wheel', wheelHandler);
  }, [handleZoom, isHovering]);

  // Ajustement vertical (même hauteur que l'overlay 9:16)
  const handleVerticalFit = useCallback(() => {
    if (!videoRef.current || !overlayRef.current) return;
    
    const video = videoRef.current;
    const overlay = overlayRef.current;
    
    // Ajuste la hauteur de la vidéo à celle de l'overlay
    const newScale = overlay.clientHeight / video.clientHeight;
    
    // Respect des limites de zoom
    const boundedScale = Math.min(Math.max(newScale, MIN_ZOOM), MAX_ZOOM);
    
    // Animation fluide et recentrage vertical
    animate(scale, boundedScale, { duration: 0.3 });
    animate(y, 0, { duration: 0.3 }); // Recentre verticalement
  }, [scale, y]);

  // Ajustement horizontal (même largeur que l'overlay 9:16)
  const handleHorizontalFit = useCallback(() => {
    if (!videoRef.current || !overlayRef.current) return;
    
    const video = videoRef.current;
    const overlay = overlayRef.current;
    
    // Ajuste la largeur de la vidéo à celle de l'overlay
    const newScale = overlay.clientWidth / video.clientWidth;
    
    // Respect des limites de zoom
    const boundedScale = Math.min(Math.max(newScale, MIN_ZOOM), MAX_ZOOM);
    
    // Animation fluide et recentrage horizontal
    animate(scale, boundedScale, { duration: 0.3 });
    animate(x, 0, { duration: 0.3 }); // Recentre horizontalement
  }, [scale, x]);

  // Gestion de la barre d'espace
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        onTogglePlay?.();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onTogglePlay]);

  // État pour suivre si on est en train de drag
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setJustDragged(true);
    // Reset le flag après un court délai
    setTimeout(() => setJustDragged(false), 100);
  };

  const handleVideoClick = (e) => {
    if (!justDragged) {
      onTogglePlay?.(e);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full overflow-hidden transition-colors duration-200 ${isDragging ? 'bg-black' : 'bg-gray-900'}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Vidéo de fond floutée */}
      <div className={`absolute inset-0 transition-opacity duration-200 ${isDragging ? 'opacity-0' : 'opacity-50'}`}>
        <video
          ref={backgroundVideoRef}
          src={videoUrlRef.current}
          className="w-full h-full object-cover scale-110"
          style={{
            filter: 'blur(16px)',
          }}
          muted
          playsInline
        />
      </div>

      {/* Vidéo draggable */}
      <motion.video
        ref={videoRef}
        src={videoUrlRef.current}
        className="absolute w-full h-full origin-center cursor-move object-contain"
        style={{
          x,
          y,
          scale,
        }}
        drag
        dragTransition={{ 
          power: 0.3,
          timeConstant: 200,
          modifyTarget: target => Math.round(target)
        }}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTimeUpdate={(e) => onTimeUpdate?.(e.target.currentTime)}
        onDurationChange={(e) => onDurationChange?.(e.target.duration)}
        playsInline
        onClick={handleVideoClick}
      />

      {/* Bouton play/pause au hover */}
      {isHovering && !isDragging && (
        <div 
          className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${
            isHovering && !isDragging ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div 
            className="p-4 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/60 transition-colors cursor-pointer pointer-events-auto"
            onClick={handleVideoClick}
          >
            {isPlaying ? (
              <PauseIcon className="w-12 h-12 text-white" />
            ) : (
              <PlayIcon className="w-12 h-12 text-white" />
            )}
          </div>
        </div>
      )}

      {/* Overlay 9:16 */}
      <div 
        ref={overlayRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white/30 pointer-events-none"
        style={{
          width: overlayDimensions.width,
          height: overlayDimensions.height,
        }}
      >
        {/* Grille 3x3 */}
        <div className={`absolute inset-0 transition-opacity duration-200
          ${isDragging ? 'opacity-100' : 'opacity-0'}`}>
          {/* Lignes verticales */}
          <div className="absolute left-1/3 top-0 w-[2px] h-full bg-white/50 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
          <div className="absolute left-2/3 top-0 w-[2px] h-full bg-white/50 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
          
          {/* Lignes horizontales */}
          <div className="absolute top-1/3 left-0 h-[2px] w-full bg-white/50 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
          <div className="absolute top-2/3 left-0 h-[2px] w-full bg-white/50 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        </div>
      </div>

      {/* Barre de contrôle de taille */}
      <div className="absolute left-8 bottom-4 bg-black/50 rounded-lg backdrop-blur-sm p-2 flex gap-2">
        <button
          onClick={handleVerticalFit}
          className="p-2 rounded hover:bg-white/10 transition-colors"
          title="Ajuster à la hauteur de l'overlay"
        >
          <ArrowsUpDownIcon className="w-6 h-6 text-white" />
        </button>
        
        <button
          onClick={handleHorizontalFit}
          className="p-2 rounded hover:bg-white/10 transition-colors"
          title="Ajuster à la largeur de l'overlay"
        >
          <ArrowsRightLeftIcon className="w-6 h-6 text-white" />
        </button>

        <div className="w-px h-6 bg-white/20 my-2" />

        <button
          onClick={() => handleZoom('in')}
          className="p-2 rounded hover:bg-white/10 transition-colors relative"
          title="Zoom +"
        >
          <MagnifyingGlassIcon className="w-6 h-6 text-white" />
          <span className="absolute text-white font-bold text-sm right-1 bottom-1">+</span>
        </button>

        <button
          onClick={() => handleZoom('out')}
          className="p-2 rounded hover:bg-white/10 transition-colors relative"
          title="Zoom -"
        >
          <MagnifyingGlassIcon className="w-6 h-6 text-white" />
          <span className="absolute text-white font-bold text-sm right-1 bottom-1">-</span>
        </button>
      </div>
    </div>
  );
};
