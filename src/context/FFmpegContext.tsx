import React, { createContext, useContext } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';

interface FFmpegContextType {
  ffmpeg: FFmpeg | null;
  isLoaded: boolean | null;
  error: string | null;
}

const FFmpegContext = createContext<FFmpegContextType>({
  ffmpeg: null,
  isLoaded: null,
  error: null
});

export const useFFmpegContext = () => {
  const context = useContext(FFmpegContext);
  if (!context) {
    throw new Error('useFFmpegContext doit être utilisé à l\'intérieur d\'un FFmpegProvider');
  }
  return context;
};

export { FFmpegContext };
