import { useState, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import { useNotifications } from './useNotifications';

const useFFmpeg = () => {
  const [ffmpeg] = useState(() => new FFmpeg());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showError, showInfo, showSuccess } = useNotifications();

  const load = useCallback(async () => {
    try {
      if (!isLoaded) {
        showInfo('Chargement de FFmpeg...');
        // Load ffmpeg core
        await ffmpeg.load({
          coreURL: await toBlobURL(
            '/ffmpeg-core.js',
            'text/javascript',
          ),
          wasmURL: await toBlobURL(
            '/ffmpeg-core.wasm',
            'application/wasm',
          ),
        });
        setIsLoaded(true);
        showSuccess('FFmpeg chargé avec succès');
      }
    } catch (error) {
      showError('Erreur lors du chargement de FFmpeg');
      console.error('Error loading FFmpeg:', error);
      throw error;
    }
  }, [isLoaded, showError, showInfo, showSuccess]);

  const processVideo = useCallback(async (
    inputFile,
    outputName,
    ffmpegCommand,
    onProgress
  ) => {
    if (!isLoaded) {
      await load();
    }

    try {
      setIsProcessing(true);
      showInfo('Traitement de la vidéo en cours...');

      // Write input file to memory
      await ffmpeg.writeFile('input', await fetchFile(inputFile));

      // Set up progress handling
      ffmpeg.on('progress', ({ progress, time }) => {
        onProgress?.({ progress, time });
      });

      // Execute FFmpeg command
      await ffmpeg.exec(ffmpegCommand);

      // Read the output file
      const data = await ffmpeg.readFile(outputName);
      
      showSuccess('Traitement terminé avec succès');
      return new Blob([data], { type: 'video/mp4' });
    } catch (error) {
      showError('Erreur lors du traitement de la vidéo');
      console.error('Error processing video:', error);
      throw error;
    } finally {
      setIsProcessing(false);
      ffmpeg.off('progress');
    }
  }, [isLoaded, load, showError, showInfo, showSuccess]);

  const captureFrame = useCallback(async (
    inputFile,
    timeInSeconds,
    outputName = 'thumbnail.jpg'
  ) => {
    const command = [
      '-ss', timeInSeconds.toString(),
      '-i', 'input',
      '-vframes', '1',
      '-q:v', '2',
      outputName
    ];

    try {
      showInfo('Capture de la frame en cours...');
      await processVideo(inputFile, outputName, command);
      const data = await ffmpeg.readFile(outputName);
      showSuccess('Frame capturée avec succès');
      return new Blob([data], { type: 'image/jpeg' });
    } catch (error) {
      showError('Erreur lors de la capture de la frame');
      console.error('Error capturing frame:', error);
      throw error;
    }
  }, [processVideo, showError, showInfo, showSuccess]);

  const trimVideo = useCallback(async (
    inputFile,
    startTime,
    endTime,
    outputName = 'output.mp4'
  ) => {
    const duration = endTime - startTime;
    const command = [
      '-ss', startTime.toString(),
      '-i', 'input',
      '-t', duration.toString(),
      '-c', 'copy',
      outputName
    ];

    try {
      return await processVideo(inputFile, outputName, command);
    } catch (error) {
      showError('Erreur lors du découpage de la vidéo');
      console.error('Error trimming video:', error);
      throw error;
    }
  }, [processVideo, showError]);

  return {
    isLoaded,
    isProcessing,
    load,
    processVideo,
    captureFrame,
    trimVideo,
  };
};

export default useFFmpeg;
