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
    <div className="h-screen flex flex-col bg-light-background-primary dark:bg-dark-background-primary text-light-text-primary dark:text-dark-text-primary transition-colors duration-300 overflow-hidden">
      <Header onLogoClick={handleLogoClick} />
      
      <main className="flex-1"> {/* Utilisation de flex-1 au lieu de pt-16 */}
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
