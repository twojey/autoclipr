import { VideoOverlay, TextLayer, ImageLayer, ShapeLayer, VideoLayer } from '../../types/overlay';

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

  public async renderFrame(
    video: HTMLVideoElement,
    time: number,
    transform: { x: number; y: number; scale: number }
  ): Promise<Blob> {
    // Validation des dimensions de la vidéo
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      throw new Error(`Invalid video dimensions: ${video.videoWidth}x${video.videoHeight}`);
    }

    // 1. Positionner la vidéo au bon timestamp
    video.currentTime = time;
    await new Promise<void>((resolve, reject) => {
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

    // 2. Nettoyer les canvas
    this.workCtx.clearRect(0, 0, this.workCanvas.width, this.workCanvas.height);
    this.exportCtx.clearRect(0, 0, this.exportCanvas.width, this.exportCanvas.height);

    // 3. Calculer les dimensions initiales de la vidéo (comme object-contain)
    const videoRatio = video.videoWidth / video.videoHeight;
    const overlayRatio = this.options.overlay.width / this.options.overlay.height;
    
    let initialWidth: number;
    let initialHeight: number;
    
    if (videoRatio > overlayRatio) {
      // La vidéo est plus large que l'overlay
      initialHeight = this.options.overlay.height;
      initialWidth = initialHeight * videoRatio;
    } else {
      // La vidéo est plus haute que l'overlay
      initialWidth = this.options.overlay.width;
      initialHeight = initialWidth / videoRatio;
    }

    // 4. Calculer la position initiale (centrée)
    const initialX = (this.options.overlay.width - initialWidth) / 2;
    const initialY = (this.options.overlay.height - initialHeight) / 2;

    // 5. Appliquer les transformations
    this.workCtx.save();

    // Déplacer au centre de l'overlay
    this.workCtx.translate(this.options.overlay.width / 2, this.options.overlay.height / 2);
    
    // Appliquer le scale
    this.workCtx.scale(transform.scale, transform.scale);
    
    // Appliquer la translation
    this.workCtx.translate(transform.x / transform.scale, transform.y / transform.scale);
    
    // Retourner au point d'origine
    this.workCtx.translate(-this.options.overlay.width / 2, -this.options.overlay.height / 2);

    // 6. Dessiner la vidéo
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
