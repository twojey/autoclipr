import React, { useRef, useState, useCallback, useEffect } from 'react';
import { PlayIcon, PauseIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/solid';
import { Button } from '../ui/Button';

const INITIAL_CUT_DURATION = 30; // 30 secondes
const MAX_DURATION = 120; // 2 minutes
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;
const MIN_CLIP_DURATION = 3; // Durée minimale en secondes

// Fonction utilitaire pour formater le temps (secondes -> MM:SS)
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const VideoTimeline = ({
  currentTime,
  duration,
  isPlaying,
  onTimeUpdate,
  onTogglePlay,
  cutStart = 0,
  cutEnd = Math.min(INITIAL_CUT_DURATION, duration),
  onCutStartChange,
  onCutEndChange
}) => {
  const timelineRef = useRef(null);
  const [isDraggingHandle, setIsDraggingHandle] = useState(null);
  const [isDraggingZone, setIsDraggingZone] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const [previousPlayState, setPreviousPlayState] = useState(false);
  const dragStartPos = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollTrackRef = useRef(null);

  // État pour le glissement de l'ascenseur
  const [isDraggingScroll, setIsDraggingScroll] = useState(false);
  const scrollStartPos = useRef(null);

  // Calcul de la largeur totale de la timeline zoomée
  const getZoomedWidth = useCallback(() => {
    if (!timelineRef.current) return 0;
    return timelineRef.current.clientWidth * timeScale;
  }, [timeScale]);

  // Calcul de la largeur visible
  const getViewportWidth = useCallback(() => {
    if (!timelineRef.current) return 0;
    return timelineRef.current.clientWidth;
  }, []);

  // Calcul de la position maximale de défilement
  const getMaxScroll = useCallback(() => {
    return Math.max(0, getZoomedWidth() - getViewportWidth());
  }, [getZoomedWidth, getViewportWidth]);

  // Gestion du défilement
  const handleScroll = useCallback((newPosition) => {
    const maxScroll = getMaxScroll();
    const clampedPosition = Math.max(0, Math.min(newPosition, maxScroll));
    setScrollPosition(clampedPosition);
  }, [getMaxScroll]);

  // Gestion du clic sur la piste de défilement
  const handleScrollTrackClick = useCallback((e) => {
    if (!scrollTrackRef.current) return;
    
    const rect = scrollTrackRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const trackWidth = rect.width;
    
    const thumbWidth = (getViewportWidth() / getZoomedWidth()) * trackWidth;
    const availableTrackWidth = trackWidth - thumbWidth;
    
    const newScrollPosition = (clickPosition / trackWidth) * getMaxScroll();
    handleScroll(newScrollPosition);
  }, [getViewportWidth, getZoomedWidth, getMaxScroll, handleScroll]);

  // Gestion du glissement de l'ascenseur
  const handleScrollMouseDown = useCallback((e) => {
    e.stopPropagation();
    setIsDraggingScroll(true);
    scrollStartPos.current = {
      x: e.clientX,
      scrollPos: scrollPosition
    };
  }, [scrollPosition]);

  const handleScrollMouseMove = useCallback((e) => {
    if (!isDraggingScroll || !scrollStartPos.current || !scrollTrackRef.current) return;

    const rect = scrollTrackRef.current.getBoundingClientRect();
    const deltaX = e.clientX - scrollStartPos.current.x;
    const trackWidth = rect.width;
    
    const scrollRatio = deltaX / trackWidth;
    const scrollDelta = scrollRatio * getMaxScroll();
    const newPosition = scrollStartPos.current.scrollPos + scrollDelta;
    
    handleScroll(newPosition);
  }, [isDraggingScroll, getMaxScroll, handleScroll]);

  const handleScrollMouseUp = useCallback(() => {
    if (isDraggingScroll) {
      setIsDraggingScroll(false);
      scrollStartPos.current = null;
    }
  }, [isDraggingScroll]);

  // Gestion du zoom
  const handleZoom = useCallback((direction) => {
    setTimeScale(prevScale => {
      const newScale = direction === 'in' 
        ? Math.min(prevScale + ZOOM_STEP, MAX_ZOOM)
        : Math.max(prevScale - ZOOM_STEP, MIN_ZOOM);
      return newScale;
    });
  }, []);

  // Gestion du scroll horizontal
  const handleWheel = useCallback((e) => {
    if (timeScale <= 1) return;

    // Empêcher le scroll par défaut
    e.preventDefault();
    
    // Si la touche Shift est enfoncée ou si c'est un trackpad avec scroll horizontal
    if (e.shiftKey || Math.abs(e.deltaX) > 0) {
      const scrollAmount = e.deltaX || e.deltaY;
      // Déplacement de la vue sans modifier la zone de cut
      handleScroll(scrollPosition + scrollAmount * 0.5);
    } else {
      // Scroll vertical normal pour le zoom
      const zoomDirection = e.deltaY > 0 ? 'out' : 'in';
      handleZoom(zoomDirection);
    }
  }, [timeScale, scrollPosition, handleScroll, handleZoom]);

  useEffect(() => {
    // Empêcher le scroll horizontal du navigateur quand le curseur est sur la timeline
    const timelineElement = timelineRef.current;
    if (!timelineElement) return;

    const preventHorizontalScroll = (e) => {
      if (timeScale <= 1) return;
      if (e.shiftKey || Math.abs(e.deltaX) > 0) {
        e.preventDefault();
      }
    };

    timelineElement.addEventListener('wheel', preventHorizontalScroll, { passive: false });
    
    return () => {
      timelineElement.removeEventListener('wheel', preventHorizontalScroll);
    };
  }, [timeScale]);

  // Conversion temps <-> pixels avec échelle
  const timeToPixels = useCallback((time) => {
    if (!timelineRef.current || !duration) return 0;
    const width = timelineRef.current.clientWidth;
    return (time / duration) * width * timeScale - scrollPosition;
  }, [duration, timeScale, scrollPosition]);

  const pixelsToTime = useCallback((pixels) => {
    if (!timelineRef.current || !duration) return 0;
    const width = timelineRef.current.clientWidth;
    return ((pixels + scrollPosition) / width / timeScale) * duration;
  }, [duration, timeScale, scrollPosition]);

  // Gestion des bornes
  const handleHandleMouseDown = useCallback((e, handle) => {
    e.stopPropagation();
    setIsDraggingHandle(handle);
    setPreviousPlayState(isPlaying);
    if (isPlaying) onTogglePlay();
  }, [isPlaying, onTogglePlay]);

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingHandle || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const currentTime = pixelsToTime(x);

    if (isDraggingHandle === 'start') {
      const newStart = Math.max(0, Math.min(currentTime, cutEnd - MIN_CLIP_DURATION));
      onCutStartChange(newStart);
      onTimeUpdate(newStart);
    } else if (isDraggingHandle === 'end') {
      const newEnd = Math.min(duration, Math.max(currentTime, cutStart + MIN_CLIP_DURATION));
      onCutEndChange(newEnd);
      if (currentTime <= currentTime) {
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

  // Gestion du glissement de la zone
  const handleZoneMouseDown = useCallback((e) => {
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

  const handleZoneMouseMove = useCallback((e) => {
    if (!isDraggingZone || !dragStartPos.current || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaTime = pixelsToTime(deltaX) - pixelsToTime(0);
    
    const zoneDuration = cutEnd - cutStart;
    let newStart = dragStartPos.current.cutStart + deltaTime;
    let newEnd = dragStartPos.current.cutEnd + deltaTime;

    // Contraintes pour garder la zone dans les limites
    if (newStart < 0) {
      newStart = 0;
      newEnd = zoneDuration;
    }
    if (newEnd > duration) {
      newEnd = duration;
      newStart = duration - zoneDuration;
    }

    onCutStartChange(newStart);
    onCutEndChange(newEnd);
    onTimeUpdate(newStart);
  }, [isDraggingZone, pixelsToTime, duration, onCutStartChange, onCutEndChange, onTimeUpdate]);

  const handleZoneMouseUp = useCallback(() => {
    if (isDraggingZone) {
      setIsDraggingZone(false);
      if (previousPlayState) onTogglePlay();
      dragStartPos.current = null;
    }
  }, [isDraggingZone, previousPlayState, onTogglePlay]);

  // Gestion du clic sur la timeline
  const handleTimelineClick = useCallback((e) => {
    if (isDraggingHandle || isDraggingZone || isDraggingScroll) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = pixelsToTime(x);

    // Si le clic est dans la zone de cut, déplace uniquement la tête de lecture
    if (clickTime >= cutStart && clickTime <= cutEnd) {
      onTimeUpdate(clickTime);
      return;
    }

    // Si le clic est en dehors, déplace la zone de cut
    const cutDuration = Math.max(MIN_CLIP_DURATION, cutEnd - cutStart);
    const newStart = Math.max(0, Math.min(clickTime - cutDuration / 2, duration - cutDuration));
    const newEnd = newStart + cutDuration;
    
    onCutStartChange(newStart);
    onCutEndChange(newEnd);
    onTimeUpdate(newStart);
  }, [isDraggingHandle, isDraggingZone, isDraggingScroll, pixelsToTime, cutStart, cutEnd, duration, onCutStartChange, onCutEndChange, onTimeUpdate]);

  // Gestion de la lecture en boucle et contraintes de la tête de lecture
  useEffect(() => {
    if (currentTime < cutStart) {
      onTimeUpdate(cutStart);
    } else if (currentTime >= cutEnd) {
      if (isPlaying) {
        onTimeUpdate(cutStart); // Retour au début pour la lecture en boucle
      } else {
        onTimeUpdate(cutEnd); // Reste à la fin si en pause
      }
    }
  }, [currentTime, cutStart, cutEnd, isPlaying, onTimeUpdate]);

  // Maintien de la tête de lecture dans la zone de cut
  useEffect(() => {
    if (currentTime < cutStart) {
      onTimeUpdate(cutStart);
    } else if (currentTime > cutEnd) {
      onTimeUpdate(cutEnd);
    }
  }, [currentTime, cutStart, cutEnd, onTimeUpdate]);

  // Ajout des écouteurs d'événements
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleZoneMouseMove);
    window.addEventListener('mouseup', handleZoneMouseUp);
    window.addEventListener('mousemove', handleScrollMouseMove);
    window.addEventListener('mouseup', handleScrollMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleZoneMouseMove);
      window.removeEventListener('mouseup', handleZoneMouseUp);
      window.removeEventListener('mousemove', handleScrollMouseMove);
      window.removeEventListener('mouseup', handleScrollMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, handleZoneMouseMove, handleZoneMouseUp, handleScrollMouseMove, handleScrollMouseUp]);

  // Calcul des graduations en fonction du zoom
  const getTimelineGraduations = useCallback(() => {
    const graduations = [];
    let mainStep, subStep, textStep;

    // Définition des intervalles selon le zoom
    if (timeScale >= 2) {
      mainStep = 10;    // Graduations principales toutes les 10 secondes
      subStep = 2;      // Sous-graduations toutes les 2 secondes
      textStep = 30;    // Texte toutes les 30 secondes
    } else if (timeScale >= 1) {
      mainStep = 20;    // Graduations principales toutes les 20 secondes
      subStep = 4;      // Sous-graduations toutes les 4 secondes
      textStep = 60;    // Texte toutes les minutes
    } else {
      mainStep = 60;    // Graduations principales toutes les minutes
      subStep = 10;     // Sous-graduations toutes les 10 secondes
      textStep = 120;   // Texte toutes les 2 minutes
    }

    // Génération des graduations
    for (let i = 0; i <= duration; i += subStep) {
      const isMain = i % mainStep === 0;
      const showText = i % textStep === 0;
      graduations.push({
        time: i,
        position: timeToPixels(i),
        isMain,
        showText
      });
    }
    
    return graduations;
  }, [duration, timeScale, timeToPixels]);

  return (
    <div className="relative w-full h-32 bg-gray-900 rounded-lg p-4">
      {/* Contrôles supérieurs */}
      <div className="flex justify-between items-center mb-2">
        {/* Bouton Play/Pause et temps */}
        <div className="flex items-center gap-4">
          <Button
            onClick={onTogglePlay}
            className="p-1.5 bg-gray-800 rounded hover:bg-gray-700"
          >
            {isPlaying ? (
              <PauseIcon className="w-5 h-5" />
            ) : (
              <PlayIcon className="w-5 h-5" />
            )}
          </Button>

          {/* Temps actuel et durée totale */}
          <div className="text-sm text-gray-300 space-x-1">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Durée du clip */}
          <div className="text-sm text-gray-300">
            <span>Clip: {formatTime(cutEnd - cutStart)}</span>
          </div>
        </div>

        {/* Contrôles de zoom */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleZoom('out')}
            disabled={timeScale <= MIN_ZOOM}
            className="p-2"
            variant="secondary"
          >
            <MagnifyingGlassMinusIcon className="w-5 h-5" />
          </Button>
          <span className="text-white text-sm font-mono">
            {Math.round(timeScale * 100)}%
          </span>
          <Button
            onClick={() => handleZoom('in')}
            disabled={timeScale >= MAX_ZOOM}
            className="p-2"
            variant="secondary"
          >
            <MagnifyingGlassPlusIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Container de la timeline avec overflow hidden */}
      <div className="relative">
        {/* Timeline */}
        <div
          ref={timelineRef}
          className="relative w-full h-12 bg-gray-800 rounded cursor-pointer overflow-hidden"
          onClick={handleTimelineClick}
          onWheel={handleWheel}
        >
          {/* Graduations */}
          <div className="absolute inset-0">
            {getTimelineGraduations().map(({ time, position, isMain, showText }) => (
              <div 
                key={time} 
                className="absolute top-0 flex flex-col items-center"
                style={{ transform: `translateX(${position}px)` }}
              >
                <div 
                  className={`w-px ${isMain ? 'h-3 bg-gray-400' : 'h-1.5 bg-gray-600'}`}
                />
                {showText && timeScale >= 1 && (
                  <span 
                    className="text-xs text-gray-400 mt-1 select-none"
                    style={{ 
                      fontSize: '0.65rem',
                      opacity: timeScale >= 1 ? 1 : 0.7,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    {formatTime(time)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Zone de cut */}
          <div
            className="absolute h-full bg-blue-500/30"
            style={{
              left: timeToPixels(cutStart),
              width: timeToPixels(cutEnd - cutStart)
            }}
          >
            {/* Barre gauche avec rectangle */}
            <div
              className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 group cursor-ew-resize"
              onMouseDown={(e) => handleHandleMouseDown(e, 'start')}
            >
              <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-6 bg-blue-500 
                rounded-sm group-hover:bg-blue-400 transition-colors" />
            </div>

            {/* Barre droite avec rectangle */}
            <div
              className="absolute right-0 top-0 bottom-0 w-0.5 bg-blue-500 group cursor-ew-resize"
              onMouseDown={(e) => handleHandleMouseDown(e, 'end')}
            >
              <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-6 bg-blue-500 
                rounded-sm group-hover:bg-blue-400 transition-colors" />
            </div>

            {/* Zone centrale */}
            <div
              className="absolute left-0.5 right-0.5 top-0 bottom-0 cursor-grab active:cursor-grabbing"
              onMouseDown={handleZoneMouseDown}
            />
          </div>

          {/* Tête de lecture */}
          <div
            className="absolute top-0 w-0.5 h-full bg-white pointer-events-none"
            style={{
              left: timeToPixels(currentTime)
            }}
          />

          {/* Scrollbar (visible uniquement si zoom > 100%) */}
          {timeScale > 1 && (
            <div
              ref={scrollTrackRef}
              className="absolute bottom-0 left-0 right-0 h-2 bg-gray-700/50"
              onClick={(e) => {
                e.stopPropagation(); // Empêche la propagation vers la timeline
                handleScrollTrackClick(e);
              }}
            >
              {/* Thumb (poignée de défilement) */}
              <div
                className="absolute bottom-0 h-full bg-gray-500/70 hover:bg-gray-400/70 transition-colors cursor-grab active:cursor-grabbing"
                style={{
                  left: `${(scrollPosition / getMaxScroll()) * 100}%`,
                  width: `${(getViewportWidth() / getZoomedWidth()) * 100}%`,
                  minWidth: '20px'
                }}
                onMouseDown={handleScrollMouseDown}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
