import { useState, useCallback } from 'react';

export const useVideoTransform = () => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setShowGrid(true);
  }, []);

  const handleDrag = useCallback((dx, dy) => {
    setPosition(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setShowGrid(false);
  }, []);

  const handleZoom = useCallback((deltaY, point) => {
    const zoomFactor = deltaY > 0 ? 0.9 : 1.1;
    const newScale = scale * zoomFactor;

    // Limiter le zoom entre 0.1 et 5
    if (newScale < 0.1 || newScale > 5) return;

    // Calculer le nouveau point d'origine pour maintenir le point de zoom
    const dx = (point.x - position.x) * (1 - zoomFactor);
    const dy = (point.y - position.y) * (1 - zoomFactor);

    setScale(newScale);
    setPosition(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
  }, [scale, position]);

  const fitHeight = useCallback(() => {
    setScale(1);
    setPosition(prev => ({
      x: prev.x,
      y: 0
    }));
  }, []);

  const fitWidth = useCallback(() => {
    setScale(1);
    setPosition(prev => ({
      x: 0,
      y: prev.y
    }));
  }, []);

  const zoomIn = useCallback(() => {
    const newScale = Math.min(scale * 1.1, 5);
    setScale(newScale);
  }, [scale]);

  const zoomOut = useCallback(() => {
    const newScale = Math.max(scale * 0.9, 0.1);
    setScale(newScale);
  }, [scale]);

  return {
    scale,
    position,
    isDragging,
    showGrid,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    handleZoom,
    fitHeight,
    fitWidth,
    zoomIn,
    zoomOut,
  };
};
