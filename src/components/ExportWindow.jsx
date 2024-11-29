import React, { useState } from 'react';
import { ArrowLeftIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { Button } from './ui/Button';

export const ExportWindow = ({ onClose, videoFile, currentTime }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    setIsExporting(true);
    // Logique d'export à implémenter
    setProgress(100);
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-light-background-elevated dark:bg-dark-background-elevated rounded-xl shadow-xl max-w-lg w-full mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
            Exporter la vidéo
          </h2>

          <div className="space-y-4">
            {isExporting ? (
              <div className="space-y-2">
                <div className="h-2 bg-light-background-secondary dark:bg-dark-background-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Export en cours... {progress}%
                </p>
              </div>
            ) : (
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                La vidéo sera exportée au format 9:16 avec tous les éléments visibles.
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-light-border dark:border-dark-border p-4 flex justify-between">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex items-center gap-2"
            disabled={isExporting}
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Retour à l'édition
          </Button>

          <Button
            variant="primary"
            onClick={handleExport}
            className="flex items-center gap-2"
            disabled={isExporting}
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            {isExporting ? 'Export en cours...' : 'Exporter'}
          </Button>
        </div>
      </div>
    </div>
  );
};
