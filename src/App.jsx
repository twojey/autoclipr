import React, { useState } from 'react';
import { HomePage } from './pages/HomePage';
import VideoEditor from './components/VideoEditor/VideoEditor';
import Header from './components/Header/Header';

function App() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const handleLogoClick = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen bg-light-background-primary dark:bg-dark-background-primary text-light-text-primary dark:text-dark-text-primary transition-colors duration-300">
      <Header onLogoClick={handleLogoClick} />
      
      <main className="pt-16"> {/* Ajout de padding-top pour compenser le header fixe */}
        {selectedVideo ? (
          <VideoEditor videoFile={selectedVideo} onBack={() => setSelectedVideo(null)} />
        ) : (
          <HomePage onVideoSelect={setSelectedVideo} />
        )}
      </main>
    </div>
  );
}

export default App;
