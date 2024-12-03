import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { VideoCanvas } from './VideoCanvas';
import { VideoTimeline } from './VideoTimeline';
import { ExportDialog } from './ExportDialog';

interface VideoEditorProps {
  videoFile: File;
  onBack: () => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({ videoFile, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [cutStart, setCutStart] = useState(0);
  const [cutEnd, setCutEnd] = useState(0);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [overlayDimensions, setOverlayDimensions] = useState({ width: 0, height: 0 });
  const [videoTransform, setVideoTransform] = useState({ x: 0, y: 0, scale: 0 });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement | null>(null);

  // Gestionnaire de la barre d'espace
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignorer si l'utilisateur tape dans un champ de texte
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Empêcher le défilement de la page avec la barre d'espace
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Mettre à jour cutEnd une fois que la durée est connue
  useEffect(() => {
    if (duration > 0 && cutEnd === 0) {
      setCutEnd(Math.min(30, duration));
    }
  }, [duration, cutEnd]);

  const handleTransformChange = useCallback((transform: { x: number; y: number; scale: number }) => {
    setVideoTransform(transform);
  }, []);

  const handleExportDialogOpen = useCallback((open: boolean) => {
    setIsExportDialogOpen(open);
  }, []);

  const handleVideoRef = (element: HTMLVideoElement | null) => {
    videoRef.current = element;
  };

  return (
    <div className="h-full bg-gradient-to-tl from-gray-100 via-blue-100 to-blue-200 dark:from-gray-950 dark:via-purple-900 dark:to-purple-800 grid place-items-center">
      <div className="w-full max-w-[800px] px-4 flex flex-col -mt-8">
        <div className="w-full rounded-xl backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/40 dark:border-white/10 shadow-lg p-4">
          {/* Aperçu vidéo */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-4">
            <VideoCanvas
              videoFile={videoFile}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              cutStart={cutStart}
              cutEnd={cutEnd}
              onTimeUpdate={setCurrentTime}
              onDurationChange={setDuration}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onVideoRef={handleVideoRef}
              onTransformChange={handleTransformChange}
              onExportDialogOpen={handleExportDialogOpen}
            />
          </div>

          {/* Timeline */}
          <div className="mt-6">
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
            />
          </div>
        </div>
      </div>

      {isExportDialogOpen && (
        <ExportDialog
          open={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          videoRef={videoRef}
          backgroundVideoRef={backgroundVideoRef}
          overlayDimensions={overlayDimensions}
          videoTransform={videoTransform}
          startTime={cutStart}
          endTime={cutEnd}
        />
      )}
    </div>
  );
};

export default VideoEditor;
