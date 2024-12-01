import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface HomePageProps {
  onVideoSelect: (file: File) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onVideoSelect }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onVideoSelect(file);
    }
  }, [onVideoSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    maxFiles: 1
  });

  return (
    <div className="h-full bg-gradient-to-tl from-gray-100 via-blue-100 to-blue-200 dark:from-gray-950 dark:via-purple-900 dark:to-purple-800 grid place-items-center">
      <div className="w-full max-w-[600px] px-4">
        <div className="w-full rounded-xl backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/40 dark:border-white/10 shadow-lg">
          <div 
            {...getRootProps()} 
            className={`
              w-full p-8 rounded-2xl
              border-4 border-dashed 
              ${isDragActive 
                ? 'border-primary-500 bg-primary-500 bg-opacity-10' 
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500'
              }
              transition-colors duration-200
              cursor-pointer
            `}
          >
            <input {...getInputProps()} />
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto mb-4">
                <svg 
                  className={`w-full h-full ${isDragActive ? 'text-primary-500' : 'text-gray-400'}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <p className="text-xl font-medium">
                  {isDragActive 
                    ? "Déposez la vidéo ici..."
                    : <span>
                        Glissez-déposez une vidéo
                        <br />
                        ou
                        <br />
                        cliquez pour sélectionner
                      </span>
                  }
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Formats supportés: MP4, MOV, AVI, MKV
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
