import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { VideoCanvas } from './VideoCanvas';
import { VideoTimeline } from './VideoTimeline';
import { ExportModal } from './ExportModal';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Header } from '../Header/Header';

export const VideoEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoFile = location.state?.videoFile;

  // Rediriger vers l'accueil si pas de fichier vidéo
  useEffect(() => {
    if (!videoFile) {
      navigate('/');
    }
  }, [videoFile, navigate]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showExport, setShowExport] = useState(false);
  const [cutStart, setCutStart] = useState(0);
  const [cutEnd, setCutEnd] = useState(30);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && !e.target.closest('input, textarea')) {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="min-h-screen bg-light-background-primary dark:bg-dark-background-primary">
      <Header />
      
      <main className="pt-24 px-4 max-w-6xl mx-auto">
        <div className="w-full aspect-video bg-light-background-elevated dark:bg-dark-background-elevated rounded-xl overflow-hidden shadow-xl">
          <VideoCanvas
            videoFile={videoFile}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onDurationChange={setDuration}
            onTimeUpdate={setCurrentTime}
            onEnded={() => setIsPlaying(false)}
            onTogglePlay={() => setIsPlaying(prev => !prev)}
          />
        </div>

        <div className="mt-8">
          <VideoTimeline
            duration={duration}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onSeek={setCurrentTime}
            onTimeUpdate={setCurrentTime}
            onTogglePlay={() => setIsPlaying(prev => !prev)}
            cutStart={cutStart}
            cutEnd={cutEnd}
            onCutStartChange={setCutStart}
            onCutEndChange={setCutEnd}
            maxDuration={120}
          />
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Exporter
          </button>
        </div>
      </main>

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
