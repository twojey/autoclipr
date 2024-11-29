import React from 'react';

const ExportModal = ({
  isOpen,
  onClose,
  onExport,
  isExporting,
  progress,
  videoScale,
  onScaleChange,
  videoPosition,
  onPositionChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">Export Video</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Scale</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={videoScale}
              onChange={(e) => onScaleChange(parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-gray-500">{videoScale.toFixed(1)}x</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Position X</label>
            <input
              type="range"
              min="-200"
              max="200"
              value={videoPosition.x}
              onChange={(e) =>
                onPositionChange({ ...videoPosition, x: parseInt(e.target.value) })
              }
              className="w-full"
            />
            <span className="text-sm text-gray-500">{videoPosition.x}px</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Position Y</label>
            <input
              type="range"
              min="-200"
              max="200"
              value={videoPosition.y}
              onChange={(e) =>
                onPositionChange({ ...videoPosition, y: parseInt(e.target.value) })
              }
              className="w-full"
            />
            <span className="text-sm text-gray-500">{videoPosition.y}px</span>
          </div>

          {isExporting && (
            <div>
              <div className="h-2 bg-gray-200 rounded">
                <div
                  className="h-full bg-blue-600 rounded"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Exporting... {Math.round(progress * 100)}%
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              disabled={isExporting}
            >
              Cancel
            </button>
            <button
              onClick={onExport}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
