export interface AudioExtractionProgress {
  status: 'extracting' | 'done' | 'error';
  progress: number;
}

export declare class AudioExtractor {
  private audioContext: AudioContext | null;
  extractAudio(
    videoFile: File,
    onProgress?: (progress: AudioExtractionProgress) => void
  ): Promise<Blob>;
}
