import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/outline';

const Timeline = ({
  duration,
  currentTime,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
  cutStart,
  cutEnd,
  onCutStartChange,
  onCutEndChange,
  onVideoStateChange,
  timeScale = 1,
}) => {
  const timelineRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null);
  const [prevPlayState, setPrevPlayState] = useState(false);
  const [hoveredTime, setHoveredTime] = useState(null);

  // Convertir le temps en position
  const timeToPosition = useCallback((time) => {
    const container = timelineRef.current;
    if (!container) return 0;
    return (time / duration) * container.clientWidth;
  }, [duration]);

  // Convertir la position en temps
  const positionToTime = useCallback((position) => {
    const container = timelineRef.current;
    if (!container) return 0;
    return Math.max(0, Math.min((position / container.clientWidth) * duration, duration));
  }, [duration]);

  // Formater le temps en MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Gérer le survol de la timeline
  const handleMouseMove = useCallback((e) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const time = positionToTime(position);

    setHoveredTime(time);

    if (isDragging) {
      switch (dragType) {
        case 'start':
          if (time < cutEnd - 1) { // Minimum 1 seconde de clip
            onCutStartChange(time);
            onTimeUpdate(time);
          }
          break;
        case 'end':
          const maxEnd = Math.min(duration, cutStart + 120); // Maximum 2 minutes
          if (time > cutStart + 1 && time <= maxEnd) {
            onCutEndChange(time);
            onTimeUpdate(time);
          }
          break;
        case 'cut':
          const cutDuration = cutEnd - cutStart;
          let newStart = time - (cutDuration / 2);
          let newEnd = time + (cutDuration / 2);

          if (newStart < 0) {
            newStart = 0;
            newEnd = cutDuration;
          }
          if (newEnd > duration) {
            newEnd = duration;
            newStart = duration - cutDuration;
          }

          onCutStartChange(newStart);
          onCutEndChange(newEnd);
          onTimeUpdate(newStart);
          break;
      }
    }
  }, [isDragging, dragType, cutStart, cutEnd, duration, onCutStartChange, onCutEndChange, onTimeUpdate, positionToTime]);

  // Gérer le début du drag
  const handleMouseDown = useCallback((e, type) => {
    if (!timelineRef.current) return;

    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragType(type);
    setPrevPlayState(isPlaying);
    if (isPlaying) {
      onVideoStateChange(false);
    }
  }, [isPlaying, onVideoStateChange]);

  // Gérer le clic dans la timeline
  const handleTimelineClick = useCallback((e) => {
    if (isDragging || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newTime = positionToTime(position);

    // Si le clic est dans la zone de cut, déplacer juste la tête de lecture
    if (newTime >= cutStart && newTime <= cutEnd) {
      onTimeUpdate(newTime);
    } else {
      // Sinon, déplacer la zone de cut centrée sur le clic
      const cutDuration = cutEnd - cutStart;
      let newStart = newTime - (cutDuration / 2);
      let newEnd = newTime + (cutDuration / 2);

      if (newStart < 0) {
        newStart = 0;
        newEnd = cutDuration;
      }
      if (newEnd > duration) {
        newEnd = duration;
        newStart = duration - cutDuration;
      }

      onCutStartChange(newStart);
      onCutEndChange(newEnd);
      onTimeUpdate(newStart);
    }
  }, [cutStart, cutEnd, duration, isDragging, onCutStartChange, onCutEndChange, onTimeUpdate, positionToTime]);

  // Gérer la fin du drag
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragType(null);
        if (prevPlayState) {
          onVideoStateChange(true);
        }
      }
    };

    const handleMouseLeave = () => {
      setHoveredTime(null);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    timelineRef.current?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      timelineRef.current?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isDragging, handleMouseMove, onVideoStateChange, prevPlayState]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-2">
      {/* Contrôles et temps */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <button
            onClick={onPlayPause}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          >
            {isPlaying ? (
              <PauseIcon className="w-6 h-6" />
            ) : (
              <PlayIcon className="w-6 h-6" />
            )}
          </button>
          <div className="text-sm font-medium">
            {formatTime(currentTime)}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center">
            <span className="text-gray-500 dark:text-gray-400">Cut:</span>
            <span className="ml-2">{formatTime(cutEnd - cutStart)}</span>
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {formatTime(duration)}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div
          ref={timelineRef}
          className="relative h-12 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer overflow-hidden"
          onClick={handleTimelineClick}
          onMouseMove={handleMouseMove}
        >
          {/* Zone de cut */}
          <div
            className="absolute top-0 bottom-0 bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
            style={{
              left: `${(cutStart / duration) * 100}%`,
              width: `${((cutEnd - cutStart) / duration) * 100}%`,
            }}
            onMouseDown={(e) => handleMouseDown(e, 'cut')}
          />

          {/* Borne gauche */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-blue-500 cursor-ew-resize group hover:w-2 transition-all"
            style={{ left: `${(cutStart / duration) * 100}%` }}
            onMouseDown={(e) => handleMouseDown(e, 'start')}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-6 bg-blue-500 rounded group-hover:w-4 transition-all" />
          </div>

          {/* Borne droite */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-blue-500 cursor-ew-resize group hover:w-2 transition-all"
            style={{ left: `${(cutEnd / duration) * 100}%` }}
            onMouseDown={(e) => handleMouseDown(e, 'end')}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-6 bg-blue-500 rounded group-hover:w-4 transition-all" />
          </div>

          {/* Tête de lecture */}
          <div
            className="absolute top-0 w-0.5 h-full bg-white pointer-events-none"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
          </div>

          {/* Temps survolé */}
          {hoveredTime !== null && !isDragging && (
            <div
              className="absolute -top-6 px-2 py-1 bg-gray-800 text-white text-xs rounded transform -translate-x-1/2 pointer-events-none"
              style={{ left: `${(hoveredTime / duration) * 100}%` }}
            >
              {formatTime(hoveredTime)}
            </div>
          )}
        </div>

        {/* Graduations */}
        <div className="absolute top-0 left-0 right-0 h-full pointer-events-none">
          {Array.from({ length: 11 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 w-px h-2 bg-gray-400/30"
              style={{ left: `${i * 10}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
