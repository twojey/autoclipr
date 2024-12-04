export type ExportPhase = 'rendering' | 'encoding';

export interface ExportProgress {
  phase: ExportPhase;
  progress: number;
}
