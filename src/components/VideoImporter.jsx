import React, { useCallback, useState } from 'react';
import { Player } from '@remotion/player';
import useNotifications from '../hooks/useNotifications';

const MAX_DURATION = 120; // 2 minutes en secondes

const VideoImporter = ({ onVideoSelect }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const notifications = useNotifications();

  const handleVideoUpload = useCallback((event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Vérifier le type de fichier
    if (!file.type.startsWith('video/')) {
      notifications.showError('Veuillez sélectionner un fichier vidéo valide');
      return;
    }

    // Créer une URL pour la prévisualisation
    const videoUrl = URL.createObjectURL(file);
    
    // Créer un élément vidéo temporaire pour obtenir la durée
    const video = document.createElement('video');
    video.src = videoUrl;
    
    video.onloadedmetadata = () => {
      const duration = video.duration;
      setVideoDuration(duration);
      
      if (duration > MAX_DURATION) {
        notifications.showWarning(`La vidéo dure ${Math.round(duration)} secondes. Vous devrez sélectionner un segment de ${MAX_DURATION} secondes maximum pour l'export.`);
      }
      
      setVideoFile(videoUrl);
      notifications.showSuccess('Vidéo importée avec succès');
      
      if (onVideoSelect) {
        onVideoSelect(file);
      }
    };

    video.onerror = () => {
      notifications.showError('Erreur lors du chargement de la vidéo');
      URL.revokeObjectURL(videoUrl);
    };
  }, [notifications, onVideoSelect]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="w-full max-w-xl">
        <label 
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Cliquez pour importer</span> ou glissez-déposez
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Formats supportés : MP4, WebM, MOV</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="video/*"
            onChange={handleVideoUpload}
          />
        </label>
      </div>

      {videoFile && (
        <div className="w-full max-w-4xl aspect-video">
          <Player
            component={() => (
              <video
                src={videoFile}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            )}
            durationInFrames={Math.round(videoDuration * 30)} // Conversion en frames (30 fps)
            compositionWidth={1920}
            compositionHeight={1080}
            fps={30}
            controls
          />
        </div>
      )}
    </div>
  );
};

export default VideoImporter;
