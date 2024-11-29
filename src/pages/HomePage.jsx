import React from 'react';
import { VideoImporter } from '../components/VideoImporter';
import { Header } from '../components/Header/Header';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-light-background-primary dark:bg-dark-background-primary">
      <Header />
      
      {/* Contenu centré verticalement et horizontalement */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-3xl text-center">
          {/* Titre plus petit */}
          <h1 className="text-3xl font-bold mb-8 text-light-text-primary dark:text-dark-text-primary">
            Éditeur de Vidéo Simple et Puissant
          </h1>
          
          {/* Zone d'import */}
          <div className="w-full">
            <VideoImporter />
          </div>
        </div>
      </div>
    </div>
  );
};

export { HomePage };
