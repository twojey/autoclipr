import { VideoOverlay } from '../../types/overlay';

export interface RenderOptions {
  width: number;      // 1080
  height: number;     // 1920
  overlay: {
    width: number;    // Largeur de l'overlay dans VideoCanvas
    height: number;   // Hauteur de l'overlay dans VideoCanvas
  };
}

export class FrameRenderer {
  private exportCanvas: HTMLCanvasElement;
  private workCanvas: HTMLCanvasElement;
  private workCtx: CanvasRenderingContext2D;
  private exportCtx: CanvasRenderingContext2D;
  private options: RenderOptions;

  constructor(options: RenderOptions) {
    // Validation des dimensions
    if (options.width <= 0 || options.height <= 0) {
      throw new Error(`Invalid export dimensions: ${options.width}x${options.height}`);
    }
    if (options.overlay.width <= 0 || options.overlay.height <= 0) {
      throw new Error(`Invalid overlay dimensions: ${options.overlay.width}x${options.overlay.height}`);
    }

    this.options = options;

    // Canvas de travail (même taille que l'overlay)
    this.workCanvas = document.createElement('canvas');
    this.workCanvas.width = options.overlay.width;
    this.workCanvas.height = options.overlay.height;
    const workCtx = this.workCanvas.getContext('2d', { willReadFrequently: true });
    if (!workCtx) throw new Error('Failed to get work canvas context');
    this.workCtx = workCtx;

    // Canvas d'export (1080x1920)
    this.exportCanvas = document.createElement('canvas');
    this.exportCanvas.width = options.width;
    this.exportCanvas.height = options.height;
    const exportCtx = this.exportCanvas.getContext('2d', { willReadFrequently: true });
    if (!exportCtx) throw new Error('Failed to get export canvas context');
    this.exportCtx = exportCtx;
  }

  private async seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
    video.currentTime = time;
    return new Promise<void>((resolve, reject) => {
      const onError = () => {
        reject(new Error('Failed to seek video'));
        video.removeEventListener('error', onError);
      };
      
      video.addEventListener('seeked', () => {
        video.removeEventListener('error', onError);
        resolve();
      }, { once: true });
      
      video.addEventListener('error', onError, { once: true });
    });
  }

  private calculateVideoDimensions(
    video: HTMLVideoElement,
    containerWidth: number,
    containerHeight: number
  ): { width: number; height: number; x: number; y: number } {
    const videoRatio = video.videoWidth / video.videoHeight;
    const containerRatio = containerWidth / containerHeight;
    
    let width: number;
    let height: number;
    
    if (videoRatio > containerRatio) {
      // La vidéo est plus large que le container
      height = containerHeight;
      width = height * videoRatio;
    } else {
      // La vidéo est plus haute que le container
      width = containerWidth;
      height = width / videoRatio;
    }

    // Centrer la vidéo
    const x = (containerWidth - width) / 2;
    const y = (containerHeight - height) / 2;

    return { width, height, x, y };
  }

  public async renderFrame(
    video: HTMLVideoElement,
    backgroundVideo: HTMLVideoElement | null,
    time: number,
    transform: { x: number; y: number; scale: number }
  ): Promise<Blob> {
    // Validation des dimensions de la vidéo
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      throw new Error(`Invalid video dimensions: ${video.videoWidth}x${video.videoHeight}`);
    }

    // 1. Positionner les vidéos au bon timestamp
    await Promise.all([
      this.seekVideo(video, time),
      backgroundVideo ? this.seekVideo(backgroundVideo, time) : Promise.resolve()
    ]);

    // 2. Nettoyer les canvas
    this.workCtx.clearRect(0, 0, this.workCanvas.width, this.workCanvas.height);
    this.exportCtx.clearRect(0, 0, this.exportCanvas.width, this.exportCanvas.height);

    // 3. Si une vidéo de background est fournie, la dessiner d'abord
    if (backgroundVideo && backgroundVideo.videoWidth > 0 && backgroundVideo.videoHeight > 0) {
      const bgDimensions = this.calculateVideoDimensions(
        backgroundVideo,
        this.options.overlay.width,
        this.options.overlay.height
      );

      // Créer un canvas temporaire pour le flou
      const blurCanvas = document.createElement('canvas');
      blurCanvas.width = this.workCanvas.width;
      blurCanvas.height = this.workCanvas.height;
      const blurCtx = blurCanvas.getContext('2d', { willReadFrequently: true });
      
      if (!blurCtx) {
        throw new Error('Failed to get blur canvas context');
      }

      // Dessiner la vidéo de background sur le canvas temporaire
      blurCtx.filter = 'blur(10px)';  // Ajuster la valeur du flou selon vos besoins
      blurCtx.drawImage(
        backgroundVideo,
        bgDimensions.x,
        bgDimensions.y,
        bgDimensions.width,
        bgDimensions.height
      );

      // Copier le résultat flouté sur le canvas de travail
      this.workCtx.drawImage(blurCanvas, 0, 0);
    }

    // 4. Calculer les dimensions de la vidéo principale
    const { width: initialWidth, height: initialHeight, x: initialX, y: initialY } = 
      this.calculateVideoDimensions(video, this.options.overlay.width, this.options.overlay.height);

    // 5. Appliquer les transformations pour la vidéo principale
    this.workCtx.save();

    // Déplacer au centre de l'overlay
    this.workCtx.translate(this.options.overlay.width / 2, this.options.overlay.height / 2);
    
    // Appliquer le scale
    this.workCtx.scale(transform.scale, transform.scale);
    
    // Appliquer la translation
    this.workCtx.translate(transform.x / transform.scale, transform.y / transform.scale);
    
    // Retourner au point d'origine
    this.workCtx.translate(-this.options.overlay.width / 2, -this.options.overlay.height / 2);

    // 6. Dessiner la vidéo principale
    this.workCtx.drawImage(
      video,
      initialX,
      initialY,
      initialWidth,
      initialHeight
    );

    this.workCtx.restore();

    // 7. Copier vers le canvas d'export
    this.exportCtx.drawImage(
      this.workCanvas,
      0,
      0,
      this.options.overlay.width,
      this.options.overlay.height,
      0,
      0,
      this.options.width,
      this.options.height
    );

    // 8. Convertir en blob
    return new Promise<Blob>((resolve, reject) => {
      this.exportCanvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to convert canvas to blob'));
        },
        'image/jpeg',
        0.95
      );
    });
  }
}
