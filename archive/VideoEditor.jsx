import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Heading } from '../components/ui/Typography';
import VideoPlayer from '../components/video/VideoPlayer';
import VideoUploader from '../components/video/VideoUploader';
import VideoTimeline from '../components/video/VideoTimeline';
import VideoControls from '../components/video/VideoControls';
import useFFmpeg from '../hooks/useFFmpeg';
import { useNotifications } from '../hooks/useNotifications';

const VideoEditor = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [thumbnails, setThumbnails] = useState([]);

  const { 
    isLoaded, 
    isProcessing, 
    load, 
    captureFrame, 
    trimVideo 
  } = useFFmpeg();
  
  const { showError } = useNotifications();

  useEffect(() => {
    // Charger FFmpeg au montage du composant
    load().catch(console.error);
  }, [load]);

  const handleUpload = useCallback((file) => {
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
  }, []);

  const handleTimeUpdate = useCallback((time) => {
    setCurrentTime(time);
  }, []);

  const handleDurationChange = useCallback((newDuration) => {
    setDuration(newDuration);
  }, []);

  const generateThumbnails = useCallback(async () => {
    if (!videoFile || !isLoaded) return;

    try {
      const thumbnailCount = 10;
      const interval = duration / thumbnailCount;
      const newThumbnails = [];

      for (let i = 0; i < thumbnailCount; i++) {
        const time = i * interval;
        const thumbnail = await captureFrame(videoFile, time);
        newThumbnails.push({
          url: URL.createObjectURL(thumbnail),
          time,
        });
      }

      setThumbnails(newThumbnails);
    } catch (error) {
      console.error('Error generating thumbnails:', error);
      showError('Erreur lors de la génération des miniatures');
    }
  }, [videoFile, isLoaded, duration, captureFrame, showError]);

  useEffect(() => {
    if (duration > 0 && videoFile && isLoaded) {
      generateThumbnails();
    }
  }, [duration, videoFile, isLoaded, generateThumbnails]);

  const handleCapture = useCallback(async () => {
    if (!videoFile) return;

    try {
      const frame = await captureFrame(videoFile, currentTime);
      const url = URL.createObjectURL(frame);
      const link = document.createElement('a');
      link.href = url;
      link.download = `capture_${Math.floor(currentTime)}.jpg`;
      link.click();
    } catch (error) {
      console.error('Error capturing frame:', error);
      showError('Erreur lors de la capture de la frame');
    }
  }, [videoFile, currentTime, captureFrame, showError]);

  const handleTrim = useCallback(async () => {
    if (!videoFile) return;

    try {
      const trimmedVideo = await trimVideo(videoFile, currentTime, duration);
      const url = URL.createObjectURL(trimmedVideo);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'video_trimmed.mp4';
      link.click();
    } catch (error) {
      console.error('Error trimming video:', error);
      showError('Erreur lors du découpage de la vidéo');
    }
  }, [videoFile, currentTime, duration, trimVideo, showError]);

  const handleExport = useCallback(() => {
    if (!videoUrl) return;

    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = 'video_edited.mp4';
    link.click();
  }, [videoUrl]);

  const handleDelete = useCallback(() => {
    setVideoFile(null);
    setVideoUrl(null);
    setCurrentTime(0);
    setDuration(0);
    setThumbnails([]);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card>
        <Heading level="h1" gradient>
          Éditeur Vidéo
        </Heading>
      </Card>

      {!videoFile ? (
        <VideoUploader onUpload={handleUpload} />
      ) : (
        <div className="space-y-4">
          <VideoPlayer
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
          />

          <VideoTimeline
            duration={duration}
            currentTime={currentTime}
            thumbnails={thumbnails}
            onTimeChange={handleTimeUpdate}
          />

          <VideoControls
            onTrim={handleTrim}
            onCapture={handleCapture}
            onExport={handleExport}
            onDelete={handleDelete}
            isProcessing={isProcessing}
          />
        </div>
      )}
    </div>
  );
};

export default VideoEditor;
