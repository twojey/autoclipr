import { useEffect, useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export const useFFmpeg = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!ffmpegRef.current.loaded) {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
        await ffmpegRef.current.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
      }

      setIsReady(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load FFmpeg'));
    } finally {
      setIsLoading(false);
    }
  };

  const extractAudio = async (
    videoFile: File,
    onProgress?: (progress: number) => void
  ): Promise<Blob> => {
    if (!isReady) {
      throw new Error('FFmpeg n\'est pas prêt');
    }

    const ffmpeg = ffmpegRef.current;
    const inputFileName = `input-${Date.now()}.mp4`;
    const outputFileName = `output-${Date.now()}.mp3`;

    try {
      // Écrire le fichier d'entrée
      await ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

      // Configurer le callback de progression
      ffmpeg.on('progress', ({ progress }) => {
        if (onProgress) {
          onProgress(Math.round(progress * 100));
        }
      });

      // Extraire l'audio avec des paramètres optimisés
      await ffmpeg.exec([
        '-i', inputFileName,
        '-vn',                // Pas de vidéo
        '-acodec', 'libmp3lame', // Codec MP3
        '-q:a', '2',         // Qualité VBR (0 meilleure - 9 pire)
        '-y',                // Écraser le fichier de sortie
        outputFileName
      ]);

      // Lire le fichier de sortie
      const data = await ffmpeg.readFile(outputFileName);
      const audioBlob = new Blob([data], { type: 'audio/mp3' });

      // Nettoyer
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);

      return audioBlob;
    } catch (error) {
      console.error('Erreur lors de l\'extraction:', error);
      throw error;
    }
  };

  return {
    ffmpeg: ffmpegRef.current,
    isReady,
    isLoading,
    error,
    extractAudio
  };
};
