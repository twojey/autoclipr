import React, { useState, useCallback, useRef } from 'react';
import { VideoTimeline } from '../components/VideoEditor/VideoTimeline';
import VideoCanvas from '../components/VideoCanvas/VideoCanvas';
import ExportModal from '../components/ExportModal/ExportModal';
import { exportVideo } from '../services/exportService';

const VideoEditor = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [cutStart, setCutStart] = useState(0);
  const [cutEnd, setCutEnd] = useState(0);
  const [videoScale, setVideoScale] = useState(1);
  const [videoPosition, setVideoPosition] = useState({ x: 0, y: 0 });

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoFile(url);
      setCutEnd(0); // Reset cut end when new file is loaded
    }
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoFile(url);
      setCutEnd(0);
    }
  }, []);

  const handleTimeUpdate = useCallback((time) => {
    setCurrentTime(time);
  }, []);

  const handleDurationChange = useCallback((newDuration) => {
    setDuration(newDuration);
    setCutEnd(Math.min(newDuration, 120)); // Limite de 2 minutes
  }, []);

  const handleExport = useCallback(async () => {
    if (!videoFile) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      const exportedVideoUrl = await exportVideo({
        videoFile,
        cutStart,
        cutEnd,
        videoScale,
        videoPosition,
        quality: 'medium',
        onProgress: (progress) => {
          setExportProgress(progress);
        },
      });

      // Create download link
      const link = document.createElement('a');
      link.href = exportedVideoUrl;
      link.download = 'exported-video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  }, [videoFile, cutStart, cutEnd, videoScale, videoPosition]);

  return (
    <div className="space-y-4">
      {!videoFile ? (
        <div 
          className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Create clips in seconds for free</h2>
          <div className="text-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Choose Video
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="mt-2 text-gray-500">or drag and drop a video file</p>
          </div>
        </div>
      ) : (
        <>
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            <VideoCanvas
              videoFile={videoFile}
              isPlaying={isPlaying}
              currentTime={currentTime}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
              videoRef={videoRef}
              scale={videoScale}
              position={videoPosition}
            />
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity"
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white bg-opacity-80">
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                )}
              </div>
            </button>
          </div>

          <div className="space-y-4">
            <VideoTimeline
              duration={duration}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onTimeUpdate={handleTimeUpdate}
              cutStart={cutStart}
              cutEnd={cutEnd}
              onCutStartChange={setCutStart}
              onCutEndChange={setCutEnd}
            />

            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <button
                  onClick={() => setVideoScale(s => Math.max(0.1, s - 0.1))}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <button
                  onClick={() => setVideoScale(s => Math.min(5, s + 0.1))}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <button
                onClick={() => setShowExportModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Export Clip
              </button>
            </div>
          </div>

          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            onExport={handleExport}
            isExporting={isExporting}
            progress={exportProgress}
            videoScale={videoScale}
            onScaleChange={setVideoScale}
            videoPosition={videoPosition}
            onPositionChange={setVideoPosition}
          />
        </>
      )}
    </div>
  );
};

export default VideoEditor;
