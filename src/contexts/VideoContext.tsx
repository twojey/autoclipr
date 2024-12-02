import React, { createContext, useContext, useState } from 'react';

interface VideoContextType {
  duration: number;
  setDuration: (duration: number) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [duration, setDuration] = useState(0);

  return (
    <VideoContext.Provider value={{ duration, setDuration }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = () => {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideoContext must be used within a VideoProvider');
  }
  return context;
};
