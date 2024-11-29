import React from 'react';
import { ArrowLeftIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';

export const ExportScreen = ({ videoUrl, onBack, onDownload }) => {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-light-background-primary dark:bg-dark-background-primary overflow-hidden">
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Retour à l'édition
        </Button>
        <Button
          variant="primary"
          onClick={onDownload}
          className="flex items-center gap-2"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          Télécharger
        </Button>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center">
          {/* Lecteur vidéo */}
          <div className="w-full aspect-video max-h-[70vh]">
            <video
              src={videoUrl}
              className="w-full h-full object-contain bg-black/50 rounded-lg"
              controls
            />
          </div>
        </div>
      </div>
    </div>
  );
};
