import React, { useState, useRef, useEffect } from 'react';
import { VideoCanvas } from './VideoCanvas';
import { VideoTimeline } from './VideoTimeline';
import { ExportModal } from './ExportModal';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const VideoEditor = ({ videoFile, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showExport, setShowExport] = useState(false);
  const [cutStart, setCutStart] = useState(0);
  const [cutEnd, setCutEnd] = useState(30); // 30 secondes par défaut

  // Gestion de la touche espace
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && !e.target.closest('input, textarea')) {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  const handleExport = () => {
    if (isPlaying) setIsPlaying(false);
    setShowExport(true);
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-64px)] bg-light-background-primary dark:bg-dark-background-primary overflow-hidden">
      {/* Section d'édition principale */}
      <div className="w-full h-full max-w-[800px] mx-auto px-4 py-4 flex flex-col">
        {/* Canvas vidéo avec overlay d'export */}
        <div className="relative aspect-video" style={{ maxHeight: 'calc(100% - 100px)' }}>
          <VideoCanvas
            videoFile={videoFile}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            onDurationChange={setDuration}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
          />
          
          {/* Bouton d'export */}
          <button
            onClick={handleExport}
            className="absolute top-4 right-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 
              text-white rounded-lg shadow-lg transition-colors flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export clip
          </button>
        </div>

        {/* Section de contrôle */}
        <div className="mt-4 mb-2 flex-shrink-0">
          <VideoTimeline
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            onTimeUpdate={setCurrentTime}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            cutStart={cutStart}
            cutEnd={cutEnd}
            onCutStartChange={setCutStart}
            onCutEndChange={setCutEnd}
            maxDuration={120} // 2 minutes max
          />
        </div>
      </div>

      {/* Modal d'export */}
      {showExport && (
        <ExportModal
          onClose={() => setShowExport(false)}
          videoFile={videoFile}
          cutStart={cutStart}
          cutEnd={cutEnd}
        />
      )}
    </div>
  );
};

export default VideoEditor;
