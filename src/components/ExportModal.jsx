import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ExportModal = ({ onClose, onExport, progress, isExporting }) => {
  const exportOptions = [
    { id: 'standard', label: 'Standard (720p)', description: 'Qualité standard, taille de fichier réduite' },
    { id: 'hd', label: 'HD (1080p)', description: 'Haute qualité, taille de fichier moyenne' },
    { id: 'max', label: 'Max (1440p)', description: 'Qualité maximale, grande taille de fichier' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Exporter le clip
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              disabled={isExporting}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Options d'export */}
          {!isExporting && (
            <div className="space-y-4">
              {exportOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onExport(option.id)}
                  className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700
                           border-gray-200 dark:border-gray-700 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </div>
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Barre de progression */}
          {isExporting && (
            <div className="space-y-4">
              <div className="text-center text-gray-600 dark:text-gray-300">
                Export en cours... {progress}%
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
