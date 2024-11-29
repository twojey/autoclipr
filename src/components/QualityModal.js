import React, { useState } from 'react';

const QUALITY_OPTIONS = [
  { id: '720p', label: '720p - Basse qualité', width: 1280, height: 720 },
  { id: '1080p', label: '1080p - Qualité standard', width: 1920, height: 1080 },
  { id: '2k', label: '2K - Haute qualité', width: 2560, height: 1440 },
];

const QualityModal = ({ isOpen, onClose, onSelectQuality, isExporting, exportProgress, exportError }) => {
  const [selectedQuality, setSelectedQuality] = useState(null);

  if (!isOpen) return null;

  const handleQualitySelect = (quality) => {
    setSelectedQuality(quality);
    onSelectQuality(quality);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        {!isExporting ? (
          <>
            <h2 className="text-xl font-semibold mb-4">Choisir la qualité d'export</h2>
            
            <div className="space-y-3">
              {QUALITY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleQualitySelect(option)}
                  className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-400">
                    Résolution: {option.width}x{option.height}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="mt-4 w-full p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Annuler
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">Export en cours</h2>
            
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
              <div 
                className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              ></div>
            </div>

            <div className="text-center mb-4">
              {exportProgress < 30 && "Préparation de l'export..."}
              {exportProgress >= 30 && exportProgress < 70 && "Rendu de la vidéo..."}
              {exportProgress >= 70 && exportProgress < 100 && "Finalisation..."}
              {exportProgress === 100 && "Export terminé !"}
            </div>

            {exportError && (
              <div className="text-red-500 text-center mb-4">
                Erreur: {exportError}
              </div>
            )}

            {exportProgress === 100 ? (
              <button
                onClick={onClose}
                className="w-full p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Fermer
              </button>
            ) : (
              <button
                disabled
                className="w-full p-2 bg-gray-600 rounded-lg cursor-not-allowed"
              >
                Export en cours...
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QualityModal;
