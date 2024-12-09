import React, { useRef, useState, useCallback, useEffect } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  MagnifyingGlassMinusIcon, 
  MagnifyingGlassPlusIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/solid';
import { Button } from '../ui/Button';

// Constants
const INITIAL_CUT_DURATION = 30; // 30 seconds
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 10; // Augmenté de 4 à 10
const ZOOM_STEP = 1.2; // Augmenté de 0.5 à 1.2
const MIN_CLIP_DURATION = 3; // Minimum duration in seconds
const MIN_THUMB_WIDTH = 50; // Largeur minimale de l'ascenseur en pixels

// Types
type HandleType = 'start' | 'end' | null;

interface DragStartPosition {
  x: number;
  cutStart: number;
  cutEnd: number;
}

interface ScrollStartPosition {
  x: number;
  scrollPos: number;
}

interface VideoTimelineProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isMuted: boolean;
  onTimeUpdate: (time: number) => void;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  cutStart?: number;
  cutEnd?: number;
  onCutStartChange?: (time: number) => void;
  onCutEndChange?: (time: number) => void;
}

// Utility function to format time (seconds -> MM:SS)
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const VideoTimeline: React.FC<VideoTimelineProps> = ({
  currentTime,
  duration,
  isPlaying,
  isMuted,
  onTimeUpdate,
  onTogglePlay,
  onToggleMute,
  cutStart = 0,
  cutEnd = Math.min(INITIAL_CUT_DURATION, duration),
  onCutStartChange,
  onCutEndChange
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDraggingHandle, setIsDraggingHandle] = useState<HandleType>(null);
  const [isDraggingZone, setIsDraggingZone] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const [previousPlayState, setPreviousPlayState] = useState(false);
  const dragStartPos = useRef<DragStartPosition | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  // State for scrollbar dragging
  const [isDraggingScroll, setIsDraggingScroll] = useState(false);
  const scrollStartPos = useRef<ScrollStartPosition | null>(null);

  // Calculate total zoomed width of timeline
  const getZoomedWidth = useCallback((): number => {
    if (!timelineRef.current) return 0;
    return timelineRef.current.clientWidth * timeScale;
  }, [timeScale]);

  // Calculate visible width
  const getViewportWidth = useCallback((): number => {
    if (!timelineRef.current) return 0;
    return timelineRef.current.clientWidth;
  }, []);

  // Calculate maximum scroll position
  const getMaxScroll = useCallback((): number => {
    return Math.max(0, getZoomedWidth() - getViewportWidth());
  }, [getZoomedWidth, getViewportWidth]);

  // Handle scrolling
  const handleScroll = useCallback((newPosition: number) => {
    const maxScroll = getMaxScroll();
    const clampedPosition = Math.max(0, Math.min(newPosition, maxScroll));
    setScrollPosition(clampedPosition);
  }, [getMaxScroll]);

  // Handle scroll track click
  const handleScrollTrackClick = useCallback((e: React.MouseEvent) => {
    if (!scrollTrackRef.current) return;
    
    const rect = scrollTrackRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const trackWidth = rect.width;
    
    // Calculer la position relative en tenant compte de la largeur de l'ascenseur
    const thumbWidth = (scrollbarWidth / 100) * trackWidth;
    const availableTrackWidth = trackWidth - thumbWidth;
    const relativePosition = Math.max(0, Math.min(clickPosition - (thumbWidth / 2), availableTrackWidth));
    
    // Convertir en position de défilement
    const scrollRatio = relativePosition / availableTrackWidth;
    const newScrollPosition = scrollRatio * getMaxScroll();
    
    handleScroll(newScrollPosition);
  }, [scrollbarWidth, getMaxScroll, handleScroll]);

  // Handle scroll thumb dragging
  const handleScrollMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingScroll(true);
    scrollStartPos.current = {
      x: e.clientX,
      scrollPos: scrollPosition
    };
  }, [scrollPosition]);

  const handleScrollMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingScroll || !scrollStartPos.current || !scrollTrackRef.current) return;

    const rect = scrollTrackRef.current.getBoundingClientRect();
    const deltaX = e.clientX - scrollStartPos.current.x;
    const trackWidth = rect.width;
    
    // Calculer la largeur disponible en tenant compte de la largeur de l'ascenseur
    const thumbWidth = (scrollbarWidth / 100) * trackWidth;
    const availableTrackWidth = trackWidth - thumbWidth;
    
    // Calculer le ratio de défilement en tenant compte des limites
    const scrollRatio = deltaX / availableTrackWidth;
    const scrollDelta = scrollRatio * getMaxScroll();
    const newPosition = Math.max(0, Math.min(
      scrollStartPos.current.scrollPos + scrollDelta,
      getMaxScroll()
    ));
    
    handleScroll(newPosition);
  }, [isDraggingScroll, scrollbarWidth, getMaxScroll, handleScroll]);

  const handleScrollMouseUp = useCallback(() => {
    if (isDraggingScroll) {
      setIsDraggingScroll(false);
      scrollStartPos.current = null;
    }
  }, [isDraggingScroll]);

  // Handle zooming
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setTimeScale(prevScale => {
      const newScale = direction === 'in' 
        ? Math.min(prevScale + ZOOM_STEP, MAX_ZOOM)
        : Math.max(prevScale - ZOOM_STEP, MIN_ZOOM);

      // Calculer la nouvelle position de défilement pour centrer sur la tête de lecture
      if (timelineRef.current) {
        const timelineWidth = timelineRef.current.clientWidth;
        const currentPixelPosition = (currentTime / duration) * timelineWidth;
        
        // Position actuelle relative à la vue
        const currentViewPosition = currentPixelPosition * prevScale - scrollPosition;
        
        // Position souhaitée (centrée) dans la nouvelle échelle
        const targetPixelPosition = currentPixelPosition * newScale;
        const targetScrollPosition = targetPixelPosition - (timelineWidth / 2);
        
        // Mettre à jour la position de défilement
        requestAnimationFrame(() => {
          handleScroll(Math.max(0, targetScrollPosition));
        });
      }

      return newScale;
    });
  }, [currentTime, duration, scrollPosition, handleScroll]);

  // Handle horizontal scroll
  const handleWheel = useCallback((e: WheelEvent) => {
    if (timeScale <= 1) return;

    e.preventDefault();
    
    if (e.shiftKey || Math.abs(e.deltaX) > 0) {
      const scrollAmount = e.deltaX || e.deltaY;
      handleScroll(scrollPosition + scrollAmount * 0.5);
    } else {
      // Pour le zoom avec la molette, on centre toujours sur la tête de lecture
      const zoomDirection = e.deltaY > 0 ? 'out' : 'in';
      handleZoom(zoomDirection);
    }
  }, [timeScale, scrollPosition, handleScroll, handleZoom]);

  // Time <-> Pixels conversion with scale
  const timeToPixels = useCallback((time: number): number => {
    if (!timelineRef.current || !duration) return 0;
    const width = timelineRef.current.clientWidth;
    return (time / duration) * width * timeScale - scrollPosition;
  }, [duration, timeScale, scrollPosition]);

  const pixelsToTime = useCallback((pixels: number): number => {
    if (!timelineRef.current || !duration) return 0;
    const width = timelineRef.current.clientWidth;
    return ((pixels + scrollPosition) / width / timeScale) * duration;
  }, [duration, timeScale, scrollPosition]);

  // Handle timeline boundaries
  const handleHandleMouseDown = useCallback((e: React.MouseEvent, handle: HandleType) => {
    e.stopPropagation();
    setIsDraggingHandle(handle);
    setPreviousPlayState(isPlaying);
    if (isPlaying) onTogglePlay();
  }, [isPlaying, onTogglePlay]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingHandle || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const currentTime = pixelsToTime(x);

    if (isDraggingHandle === 'start') {
      const newStart = Math.max(0, Math.min(currentTime, cutEnd - MIN_CLIP_DURATION));
      onCutStartChange?.(newStart);
      onTimeUpdate(newStart);
    } else if (isDraggingHandle === 'end') {
      const newEnd = Math.min(duration, Math.max(currentTime, cutStart + MIN_CLIP_DURATION));
      onCutEndChange?.(newEnd);
      if (currentTime <= duration) {
        onTimeUpdate(newEnd);
      }
    }
  }, [isDraggingHandle, pixelsToTime, cutStart, cutEnd, duration, onCutStartChange, onCutEndChange, onTimeUpdate]);

  const handleMouseUp = useCallback(() => {
    if (isDraggingHandle) {
      setIsDraggingHandle(null);
      if (previousPlayState) onTogglePlay();
    }
  }, [isDraggingHandle, previousPlayState, onTogglePlay]);

  // Handle zone dragging
  const handleZoneMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingZone(true);
    setPreviousPlayState(isPlaying);
    if (isPlaying) onTogglePlay();
    dragStartPos.current = {
      x: e.clientX,
      cutStart,
      cutEnd
    };
  }, [isPlaying, onTogglePlay, cutStart, cutEnd]);

  const handleZoneMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingZone || !dragStartPos.current || !timelineRef.current) return;

    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaTime = pixelsToTime(deltaX) - pixelsToTime(0);
    
    const zoneDuration = cutEnd - cutStart;
    let newStart = dragStartPos.current.cutStart + deltaTime;
    let newEnd = dragStartPos.current.cutEnd + deltaTime;

    if (newStart < 0) {
      newStart = 0;
      newEnd = zoneDuration;
    }
    if (newEnd > duration) {
      newEnd = duration;
      newStart = duration - zoneDuration;
    }

    onCutStartChange?.(newStart);
    onCutEndChange?.(newEnd);
    onTimeUpdate(newStart);
  }, [isDraggingZone, pixelsToTime, duration, onCutStartChange, onCutEndChange, onTimeUpdate]);

  const handleZoneMouseUp = useCallback(() => {
    if (isDraggingZone) {
      setIsDraggingZone(false);
      if (previousPlayState) onTogglePlay();
      dragStartPos.current = null;
    }
  }, [isDraggingZone, previousPlayState, onTogglePlay, onTimeUpdate]);

  // Handle timeline click
  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (isDraggingHandle || isDraggingZone || isDraggingScroll) return;

    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const clickTime = pixelsToTime(x);

    if (clickTime >= cutStart && clickTime <= cutEnd) {
      onTimeUpdate(clickTime);
      return;
    }

    const cutDuration = Math.max(MIN_CLIP_DURATION, cutEnd - cutStart);
    const newStart = Math.max(0, Math.min(clickTime - cutDuration / 2, duration - cutDuration));
    const newEnd = newStart + cutDuration;
    
    onCutStartChange?.(newStart);
    onCutEndChange?.(newEnd);
    onTimeUpdate(newStart);
  }, [isDraggingHandle, isDraggingZone, isDraggingScroll, pixelsToTime, cutStart, cutEnd, duration, onCutStartChange, onCutEndChange, onTimeUpdate]);

  // Event listeners setup
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMouseMove(e);
      handleZoneMouseMove(e);
      handleScrollMouseMove(e);
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
      handleZoneMouseUp();
      handleScrollMouseUp();
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleMouseMove, handleZoneMouseMove, handleScrollMouseMove, handleMouseUp, handleZoneMouseUp, handleScrollMouseUp]);

  // Handle wheel events
  useEffect(() => {
    const timelineElement = timelineRef.current;
    if (!timelineElement) return;

    const preventHorizontalScroll = (e: WheelEvent) => {
      if (timeScale <= 1) return;
      if (e.shiftKey || Math.abs(e.deltaX) > 0) {
        e.preventDefault();
      }
    };

    timelineElement.addEventListener('wheel', handleWheel, { passive: false });
    timelineElement.addEventListener('wheel', preventHorizontalScroll, { passive: false });
    
    return () => {
      timelineElement.removeEventListener('wheel', handleWheel);
      timelineElement.removeEventListener('wheel', preventHorizontalScroll);
    };
  }, [timeScale, handleWheel]);

  // Handle playback loop and constraints
  useEffect(() => {
    if (currentTime < cutStart) {
      onTimeUpdate(cutStart);
    } else if (currentTime >= cutEnd) {
      if (isPlaying) {
        onTimeUpdate(cutStart);
      } else {
        onTimeUpdate(cutEnd);
      }
    }
  }, [currentTime, cutStart, cutEnd, isPlaying, onTimeUpdate]);

  // Calcul de la largeur de l'ascenseur
  const calculateScrollbarWidth = useCallback(() => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.clientWidth;
    const viewportRatio = getViewportWidth() / getZoomedWidth();
    const calculatedWidth = containerWidth * viewportRatio;
    
    // Assurer une largeur minimale pour l'ascenseur
    const finalWidth = Math.max(MIN_THUMB_WIDTH, calculatedWidth);
    const widthPercentage = (finalWidth / containerWidth) * 100;
    
    setScrollbarWidth(Math.min(100, widthPercentage));
  }, [getViewportWidth, getZoomedWidth]);

  // Mise à jour de la largeur lors du redimensionnement
  useEffect(() => {
    calculateScrollbarWidth();
    
    const observer = new ResizeObserver(() => {
      calculateScrollbarWidth();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [calculateScrollbarWidth]);

  // Mise à jour de la largeur lors du zoom
  useEffect(() => {
    calculateScrollbarWidth();
  }, [timeScale, calculateScrollbarWidth]);

  // Calcul de la position de l'ascenseur avec contraintes
  const getScrollThumbPosition = useCallback(() => {
    const maxScroll = getMaxScroll();
    if (maxScroll === 0) return 0;
    
    // Calculer la position en pourcentage
    const rawPosition = (scrollPosition / maxScroll) * 100;
    
    // Calculer la position maximale en tenant compte de la largeur de l'ascenseur
    const maxPosition = 100 - scrollbarWidth;
    
    // Limiter la position entre 0 et la position maximale
    return Math.max(0, Math.min(rawPosition, maxPosition));
  }, [scrollPosition, getMaxScroll, scrollbarWidth]);

  // Gestionnaire pour le bouton mute/unmute
  const handleMuteToggle = useCallback(() => {
    onToggleMute();
  }, [onToggleMute]);

  return (
    <div ref={containerRef} className="flex flex-col w-full gap-2 p-4 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-lg border border-white/10 dark:border-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <PauseIcon className="w-4 h-4" />
            ) : (
              <PlayIcon className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMuteToggle}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <SpeakerXMarkIcon className="w-4 h-4" />
            ) : (
              <SpeakerWaveIcon className="w-4 h-4" />
            )}
          </Button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Sélection: {formatTime(cutEnd - cutStart)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleZoom('out')}
            disabled={timeScale <= MIN_ZOOM}
            aria-label="Zoom out"
          >
            <MagnifyingGlassMinusIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleZoom('in')}
            disabled={timeScale >= MAX_ZOOM}
            aria-label="Zoom in"
          >
            <MagnifyingGlassPlusIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="relative w-full h-20 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
        <div
          ref={timelineRef}
          className="absolute inset-0"
          onClick={handleTimelineClick}
          style={{
            cursor: isDraggingHandle || isDraggingZone ? 'grabbing' : 'pointer'
          }}
        >
          {/* Timeline markers */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: Math.ceil(duration) }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-px h-full bg-gray-400/20 dark:bg-gray-600/20"
                style={{
                  transform: `translateX(${timeToPixels(i)}px)`
                }}
              />
            ))}
          </div>

          {/* Cut zone */}
          <div
            className="absolute h-full bg-primary-500/20 dark:bg-primary-400/20"
            style={{
              left: `${timeToPixels(cutStart)}px`,
              width: `${timeToPixels(cutEnd) - timeToPixels(cutStart)}px`,
              cursor: isDraggingZone ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleZoneMouseDown}
          >
            {/* Start handle */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 dark:bg-primary-400 cursor-ew-resize"
              onMouseDown={(e) => handleHandleMouseDown(e, 'start')}
            />
            {/* End handle */}
            <div
              className="absolute right-0 top-0 bottom-0 w-1 bg-primary-500 dark:bg-primary-400 cursor-ew-resize"
              onMouseDown={(e) => handleHandleMouseDown(e, 'end')}
            />
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-violet-900 dark:bg-gray-200"
            style={{
              transform: `translateX(${timeToPixels(currentTime)}px)`,
              zIndex: 10
            }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-violet-900 dark:bg-gray-200 rotate-45" />
          </div>
        </div>
      </div>

      {/* Scrollbar */}
      {timeScale > 1 && (
        <div
          ref={scrollTrackRef}
          className="relative w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full cursor-pointer overflow-hidden"
          onClick={handleScrollTrackClick}
        >
          <div
            className="absolute top-0 h-full bg-primary-500 dark:bg-primary-400 rounded-full"
            style={{
              left: `${getScrollThumbPosition()}%`,
              width: `${scrollbarWidth}%`,
              cursor: isDraggingScroll ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleScrollMouseDown}
          />
        </div>
      )}
    </div>
  );
};
