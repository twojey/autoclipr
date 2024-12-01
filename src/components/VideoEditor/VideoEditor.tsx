import React, { useState, useRef, useEffect } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { VideoCanvas } from './VideoCanvas';
import { VideoTimeline } from './VideoTimeline';

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

  // Mettre à jour cutEnd une fois que la durée est connue
  useEffect(() => {
    if (duration > 0 && cutEnd === 0) {
      setCutEnd(Math.min(30, duration)); // 30 secondes par défaut ou la durée totale si plus courte
    }
  }, [duration, cutEnd]);

  return (
    <div className="h-full bg-gradient-to-tl from-gray-100 via-blue-100 to-blue-200 dark:from-gray-950 dark:via-purple-900 dark:to-purple-800 grid place-items-center">
      <div className="w-full max-w-[800px] px-4 flex flex-col -mt-8">
        <div className="w-full rounded-xl backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/40 dark:border-white/10 shadow-lg p-4">
          {/* Contrôles de navigation */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={onBack}
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Retour
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Exporter</span>
            </button>
          </div>

          {/* Aperçu vidéo */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-4">
            <VideoCanvas
              videoFile={videoFile}
              isPlaying={isPlaying}
              currentTime={currentTime}
              onTimeUpdate={setCurrentTime}
              onDurationChange={setDuration}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
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
    </div>
  );
};

export default VideoEditor;
