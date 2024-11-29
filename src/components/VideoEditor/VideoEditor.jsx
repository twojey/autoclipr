import React, { useState, useRef, useEffect } from 'react';
import { VideoCanvas } from './VideoCanvas';
import { VideoTimeline } from './VideoTimeline';
import { ExportModal } from './ExportModal';
import { ExportScreen } from './ExportScreen'; // Import the ExportScreen component
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const VideoEditor = ({ videoFile, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showExport, setShowExport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedVideoUrl, setExportedVideoUrl] = useState(null);
  const [cutStart, setCutStart] = useState(0);
  const [cutEnd, setCutEnd] = useState(30);
  const videoUrlRef = useRef(null); // Add a ref to store the video URL

  // Gestion de l'URL de la vidéo
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      videoUrlRef.current = url;
      return () => URL.revokeObjectURL(url);
    }
  }, [videoFile]);

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

  const handleExport = async ({ quality }) => {
    setIsExporting(true);
    try {
      // Simuler un export pour le moment
      // TODO: Implémenter l'export réel avec FFmpeg
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Pour le moment, on utilise juste un blob de la vidéo originale
      const response = await fetch(videoUrlRef.current);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      setExportedVideoUrl(url);
      setShowExport(false);
    } catch (error) {
      console.error('Export failed:', error);
      // TODO: Afficher une notification d'erreur
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!exportedVideoUrl) return;
    
    const a = document.createElement('a');
    a.href = exportedVideoUrl;
    a.download = 'clip.mp4'; // TODO: Générer un nom plus descriptif
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Si on a une vidéo exportée, afficher l'écran d'export
  if (exportedVideoUrl) {
    return (
      <ExportScreen
        videoUrl={exportedVideoUrl}
        onBack={() => setExportedVideoUrl(null)}
        onDownload={handleDownload}
      />
    );
  }

  return (
    <div className="flex flex-col w-full h-[calc(100vh-64px)] bg-light-background-primary dark:bg-dark-background-primary overflow-hidden">
      {/* Section d'édition principale */}
      <div className="w-full h-full max-w-[800px] mx-auto px-4 py-4 flex flex-col justify-center">
        <div className="w-full border border-light-border dark:border-dark-border rounded-lg p-4 bg-light-background-secondary dark:bg-dark-background-secondary">
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
              onClick={() => setShowExport(true)}
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
      </div>

      {/* Modal d'export */}
      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </div>
  );
};

export default VideoEditor;
