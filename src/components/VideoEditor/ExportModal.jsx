import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';

const QUALITY_OPTIONS = [
  {
    id: '720p',
    label: 'Qualité basse (720p)',
    description: 'Fichier plus léger, qualité réduite',
    resolution: '1280x720'
  },
  {
    id: '1080p',
    label: 'Qualité moyenne (1080p)',
    description: 'Bon compromis taille/qualité',
    resolution: '1920x1080'
  },
  {
    id: '1440p',
    label: 'Haute qualité (1440p)',
    description: 'Recommandé pour un partage sur les réseaux sociaux',
    resolution: '2560x1440'
  }
];

export const ExportModal = ({ isOpen, onClose, onExport, isExporting, progress = 0, previewUrl, lastQuality }) => {
  const [quality, setQuality] = useState(lastQuality || '720p');

  if (!isOpen) return null;

  const handleExport = () => {
    onExport({ quality });
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay de fond */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={!isExporting ? onClose : undefined}
      />
      
      {/* Contenu de la modale */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {isExporting ? "Export en cours..." : previewUrl ? "Prévisualisation" : "Exporter le clip"}
            </h2>
            {!isExporting && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>

          {isExporting ? (
            <div className="space-y-4">
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Export en cours : {progress}%
                </p>
                <Button 
                  variant="destructive" 
                  onClick={onClose}
                  size="md"
                >
                  Annuler l'export
                </Button>
              </div>
            </div>
          ) : previewUrl ? (
            <div className="space-y-4">
              <div className="aspect-video w-full bg-black/50 rounded-lg overflow-hidden">
                <video
                  src={previewUrl}
                  className="w-full h-full object-contain"
                  controls
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    onExport(null);
                  }}
                >
                  Retour
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = previewUrl;
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
          ) : (
            <>
              {/* Options de qualité */}
              <div className="space-y-3">
                <label className="block text-sm font-medium mb-2">
                  Qualité d'export
                </label>
                {QUALITY_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors
                      ${quality === option.id 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    onClick={() => setQuality(option.id)}
                  >
                    <input
                      type="radio"
                      className="h-4 w-4 text-primary-500"
                      checked={quality === option.id}
                      onChange={() => setQuality(option.id)}
                    />
                    <div className="ml-3">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {option.description}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        Résolution: {option.resolution}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <Button 
                  onClick={onClose}
                  variant="outline"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleExport}
                  variant="primary"
                  disabled={isExporting}
                >
                  Exporter
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
