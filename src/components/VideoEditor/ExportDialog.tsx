import React, { useCallback, useEffect, useState } from 'react';
import { Dialog, RadioGroup } from '@headlessui/react';
import { ExportController } from '../../services/export/ExportController';
import { useVideoContext } from '../../contexts/VideoContext';
import { useFFmpeg } from '../../hooks/useFFmpeg';

interface ExportQualityOption {
  id: string;
  name: string;
  description: string;
  resolution: number;
  label: string;
}

const exportQualityOptions: ExportQualityOption[] = [
  { id: 'fast', name: '480p', description: 'Fast export, smaller file size', resolution: 480, label: 'FAST' },
  { id: 'balanced', name: '720p', description: 'Balanced quality and size', resolution: 720, label: 'BALANCED' },
  { id: 'hd', name: '1440p', description: 'High quality, larger file size', resolution: 1440, label: 'HD' },
];

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  backgroundVideoRef: React.RefObject<HTMLVideoElement>;
  overlayDimensions: { width: number; height: number };
  videoTransform: { x: number; y: number; scale: number };
  startTime?: number;
  endTime?: number;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  videoRef,
  backgroundVideoRef,
  overlayDimensions,
  videoTransform,
  startTime = 0,
  endTime,
}) => {
  const [progress, setProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState(exportQualityOptions[0]);
  const { duration } = useVideoContext();
  const { ffmpeg, isLoaded } = useFFmpeg();
  const [exportController, setExportController] = useState<ExportController | null>(null);

  useEffect(() => {
    if (open && overlayDimensions.width > 0 && overlayDimensions.height > 0 && ffmpeg && isLoaded) {
      const controller = ExportController.getInstance();
      controller.setFFmpeg(ffmpeg);
      controller.setOverlayDimensions({
        width: Math.min(selectedQuality.resolution, overlayDimensions.width),
        height: Math.min(selectedQuality.resolution * (overlayDimensions.height / overlayDimensions.width), overlayDimensions.height),
      });
      controller.setVideoTransform(videoTransform);
      setExportController(controller);
    }
  }, [open, overlayDimensions, videoTransform, ffmpeg, isLoaded, selectedQuality]);

  const handleExport = useCallback(async () => {
    if (!videoRef.current || !exportController || !isLoaded) return;

    setIsExporting(true);
    setProgress(0);

    try {
      console.log(`Exporting video from ${startTime}s to ${endTime}s`);
      
      const blob = await exportController.exportVideo(
        videoRef.current,
        backgroundVideoRef.current,
        {
          startTime,
          endTime: typeof endTime === 'number' ? endTime : duration,
          fps: 30,
          onProgress: (p) => setProgress(p)
        }
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exported_video.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Mettre en pause les vidéos
      if (videoRef.current) {
        videoRef.current.pause();
      }
      if (backgroundVideoRef.current) {
        backgroundVideoRef.current.pause();
      }

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [videoRef, backgroundVideoRef, duration, exportController, onClose, startTime, endTime, isLoaded]);

  // Gestionnaire de fermeture du modal
  const handleClose = useCallback(() => {
    if (!isExporting) {
      // Mettre en pause les vidéos à la fermeture manuelle
      if (videoRef.current) {
        videoRef.current.pause();
      }
      if (backgroundVideoRef.current) {
        backgroundVideoRef.current.pause();
      }
      onClose();
    }
  }, [isExporting, videoRef, backgroundVideoRef, onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className="relative z-50"
    >
      {/* Overlay with blur and dark effect */}
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Dialog content */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel 
          className={`mx-auto rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all duration-300 ${
            isExporting ? 'max-w-sm w-full' : 'max-w-md w-full'
          }`}
        >
          <Dialog.Title className="text-xl font-medium mb-4 text-gray-900 dark:text-white">
            Export video
          </Dialog.Title>

          <div className="relative">
            {/* Export options */}
            <div
              className={`transition-all duration-300 ${
                isExporting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              <RadioGroup value={selectedQuality} onChange={setSelectedQuality} className="mt-4">
                <RadioGroup.Label className="sr-only">Export quality</RadioGroup.Label>
                <div className="space-y-2">
                  {exportQualityOptions.map((option) => (
                    <RadioGroup.Option
                      key={option.id}
                      value={option}
                      className={({ checked }) =>
                        `${
                          checked
                            ? 'border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }
                        relative flex cursor-pointer rounded-lg px-4 py-3 shadow-sm focus:outline-none`
                      }
                    >
                      {({ checked }) => (
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center">
                            <div className="text-sm">
                              <RadioGroup.Label
                                as="p"
                                className={`font-medium ${
                                  checked ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                                }`}
                              >
                                {option.name} ({option.label})
                              </RadioGroup.Label>
                              <RadioGroup.Description
                                as="span"
                                className={`inline ${
                                  checked ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-300'
                                }`}
                              >
                                {option.description}
                              </RadioGroup.Description>
                            </div>
                          </div>
                        </div>
                      )}
                    </RadioGroup.Option>
                  ))}
                </div>
              </RadioGroup>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent"
                >
                  Back
                </button>
                <button
                  onClick={handleExport}
                  disabled={!exportController || !isLoaded}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed border-2 border-blue-600 hover:border-blue-700 disabled:border-gray-400"
                >
                  Export
                </button>
              </div>
            </div>

            {/* Export progress */}
            <div
              className={`absolute inset-0 transition-all duration-300 ${
                isExporting ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <div className="h-full flex flex-col justify-center space-y-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                  Exporting video... {Math.round(progress * 100)}%
                </p>
                <button
                  onClick={() => {
                    if (exportController) {
                      exportController.cancelExport();
                    }
                    setIsExporting(false);
                    setProgress(0);
                  }}
                  className="mt-4 w-full px-4 py-2 border-2 border-red-500 dark:border-red-500 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent transition-colors duration-200"
                >
                  Cancel Export
                </button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
