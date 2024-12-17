import React, { useState } from 'react';
import './App.css';
import { useFFmpeg } from './hooks/useFFmpeg';
import Header from './components/Header/Header';
import { HomePage } from './pages/HomePage';
import VideoEditor from './components/VideoEditor/VideoEditor';
import { VideoProvider } from './contexts/VideoContext';

function App() {
  const { isReady, isLoading, error, extractAudio } = useFFmpeg();
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleLogoClick = () => {
    setSelectedVideo(null);
  };

  const handleExtractAudio = async () => {
    if (selectedVideo) {
      try {
        // Appel à la fonction d'extraction d'audio
        const audio = await extractAudio(selectedVideo, (progress) => {
          console.log(`Progression : ${progress}%`);
        });

        // Créer un URL pour l'audio extrait et le stocker
        const audioUrl = URL.createObjectURL(audio);
        setAudioUrl(audioUrl);
        setAudioBlob(audio);
      } catch (error) {
        console.error("Erreur lors de l'extraction de l'audio", error);
      }
    }
  };

  return (
    <VideoProvider>
      <div className="h-screen flex flex-col bg-light-background-primary dark:bg-dark-background-primary text-light-text-primary dark:text-dark-text-primary transition-colors duration-300 overflow-hidden">
        <Header onLogoClick={handleLogoClick} />
        
        <main className="flex-1 pt-16">
          {selectedVideo ? (
            <>
              <VideoEditor videoFile={selectedVideo} onBack={() => setSelectedVideo(null)} />
              <button onClick={handleExtractAudio}>Extraire l'audio</button>
              {audioUrl && (
                <audio controls>
                  <source src={audioUrl} type="audio/mp3" />
                  Votre navigateur ne supporte pas la lecture audio.
                </audio>
              )}
            </>
          ) : (
            <HomePage onVideoSelect={setSelectedVideo} />
          )}
        </main>
      </div>
    </VideoProvider>
  );
}

export default App;
