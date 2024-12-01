import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, PanInfo } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon
} from '@heroicons/react/24/solid';

const INITIAL_CUT_DURATION = 30; // 30 secondes
const MAX_CUT_DURATION = 120; // 2 minutes
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

interface TimeRange {
  start: number;
  end: number;
}

interface DragStartPosition {
  cutStart: number;
  cutEnd: number;
}

interface TimelineProps {
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate?: (time: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  cutStart?: number;
  cutEnd?: number;
  onCutChange?: (start: number, end: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onPlayStateChange,
  cutStart = 0,
  cutEnd = Math.min(INITIAL_CUT_DURATION, duration),
  onCutChange
}) => {
  // États
  const [resizing, setResizing] = useState<'start' | 'end' | null>(null);
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);
  const [previousPlayState, setPreviousPlayState] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  
  // Refs
  const timelineRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const dragStartPosition = useRef<DragStartPosition | null>(null);
  const visibleTimeRange = useRef<TimeRange>({ start: 0, end: duration });

  // Position de la fenêtre de cut
  const windowX = useMotionValue(0);

  // Conversion temps <-> pixels avec échelle
  const timeToPixels = useCallback((time: number): number => {
    if (!timelineRef.current || !duration) return 0;
    const width = timelineRef.current.clientWidth;
    return (time / duration) * width * timeScale;
  }, [duration, timeScale]);

  const pixelsToTime = useCallback((pixels: number): number => {
    if (!timelineRef.current || !duration) return 0;
    const width = timelineRef.current.clientWidth;
    return (pixels / width / timeScale) * duration;
  }, [duration, timeScale]);

  // Gestion du clic prolongé sur les bornes
  const handleHandleMouseDown = useCallback((e: React.MouseEvent, handle: 'start' | 'end') => {
    e.stopPropagation();
    const startTime = Date.now();
    setPreviousPlayState(isPlaying);
    onPlayStateChange?.(false);

    longPressTimer.current = setTimeout(() => {
      setLongPressActive(true);
      setResizing(handle);
    }, 200);

    const handleMouseMove = (e: MouseEvent) => {
      if (!longPressActive || !timelineRef.current) return;
      
      const time = pixelsToTime(e.clientX - timelineRef.current.getBoundingClientRect().left);
      if (handle === 'start' && time < cutEnd) {
        onCutChange?.(Math.max(0, time), cutEnd);
        onTimeUpdate?.(time);
      } else if (handle === 'end' && time > cutStart) {
        const newEnd = Math.min(time, Math.min(duration, cutStart + MAX_CUT_DURATION));
        onCutChange?.(cutStart, newEnd);
        onTimeUpdate?.(newEnd);
      }
    };

    const handleMouseUp = () => {
      if (Date.now() - startTime < 200) {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
        }
      }
      setLongPressActive(false);
      setResizing(null);
      onPlayStateChange?.(previousPlayState);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [isPlaying, onPlayStateChange, cutStart, cutEnd, duration, onCutChange, onTimeUpdate, pixelsToTime, longPressActive]);

  // Gestion du glissement de la fenêtre
  const handleWindowDragStart = useCallback(() => {
    setIsDraggingWindow(true);
    setPreviousPlayState(isPlaying);
    onPlayStateChange?.(false);
    dragStartPosition.current = { cutStart, cutEnd };
  }, [isPlaying, onPlayStateChange, cutStart, cutEnd]);

  const handleWindowDrag = useCallback((_: any, info: PanInfo) => {
    if (!dragStartPosition.current) return;
    
    const deltaTime = pixelsToTime(info.offset.x);
    const newStart = Math.max(0, dragStartPosition.current.cutStart + deltaTime);
    const newEnd = Math.min(duration, dragStartPosition.current.cutEnd + deltaTime);
    
    if (newEnd <= duration && newStart >= 0) {
      onCutChange?.(newStart, newEnd);
      onTimeUpdate?.(newStart); // Déplace la tête de lecture au début
    }
  }, [duration, pixelsToTime, onCutChange, onTimeUpdate]);

  const handleWindowDragEnd = useCallback(() => {
    setIsDraggingWindow(false);
    onPlayStateChange?.(previousPlayState);
    dragStartPosition.current = null;
  }, [previousPlayState, onPlayStateChange]);

  // Gestion du clic sur la timeline
  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (resizing || isDraggingWindow || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickTime = pixelsToTime(clickX);

    // Si le clic est dans la zone de cut, déplace juste la tête de lecture
    if (clickTime >= cutStart && clickTime <= cutEnd) {
      onTimeUpdate?.(clickTime);
      return;
    }

    // Si le clic est en dehors, déplace la zone de cut
    const cutDuration = cutEnd - cutStart;
    const newStart = Math.max(0, clickTime - cutDuration / 2);
    const newEnd = Math.min(duration, newStart + cutDuration);
    onCutChange?.(newStart, newEnd);
    onTimeUpdate?.(newStart);
  }, [resizing, isDraggingWindow, pixelsToTime, cutStart, cutEnd, duration, onCutChange, onTimeUpdate]);

  // Boucle de lecture
  useEffect(() => {
    if (currentTime >= cutEnd && isPlaying) {
      onTimeUpdate?.(cutStart);
    }
  }, [currentTime, cutEnd, cutStart, isPlaying, onTimeUpdate]);

  // Gestion du zoom
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setTimeScale(prevScale => {
      const newScale = direction === 'in' 
        ? Math.min(prevScale + ZOOM_STEP, MAX_ZOOM)
        : Math.max(prevScale - ZOOM_STEP, MIN_ZOOM);
      
      // Ajuster la plage visible
      const timelineWidth = timelineRef.current?.clientWidth || 0;
      const visibleDuration = duration / newScale;
      const currentCenter = (visibleTimeRange.current.start + visibleTimeRange.current.end) / 2;
      
      visibleTimeRange.current = {
        start: Math.max(0, currentCenter - visibleDuration / 2),
        end: Math.min(duration, currentCenter + visibleDuration / 2)
      };
      
      return newScale;
    });
  }, [duration]);

  return (
    <div className="relative w-full h-24 bg-gray-900 rounded-lg p-4">
      {/* Contrôles */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {/* Boutons de zoom */}
        <button
          onClick={() => handleZoom('out')}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white 
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={timeScale <= MIN_ZOOM}
        >
          <MagnifyingGlassMinusIcon className="w-5 h-5" />
        </button>
        <span className="text-white text-sm font-mono">
          {Math.round(timeScale * 100)}%
        </span>
        <button
          onClick={() => handleZoom('in')}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white 
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={timeScale >= MAX_ZOOM}
        >
          <MagnifyingGlassPlusIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Bouton Play/Pause */}
      <button
        onClick={() => onPlayStateChange?.(!isPlaying)}
        className="absolute top-2 left-2 p-2 rounded-full bg-blue-500 hover:bg-blue-400 
          transition-colors text-white"
      >
        {isPlaying ? (
          <PauseIcon className="w-6 h-6" />
        ) : (
          <PlayIcon className="w-6 h-6" />
        )}
      </button>

      {/* Timeline */}
      <div
        ref={timelineRef}
        className="relative w-full h-12 mt-8 bg-gray-800 rounded cursor-pointer overflow-hidden"
        onClick={handleTimelineClick}
      >
        {/* Graduations */}
        <div className="absolute inset-0">
          {Array.from({ length: Math.ceil(duration) }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 w-px h-2 bg-gray-600"
              style={{
                left: timeToPixels(i),
                display: timeScale >= 1 ? 'block' : 'none'
              }}
            />
          ))}
        </div>

        {/* Zone de cut avec scale */}
        <motion.div
          className="absolute h-full bg-blue-500/30"
          style={{
            left: timeToPixels(cutStart),
            width: timeToPixels(cutEnd - cutStart),
            x: windowX
          }}
          drag="x"
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={timelineRef}
          onDragStart={handleWindowDragStart}
          onDrag={handleWindowDrag}
          onDragEnd={handleWindowDragEnd}
        >
          {/* Barres et rectangles avec scale */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 group cursor-ew-resize"
               onMouseDown={(e) => handleHandleMouseDown(e, 'start')}>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-8 bg-blue-500 
              rounded-sm group-hover:bg-blue-400 transition-colors" />
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500 group cursor-ew-resize"
               onMouseDown={(e) => handleHandleMouseDown(e, 'end')}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-8 bg-blue-500 
              rounded-sm group-hover:bg-blue-400 transition-colors" />
          </div>

          <div className="absolute left-1 right-1 top-0 bottom-0 cursor-grab active:cursor-grabbing" />
        </motion.div>

        {/* Tête de lecture avec scale */}
        <div
          className="absolute top-0 w-0.5 h-full bg-white pointer-events-none"
          style={{
            left: timeToPixels(currentTime),
            transition: isPlaying ? 'none' : 'left 0.1s linear'
          }}
        />
      </div>
    </div>
  );
};

export default Timeline;
