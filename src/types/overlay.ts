export interface BaseLayer {
  id: string;
  type: 'text' | 'image' | 'shape' | 'video';
  x: number;
  y: number;
  width: number;
  height: number;
  isDynamic?: boolean;
  rotation?: number;
  scale?: number;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  textAlign: CanvasTextAlign;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shape: 'rectangle' | 'circle';
  color: string;
}

export interface VideoLayer extends BaseLayer {
  type: 'video';
  videoElement: HTMLVideoElement;
  startTime?: number;
  endTime?: number;
}

export type Layer = TextLayer | ImageLayer | ShapeLayer | VideoLayer;

export interface VideoOverlay {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  layers: Layer[];
}
