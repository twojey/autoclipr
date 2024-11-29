import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

const MAX_CLIP_DURATION = 120; // 2 minutes en secondes

const VideoTimeline = ({
  videoSrc,
  currentTime,
  duration,
  onTimeUpdate,
  isPlaying,
  onPlayPause
}) => {
  const [isDragging, setIsDragging] = useState(null); // 'start', 'end', 'window', 'playhead'
  const [cutStart, setCutStart] = useState(0);
  const [cutEnd, setCutEnd] = useState(Math.min(120, duration));
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [dragStartCutStart, setDragStartCutStart] = useState(0);
  const [dragStartCutEnd, setDragStartCutEnd] = useState(0);
  const [wasPlaying, setWasPlaying] = useState(false);
  const timelineRef = useRef(null);

  // Formatage du temps en MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calcul de la position en pixels à partir du temps
  const getPositionFromTime = useCallback((time) => {
    if (!timelineRef.current) return 0;
    const width = timelineRef.current.clientWidth;
    return (time / duration) * width;
  }, [duration]);

  // Calcul du temps à partir de la position en pixels
  const getTimeFromPosition = useCallback((position) => {
    if (!timelineRef.current) return 0;
    const width = timelineRef.current.clientWidth;
    return (position / width) * duration;
  }, [duration]);

  // Démarrage du drag
  const startDragging = useCallback((type, e) => {
    if (!timelineRef.current) return;

    setIsDragging(type);
    setDragStartX(e.clientX);
    setDragStartTime(currentTime);
    setDragStartCutStart(cutStart);
    setDragStartCutEnd(cutEnd);

    // Si la vidéo est en cours de lecture, on la met en pause
    if (isPlaying) {
      setWasPlaying(true);
      onPlayPause();
    }
  }, [currentTime, cutStart, cutEnd, isPlaying, onPlayPause]);

  // Gestion du drag
  const handleDrag = useCallback((e) => {
    if (!isDragging || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newTime = getTimeFromPosition(x);
    const deltaX = e.clientX - dragStartX;
    const deltaTime = getTimeFromPosition(Math.abs(deltaX));

    switch (isDragging) {
      case 'start':
        // Déplacement de la borne gauche
        const newStart = Math.max(0, Math.min(newTime, cutEnd - 1));
        setCutStart(newStart);
        onTimeUpdate(newStart);
        break;

      case 'end':
        // Déplacement de la borne droite
        const newEnd = Math.min(duration, Math.max(newTime, cutStart + 1, cutStart + MAX_CLIP_DURATION));
        setCutEnd(newEnd);
        onTimeUpdate(newEnd);
        break;

      case 'window':
        // Déplacement de la fenêtre de cut
        const windowWidth = cutEnd - cutStart;
        let newWindowStart = dragStartCutStart + (deltaX > 0 
          ? Math.min(deltaTime, duration - cutEnd)
          : Math.max(-deltaTime, -dragStartCutStart));
        
        // Vérification des limites
        if (newWindowStart < 0) newWindowStart = 0;
        if (newWindowStart + windowWidth > duration) {
          newWindowStart = duration - windowWidth;
        }

        setCutStart(newWindowStart);
        setCutEnd(newWindowStart + windowWidth);
        onTimeUpdate(newWindowStart);
        break;

      case 'playhead':
        onTimeUpdate(newTime);
        break;
    }
  }, [isDragging, dragStartX, dragStartCutStart, dragStartCutEnd, cutStart, cutEnd, duration, getTimeFromPosition, onTimeUpdate]);

  // Fin du drag
  const handleDragEnd = useCallback(() => {
    if (wasPlaying) {
      setWasPlaying(false);
      onPlayPause();
    }
    setIsDragging(null);
  }, [wasPlaying, onPlayPause]);

  // Gestion du clic sur la timeline
  const handleTimelineClick = useCallback((e) => {
    if (!timelineRef.current || isDragging) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = getTimeFromPosition(x);

    // Si le clic est en dehors de la zone de cut, on déplace la zone
    if (clickTime < cutStart || clickTime > cutEnd) {
      const clipDuration = cutEnd - cutStart;
      const newStart = Math.max(0, Math.min(clickTime - clipDuration / 2, duration - clipDuration));
      setCutStart(newStart);
      setCutEnd(newStart + clipDuration);
    }

    onTimeUpdate(clickTime);
  }, [isDragging, cutStart, cutEnd, duration, getTimeFromPosition, onTimeUpdate]);

  useEffect(() => {
    const handleMouseMove = (e) => handleDrag(e);
    const handleMouseUp = () => handleDragEnd();

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleDrag, handleDragEnd]);

  return (
    <div className="space-y-4">
      {/* Contrôles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onPlayPause}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isPlaying ? (
              <PauseIcon className="w-6 h-6" />
            ) : (
              <PlayIcon className="w-6 h-6" />
            )}
          </button>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Durée du clip: {formatTime(cutEnd - cutStart)}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div
        ref={timelineRef}
        className="relative h-16 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer"
        onClick={handleTimelineClick}
      >
        {/* Zone de cut */}
        <div
          className="absolute top-0 bottom-0 bg-blue-500/20"
          style={{
            left: `${(cutStart / duration) * 100}%`,
            width: `${((cutEnd - cutStart) / duration) * 100}%`,
          }}
          onMouseDown={(e) => startDragging('window', e)}
        />

        {/* Borne gauche */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-blue-600 cursor-ew-resize group"
          style={{ left: `${(cutStart / duration) * 100}%` }}
          onMouseDown={(e) => startDragging('start', e)}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                        w-4 h-8 bg-blue-600 rounded opacity-0 group-hover:opacity-100 
                        transition-opacity duration-200" />
        </div>

        {/* Borne droite */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-blue-600 cursor-ew-resize group"
          style={{ left: `${(cutEnd / duration) * 100}%` }}
          onMouseDown={(e) => startDragging('end', e)}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                        w-4 h-8 bg-blue-600 rounded opacity-0 group-hover:opacity-100 
                        transition-opacity duration-200" />
        </div>

        {/* Tête de lecture */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 cursor-col-resize"
          style={{ left: `${(currentTime / duration) * 100}%` }}
          onMouseDown={(e) => startDragging('playhead', e)}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 
                        bg-red-500 transform rotate-45" />
        </div>
      </div>
    </div>
  );
};

export default VideoTimeline;
