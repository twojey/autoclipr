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
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedVideoUrl, setExportedVideoUrl] = useState(null);
  const [lastQuality, setLastQuality] = useState('720p');
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

  const handleExport = async (options) => {
    // Si options est null, on réinitialise l'état pour revenir au choix de la qualité
    if (!options) {
      setExportedVideoUrl(null);
      setExportProgress(0);
      return;
    }

    const { quality } = options;
    setLastQuality(quality);
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simuler une progression
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Simuler l'export final
      setExportedVideoUrl(URL.createObjectURL(videoFile));
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
  if (exportedVideoUrl && showPreview) {
    return (
      <ExportScreen
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        videoUrl={exportedVideoUrl}
      />
    );
  }

  return (
    <div className="h-full bg-gradient-to-tl from-gray-100 via-blue-100 to-blue-200 dark:from-gray-950 dark:via-purple-900 dark:to-purple-800 grid place-items-center">
      {/* Section d'édition principale */}
      <div className="w-full max-w-[800px] px-4 flex flex-col -mt-8">
        <div className="w-full rounded-xl backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/40 dark:border-white/10 shadow-lg p-4">
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
        onClose={() => {
          setShowExport(false);
          setExportedVideoUrl(null);
          setExportProgress(0);
        }}
        onExport={handleExport}
        isExporting={isExporting}
        progress={exportProgress}
        previewUrl={exportedVideoUrl}
        lastQuality={lastQuality}
      />
    </div>
  );
};

export default VideoEditor;
