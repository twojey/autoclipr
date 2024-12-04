import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { FrameRenderer } from './FrameRenderer';

interface ExportOptions {
  startTime: number;
  endTime: number;
  fps?: number;
  onProgress?: (progress: number) => void;
}

interface MozVideoElement extends HTMLVideoElement {
  mozDecodedFrames?: number;
}

export class ExportController {
  private static instance: ExportController | null = null;
  private ffmpeg: FFmpeg | null = null;
  private readonly CHUNK_SIZE = 30;
  private frameRenderer: FrameRenderer | null = null;
  private overlayDimensions: { width: number; height: number };
  private videoTransform: { x: number; y: number; scale: number };
  private isCancelled: boolean = false;
  private currentAbortController: AbortController | null = null;

  private constructor() {
    this.overlayDimensions = { width: 0, height: 0 };
    this.videoTransform = { x: 0, y: 0, scale: 1 };
  }

  public static getInstance(): ExportController {
    if (!ExportController.instance) {
      ExportController.instance = new ExportController();
    }
    return ExportController.instance;
  }

  public setFFmpeg(ffmpeg: FFmpeg) {
    this.ffmpeg = ffmpeg;
  }

  public setOverlayDimensions(dimensions: { width: number; height: number }) {
    if (dimensions.width <= 0 || dimensions.height <= 0) {
      throw new Error(`Invalid overlay dimensions: ${dimensions.width}x${dimensions.height}`);
    }
    this.overlayDimensions = dimensions;
    this.initFrameRenderer();
  }

  public setVideoTransform(transform: { x: number; y: number; scale: number }) {
    this.videoTransform = transform;
  }

  private initFrameRenderer() {
    this.frameRenderer = new FrameRenderer({
      width: 1080,
      height: 1920,
      overlay: {
        width: this.overlayDimensions.width,
        height: this.overlayDimensions.height
      }
    });
  }

  private async seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const handleSeeked = () => {
        video.removeEventListener('seeked', handleSeeked);
        video.removeEventListener('error', handleError);
        resolve();
      };

      const handleError = (error: Event) => {
        video.removeEventListener('seeked', handleSeeked);
        video.removeEventListener('error', handleError);
        reject(new Error('Failed to seek video: ' + error.type));
      };

      video.addEventListener('seeked', handleSeeked);
      video.addEventListener('error', handleError);
      
      video.currentTime = time;
    });
  }

  private async processFrame(
    video: HTMLVideoElement,
    backgroundVideo: HTMLVideoElement | null,
    time: number,
    frameNumber: number
  ): Promise<void> {
    if (!this.frameRenderer || !this.ffmpeg) {
      throw new Error('FrameRenderer or FFmpeg not initialized.');
    }

    try {
      const frame = await this.frameRenderer.renderFrame(
        video,
        backgroundVideo,
        time,
        this.videoTransform
      );

      const frameData = new Uint8Array(await frame.arrayBuffer());
      const filename = `frame_${frameNumber.toString().padStart(6, '0')}.jpg`;
      await this.ffmpeg.writeFile(filename, frameData);
    } catch (error) {
      console.error(`Error processing frame at ${time}s:`, error);
      throw error;
    }
  }

  private async encodeVideo(
    startFrame: number,
    numFrames: number,
    fps: number,
    outputFile: string,
    audioFile: string | null = null
  ): Promise<void> {
    if (!this.ffmpeg) throw new Error('FFmpeg not initialized');

    const inputFile = 'concat.txt';
    
    try {
      // Créer le fichier de concaténation
      const fileList = Array.from({ length: numFrames }, (_, i) => {
        const frameNum = startFrame + i;
        return `file 'frame_${frameNum.toString().padStart(6, '0')}.jpg'`;
      }).join('\n');
      
      await this.ffmpeg.writeFile(inputFile, fileList);

      // Préparer la commande FFmpeg de base pour la vidéo
      const ffmpegCommand = [
        '-f', 'concat',
        '-safe', '0',
        '-i', inputFile
      ];

      // Ajouter l'entrée audio si disponible
      if (audioFile) {
        ffmpegCommand.push('-i', audioFile);
      }

      // Ajouter les options de sortie
      ffmpegCommand.push(
        '-c:v', 'mpeg4',
        '-q:v', '2',
        '-pix_fmt', 'yuv420p',
        '-r', fps.toString()
      );

      // Ajouter les options audio si nécessaire
      if (audioFile) {
        ffmpegCommand.push(
          '-c:a', 'aac',
          '-strict', 'experimental',
          '-map', '0:v:0',
          '-map', '1:a:0'
        );
      }

      // Ajouter le fichier de sortie
      ffmpegCommand.push(outputFile);

      console.log('FFmpeg command:', ffmpegCommand.join(' '));

      // Encoder la vidéo
      await this.ffmpeg.exec(ffmpegCommand);

      // Nettoyer le fichier de concaténation
      await this.ffmpeg.deleteFile(inputFile);
    } catch (error) {
      console.error('Error encoding video:', error);
      throw error;
    }
  }

  private async extractAudio(
    video: HTMLVideoElement,
    startTime: number,
    endTime: number
  ): Promise<string | null> {
    if (!this.ffmpeg) throw new Error('FFmpeg not initialized');
    
    try {
      // Obtenir les données de la vidéo
      const videoBlob = await fetch(video.src).then(r => r.blob());
      const videoData = new Uint8Array(await videoBlob.arrayBuffer());
      const inputFile = 'input.mp4';
      const audioFile = 'audio.m4a';

      // Écrire le fichier vidéo
      await this.ffmpeg.writeFile(inputFile, videoData);

      // Extraire l'audio avec le bon timing
      await this.ffmpeg.exec([
        '-i', inputFile,
        '-ss', startTime.toString(),
        '-t', (endTime - startTime).toString(),
        '-vn',
        '-c:a', 'aac',
        '-strict', 'experimental',
        '-b:a', '192k',
        audioFile
      ]);

      // Vérifier si le fichier audio a été créé
      try {
        await this.ffmpeg.readFile(audioFile);
        console.log('Audio file created successfully');
        // Nettoyer le fichier d'entrée
        await this.ffmpeg.deleteFile(inputFile);
        return audioFile;
      } catch (error) {
        console.error('Audio extraction failed:', error);
        return null;
      }
    } catch (error) {
      console.error('Error extracting audio:', error);
      return null;
    }
  }

  private async cleanupFrames(startFrame: number, numFrames: number) {
    if (!this.ffmpeg) return;
    
    for (let i = 0; i < numFrames; i++) {
      const frameNum = startFrame + i;
      const filename = `frame_${frameNum.toString().padStart(6, '0')}.jpg`;
      try {
        await this.ffmpeg.deleteFile(filename);
      } catch (error) {
        console.warn(`Failed to delete ${filename}:`, error);
      }
    }
  }

  private async getVideoFPS(video: HTMLVideoElement): Promise<number> {
    const mozVideo = video as MozVideoElement;
    if (mozVideo.mozDecodedFrames !== undefined) {
      // Firefox specific
      await new Promise(resolve => setTimeout(resolve, 100)); // Petit délai pour laisser Firefox calculer les frames
      return mozVideo.mozDecodedFrames / video.currentTime;
    }
    
    // Pour les autres navigateurs, on utilise une approche basée sur requestVideoFrameCallback
    // si disponible, sinon on utilise une valeur par défaut
    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
      return new Promise((resolve) => {
        let lastTime: number | null = null;
        let frames = 0;
        let rafId: number;

        const frameCallback = (now: DOMHighResTimeStamp, metadata: any) => {
          if (lastTime === null) {
            lastTime = now;
          } else {
            frames++;
            const elapsed = (now - lastTime) / 1000; // Convertir en secondes
            if (elapsed >= 1) { // Mesurer sur 1 seconde
              const fps = Math.round(frames / elapsed);
              cancelAnimationFrame(rafId);
              video.currentTime = 0; // Remettre la vidéo au début
              resolve(fps);
              return;
            }
          }
          rafId = requestAnimationFrame(() => {
            (video as any).requestVideoFrameCallback(frameCallback);
          });
        };

        // Démarrer la mesure
        video.currentTime = 0;
        video.muted = true;
        video.play();
        (video as any).requestVideoFrameCallback(frameCallback);
      });
    }

    // Valeur par défaut si aucune méthode n'est disponible
    return Promise.resolve(30);
  }

  public cancelExport() {
    this.isCancelled = true;
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }
  }

  public async exportVideo(
    video: HTMLVideoElement,
    backgroundVideo: HTMLVideoElement | null,
    options: ExportOptions
  ): Promise<Blob> {
    if (!this.ffmpeg || !this.frameRenderer) {
      throw new Error('FFmpeg or FrameRenderer not initialized');
    }

    this.isCancelled = false;
    this.currentAbortController = new AbortController();
    
    const { startTime, endTime, onProgress } = options;
    const duration = endTime - startTime;
    const fps = await this.getVideoFPS(video);
    const totalFrames = Math.ceil(duration * fps);
    const outputFile = 'output.mp4';
    let audioFile: string | null = null;

    try {
      // 1. Extraire l'audio
      console.log('Extracting audio...');
      audioFile = await this.extractAudio(video, startTime, endTime);
      if (this.isCancelled) throw new Error('Export cancelled');

      // 2. Générer toutes les frames
      for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
        if (this.isCancelled) throw new Error('Export cancelled');
        
        const time = startTime + (frameIndex / fps);
        console.log(`Processing frame ${frameIndex + 1}/${totalFrames} at ${time.toFixed(3)}s`);
        
        await this.processFrame(video, backgroundVideo, time, frameIndex);
        onProgress?.((frameIndex + 1) / totalFrames);
      }

      if (this.isCancelled) throw new Error('Export cancelled');

      // 3. Encoder la vidéo complète avec l'audio
      console.log('Encoding video...');
      await this.encodeVideo(0, totalFrames, fps, outputFile, audioFile);

      if (this.isCancelled) throw new Error('Export cancelled');

      // 4. Lire le fichier de sortie
      console.log('Reading output file...');
      const data = await this.ffmpeg.readFile(outputFile);
      
      // 5. Nettoyer
      await this.cleanup(totalFrames, outputFile, audioFile);
      
      console.log('Export complete!');
      this.currentAbortController = null;
      return new Blob([data], { type: 'video/mp4' });
    } catch (error) {
      console.error('Export error:', error);
      // Nettoyer en cas d'erreur
      await this.cleanup(totalFrames, outputFile, audioFile);
      this.currentAbortController = null;
      throw error;
    }
  }

  private async cleanup(totalFrames: number, outputFile: string, audioFile: string | null) {
    if (!this.ffmpeg) return;

    try {
      await this.cleanupFrames(0, totalFrames);
      await this.ffmpeg.deleteFile(outputFile);
      if (audioFile) {
        await this.ffmpeg.deleteFile(audioFile);
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
}
