import { useState, useCallback } from 'react';

export const useVideoState = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [cutStart, setCutStart] = useState(0);
  const [cutEnd, setCutEnd] = useState(30); // Valeur initiale de 30 secondes

  const handleTimeUpdate = useCallback((time) => {
    setCurrentTime(time);
    // Si on dépasse la fin du cut, revenir au début
    if (time >= cutEnd) {
      setCurrentTime(cutStart);
    }
  }, [cutStart, cutEnd]);

  const handleDurationChange = useCallback((newDuration) => {
    setDuration(newDuration);
    // Si pas de cutEnd défini, on met 30s ou la durée max de 2min
    if (cutEnd === 30) {
      setCutEnd(Math.min(newDuration, 120));
    }
  }, [cutEnd]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleCutStartChange = useCallback((newStart) => {
    if (newStart >= 0 && newStart < cutEnd) {
      setCutStart(newStart);
      setCurrentTime(newStart);
      setIsPlaying(false);
    }
  }, [cutEnd]);

  const handleCutEndChange = useCallback((newEnd) => {
    if (newEnd > cutStart && newEnd <= Math.min(duration, 120)) {
      setCutEnd(newEnd);
      setCurrentTime(cutStart);
      setIsPlaying(false);
    }
  }, [cutStart, duration]);

  const handleVideoStateChange = useCallback((newTime) => {
    setCurrentTime(newTime);
    // Si le clic est en dehors de la zone de cut, on déplace la zone
    if (newTime < cutStart || newTime > cutEnd) {
      const cutDuration = cutEnd - cutStart;
      const newStart = Math.max(0, Math.min(newTime, duration - cutDuration));
      const newEnd = Math.min(newStart + cutDuration, duration);
      setCutStart(newStart);
      setCutEnd(newEnd);
    }
  }, [cutStart, cutEnd, duration]);

  return {
    isPlaying,
    currentTime,
    duration,
    cutStart,
    cutEnd,
    handleTimeUpdate,
    handleDurationChange,
    handlePlayPause,
    handleCutStartChange,
    handleCutEndChange,
    handleVideoStateChange,
  };
};
