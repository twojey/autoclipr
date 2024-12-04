export interface FFmpegProgress {
  ratio: number;
  time: number;
  speed: number;
  frame: number;
  fps: number;
  bitrate: number;
  total_size: number;
  out_time_ms: number;
  out_time: string;
  dup_frames: number;
  drop_frames: number;
  progress: string;
}
