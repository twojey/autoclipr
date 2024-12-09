export type WorkerMessageType = 
  | 'INIT'
  | 'START_EXPORT'
  | 'FRAME_PROGRESS'
  | 'ENCODING_PROGRESS'
  | 'EXPORT_COMPLETE'
  | 'ERROR';

export interface WorkerMessage {
  type: WorkerMessageType;
  payload: any;
}

export interface ExportWorkerConfig {
  startTime: number;
  endTime: number;
  fps: number;
  overlayDimensions: {
    width: number;
    height: number;
  };
  videoTransform: {
    x: number;
    y: number;
    scale: number;
  };
}
