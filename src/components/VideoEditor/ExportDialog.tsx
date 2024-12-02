import React, { useCallback, useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { ExportController } from '../../services/export/ExportController';
import { useVideoContext } from '../../contexts/VideoContext';
import { useFFmpeg } from '../../hooks/useFFmpeg';

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
  const { duration } = useVideoContext();
  const { ffmpeg, isLoaded } = useFFmpeg();
  const [exportController, setExportController] = useState<ExportController | null>(null);

  useEffect(() => {
    if (open && overlayDimensions.width > 0 && overlayDimensions.height > 0 && ffmpeg && isLoaded) {
      const controller = ExportController.getInstance();
      controller.setFFmpeg(ffmpeg);
      controller.setOverlayDimensions(overlayDimensions);
      controller.setVideoTransform(videoTransform);
      setExportController(controller);
    }
  }, [open, overlayDimensions, videoTransform, ffmpeg, isLoaded]);

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
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-medium mb-4">
            {isExporting ? 'Exporting video...' : 'Export video'}
          </Dialog.Title>

          {isExporting ? (
            <div className="space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                Progress: {Math.round(progress * 100)}%
              </p>
            </div>
          ) : (
            <button
              onClick={handleExport}
              disabled={!exportController || !isLoaded}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Start Export
            </button>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
