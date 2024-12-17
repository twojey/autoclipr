import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VideoCanvas } from './VideoCanvas';
import { VideoTimeline } from './VideoTimeline';
import { ExportDialog } from './ExportDialog';
import { useFFmpeg } from '../../hooks/useFFmpeg';

interface VideoEditorProps {
  videoFile: File;
  onBack: () => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({ videoFile, onBack }) => {
  const { extractAudio } = useFFmpeg();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  
  // États pour l'extraction audio
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  
  const [cutStart, setCutStart] = useState(0);
  const [cutEnd, setCutEnd] = useState(0);
  const [overlayDimensions] = useState({ width: 0, height: 0 });
  const [videoTransform, setVideoTransform] = useState({ x: 0, y: 0, scale: 1 });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement | null>(null);

  // Space bar handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in a text field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Prevent page scrolling with spacebar
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

  // Update cutEnd once duration is known
  useEffect(() => {
    if (duration > 0 && cutEnd === 0) {
      setCutEnd(Math.min(30, duration)); // Limiter la fin de la découpe à la durée de la vidéo
    }
  }, [duration, cutEnd]);

  // Ensure background video is always muted
  useEffect(() => {
    if (backgroundVideoRef.current) {
      backgroundVideoRef.current.muted = true;
    }
  }, []);

  const handleTransformChange = useCallback((transform: { x: number; y: number; scale: number }) => {
    setVideoTransform(transform);
  }, []);

  const handleExportDialogOpen = useCallback((open: boolean) => {
    setIsExportDialogOpen(open);
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleVideoRef = (element: HTMLVideoElement | null) => {
    videoRef.current = element;
  };

  // Gestionnaire d'extraction audio
  const handleExtractAudio = async () => {
    try {
      setIsExtracting(true);
      setExtractionProgress(0);
      setExtractionError(null);
      
      const blob = await extractAudio(videoFile, (progress) => {
        setExtractionProgress(progress);
      });
      
      setAudioBlob(blob);
    } catch (error) {
      console.error('Erreur lors de l\'extraction:', error);
      setExtractionError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsExtracting(false);
    }
  };

  // Gestionnaire de téléchargement
  const handleDownloadAudio = () => {
    if (!audioBlob) return;
    
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    const fileName = `${videoFile.name.replace(/\.[^/.]+$/, '')}_audio.mp3`;
    
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative h-full flex flex-col">
      <div className="h-full bg-gradient-to-tl from-gray-100 via-blue-100 to-blue-200 dark:from-gray-950 dark:via-purple-900 dark:to-purple-800 grid place-items-center">
        <div className="w-full max-w-[800px] px-4 flex flex-col -mt-8">
          <div className="w-full rounded-xl backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/40 dark:border-white/10 shadow-lg p-4">
            {/* Video preview */}
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
                isMuted={isMuted}
                onTimeUpdate={setCurrentTime}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                onToggleMute={handleMuteToggle}
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
      <div className="absolute bottom-4 right-4 flex gap-2">
        {/* Boutons existants */}
        
        {/* Section d'extraction audio */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExtractAudio}
            disabled={isExtracting}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isExtracting ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Extraction... {extractionProgress}%</span>
              </>
            ) : (
              'Extraire l\'audio'
            )}
          </button>
          
          {audioBlob && !isExtracting && (
            <button
              onClick={handleDownloadAudio}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <span>⬇️</span>
              <span>Télécharger l'audio</span>
            </button>
          )}
        </div>

        {extractionError && (
          <div className="absolute bottom-16 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
            {extractionError}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoEditor;
