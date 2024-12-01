import { useEffect, useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

const logger = {
  info: (message: string) => console.log(`[FFmpeg] ℹ️ ${message}`),
  success: (message: string) => console.log(`[FFmpeg] ✅ ${message}`),
  error: (message: string, error?: any) => console.error(`[FFmpeg] ❌ ${message}`, error || ''),
  progress: (progress: number) => console.log(`[FFmpeg] 📊 Chargement: ${(progress * 100).toFixed(1)}%`)
};

export const useFFmpeg = () => {
  const [ffmpegLoaded, setFfmpegLoaded] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const loadFFmpeg = async () => {
      if (loadingRef.current || ffmpeg) return;
      loadingRef.current = true;

      try {
        logger.info('Initialisation de FFmpeg...');
        const instance = new FFmpeg();

        instance.on('log', ({ message }) => {
          logger.info(message);
        });

        instance.on('progress', ({ progress }) => {
          logger.progress(progress);
        });

        // Vérification des fichiers FFmpeg
        try {
          const coreResponse = await fetch('/ffmpeg/ffmpeg-core.js');
          const wasmResponse = await fetch('/ffmpeg/ffmpeg-core.wasm');

          if (!coreResponse.ok || !wasmResponse.ok) {
            throw new Error(`Fichiers FFmpeg inaccessibles (Core: ${coreResponse.status}, WASM: ${wasmResponse.status})`);
          }
          logger.success('Fichiers FFmpeg vérifiés avec succès');
        } catch (error) {
          logger.error('Fichiers FFmpeg inaccessibles', error);
          throw error;
        }

        // Préparation des URLs
        logger.info('Préparation des ressources...');
        const baseURL = '/ffmpeg';
        const coreURL = await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          'text/javascript'
        );
        const wasmURL = await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          'application/wasm'
        );

        // Chargement de FFmpeg
        try {
          await instance.load({
            coreURL,
            wasmURL
          });
          logger.success('FFmpeg chargé avec succès');
          setFFmpeg(instance);
          setFfmpegLoaded(true);
        } catch (loadError) {
          logger.error('Échec du chargement de FFmpeg', {
            type: loadError instanceof Error ? loadError.name : 'Unknown',
            message: loadError instanceof Error ? loadError.message : String(loadError)
          });
          throw loadError;
        }
      } catch (err) {
        logger.error('Erreur fatale', err);
        setFfmpegLoaded(false);
        setError(err instanceof Error ? err.message : 'Erreur inattendue lors du chargement de FFmpeg');
      }
    };

    loadFFmpeg();

    return () => {
      loadingRef.current = false;
    };
  }, [ffmpeg]);

  return {
    ffmpeg,
    isLoaded: ffmpegLoaded,
    error
  };
};
