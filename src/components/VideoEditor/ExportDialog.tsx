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
        height: Math.min(selectedQuality.resolution * (overlayDimensions.height / overlayDimensions.width), overlayDimensions.height)
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

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [videoRef, backgroundVideoRef, duration, exportController, onClose, startTime, endTime, isLoaded]);

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!isExporting) onClose();
      }}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30 dark:bg-white/10" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl w-full">
          <Dialog.Title className="text-xl font-medium mb-4 text-gray-900 dark:text-white">
            {isExporting ? 'Exporting video...' : 'Export video'}
          </Dialog.Title>

          {isExporting ? (
            <div className="space-y-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Progress: {Math.round(progress * 100)}%
              </p>
            </div>
          ) : (
            <>
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
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
                        }
                        relative flex cursor-pointer rounded-lg px-4 py-3 shadow-md focus:outline-none`
                      }
                    >
                      {({ checked }) => (
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center">
                            <div className="text-sm">
                              <RadioGroup.Label
                                as="p"
                                className={`font-medium ${
                                  checked ? 'text-white' : 'text-gray-900 dark:text-white'
                                }`}
                              >
                                {option.name} ({option.label})
                              </RadioGroup.Label>
                              <RadioGroup.Description
                                as="span"
                                className={`inline ${
                                  checked ? 'text-white' : 'text-gray-500 dark:text-gray-300'
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
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </button>
                <button
                  onClick={handleExport}
                  disabled={!exportController || !isLoaded}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Export
                </button>
              </div>
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
