import React, { useState } from 'react';
import './App.css';
import { useFFmpeg } from './hooks/useFFmpeg';
import Header from './components/Header/Header';
import { HomePage } from './pages/HomePage';
import VideoEditor from './components/VideoEditor/VideoEditor';
import { VideoProvider } from './contexts/VideoContext';

function App() {
  const { ffmpeg, isLoaded, error } = useFFmpeg();
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  const handleLogoClick = () => {
    setSelectedVideo(null);
  };

  return (
    <VideoProvider>
      <div className="h-screen flex flex-col bg-light-background-primary dark:bg-dark-background-primary text-light-text-primary dark:text-dark-text-primary transition-colors duration-300 overflow-hidden">
        <Header onLogoClick={handleLogoClick} />
        
        <main className="flex-1 pt-16">
          {selectedVideo ? (
            <VideoEditor videoFile={selectedVideo} onBack={() => setSelectedVideo(null)} />
          ) : (
            <HomePage onVideoSelect={setSelectedVideo} />
          )}
        </main>
      </div>
    </VideoProvider>
  );
}

export default App;