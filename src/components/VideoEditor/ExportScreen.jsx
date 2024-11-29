import React, { useRef } from 'react';
import { Button } from '../ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const ExportScreen = ({ isOpen, onClose, videoUrl }) => {
  const videoRef = useRef(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay de fond */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Contenu de la modale */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* En-tête */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-semibold">
                Prévisualisation
              </h2>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="p-4">
            {/* Lecteur vidéo */}
            <div className="w-full aspect-video max-h-[70vh]">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain bg-black/50 rounded-lg"
                controls
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={onClose}
              >
                Retour à l'édition
              </Button>
              <Button 
                variant="primary"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = videoUrl;
                  a.download = 'video-export.mp4';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
              >
                Télécharger
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
