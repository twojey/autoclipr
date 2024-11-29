import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';

export const ExportModal = ({ isOpen, onClose, onExport, isExporting }) => {
  const [quality, setQuality] = useState('high');
  const [format, setFormat] = useState('mp4');

  if (!isOpen) return null;

  const handleExport = () => {
    onExport({ quality, format });
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay de fond */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Contenu de la modale */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">
              Exporter la vidéo
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Options d'export */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Qualité
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 px-3 py-2"
              >
                <option value="high">Haute (1080p)</option>
                <option value="medium">Moyenne (720p)</option>
                <option value="low">Basse (480p)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 px-3 py-2"
              >
                <option value="mp4">MP4</option>
                <option value="webm">WebM</option>
              </select>
            </div>
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
            >
              {isExporting ? 'Export en cours...' : 'Exporter'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
