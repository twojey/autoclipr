import React, { useState, useCallback, useRef, useEffect } from 'react';
import VideoCanvas from './VideoCanvas';
import Timeline from './Timeline';
import ExportModal from './ExportModal';
import CanvasControls from './CanvasControls';
import { useVideoState } from '../../hooks/useVideoState';
import { useVideoTransform } from '../../hooks/useVideoTransform';

const Editor = () => {
  const videoRef = useRef(null);
  const {
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
  } = useVideoState();

  const {
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
  } = useVideoTransform();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Gestion de la touche espace
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space' && !event.target.matches('input, textarea, [contenteditable]')) {
        event.preventDefault();
        handlePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePlayPause]);

  return (
    <div className="max-w-[1440px] mx-auto p-4 space-y-4">
      {/* Section principale */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Canvas vidéo avec contrôles */}
        <div className="relative">
          <VideoCanvas
            videoRef={videoRef}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            scale={scale}
            position={position}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onWheel={handleZoom}
            showGrid={showGrid}
            isDragging={isDragging}
          />

          {/* Contrôles du canvas */}
          <CanvasControls
            onFitHeight={fitHeight}
            onFitWidth={fitWidth}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
          />

          {/* Bouton d'export */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="absolute top-4 right-4 px-4 py-2 bg-blue-500 text-white rounded-lg 
              hover:bg-blue-600 transition-colors shadow-lg"
          >
            Export Clip
          </button>
        </div>

        {/* Timeline et contrôles */}
        <div className="p-4">
          <Timeline
            duration={duration}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onTimeUpdate={handleTimeUpdate}
            cutStart={cutStart}
            cutEnd={cutEnd}
            onCutStartChange={handleCutStartChange}
            onCutEndChange={handleCutEndChange}
            onVideoStateChange={handleVideoStateChange}
          />
        </div>
      </div>

      {/* Modal d'export */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        videoRef={videoRef}
        cutStart={cutStart}
        cutEnd={cutEnd}
        scale={scale}
        position={position}
      />
    </div>
  );
};

export default Editor;
