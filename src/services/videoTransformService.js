// Service for handling video transformations (crop, scale, position)
export const ASPECT_RATIO = {
  width: 9,
  height: 16
};

export const DEFAULT_OVERLAY_HEIGHT_PERCENTAGE = 80;

export class VideoTransformService {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.overlayHeight = (canvasHeight * DEFAULT_OVERLAY_HEIGHT_PERCENTAGE) / 100;
    this.overlayWidth = (this.overlayHeight * ASPECT_RATIO.width) / ASPECT_RATIO.height;
  }

  calculateInitialVideoScale(videoWidth, videoHeight) {
    const overlayAspectRatio = ASPECT_RATIO.width / ASPECT_RATIO.height;
    const videoAspectRatio = videoWidth / videoHeight;
    
    if (videoAspectRatio > overlayAspectRatio) {
      // Video is wider than overlay
      return this.overlayHeight / videoHeight;
    } else {
      // Video is taller than overlay
      return this.overlayWidth / videoWidth;
    }
  }

  calculateCenterPosition(videoWidth, videoHeight, scale) {
    return {
      x: (this.canvasWidth - videoWidth * scale) / 2,
      y: (this.canvasHeight - videoHeight * scale) / 2
    };
  }

  fitToHeight(videoWidth, videoHeight) {
    const scale = this.overlayHeight / videoHeight;
    const x = (this.canvasWidth - videoWidth * scale) / 2;
    const y = (this.canvasHeight - this.overlayHeight) / 2;
    
    return { scale, position: { x, y } };
  }

  fitToWidth(videoWidth, videoHeight) {
    const scale = this.overlayWidth / videoWidth;
    const x = (this.canvasWidth - this.overlayWidth) / 2;
    const y = (this.canvasHeight - videoHeight * scale) / 2;
    
    return { scale, position: { x, y } };
  }

  adjustScale(currentScale, delta) {
    const MIN_SCALE = 0.1;
    const MAX_SCALE = 5;
    const newScale = currentScale * (1 + delta);
    return Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
  }

  isWithinOverlay(x, y) {
    const overlayLeft = (this.canvasWidth - this.overlayWidth) / 2;
    const overlayTop = (this.canvasHeight - this.overlayHeight) / 2;
    
    return x >= overlayLeft && 
           x <= overlayLeft + this.overlayWidth &&
           y >= overlayTop && 
           y <= overlayTop + this.overlayHeight;
  }

  getOverlayDimensions() {
    return {
      width: this.overlayWidth,
      height: this.overlayHeight,
      x: (this.canvasWidth - this.overlayWidth) / 2,
      y: (this.canvasHeight - this.overlayHeight) / 2
    };
  }
}
