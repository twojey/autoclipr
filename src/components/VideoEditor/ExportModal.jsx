import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';

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

export const ExportModal = ({ isOpen, onClose, onExport, isExporting }) => {
  const [quality, setQuality] = useState('1080p');

  if (!isOpen) return null;

  const handleExport = () => {
    onExport({ quality });
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay de fond */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Contenu de la modale */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              Exporter le clip
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

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
              disabled={isExporting}
              variant="primary"
            >
              {isExporting ? 'Export en cours...' : 'Exporter'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
