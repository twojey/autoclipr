import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { FilmIcon } from '@heroicons/react/24/outline';

export const VideoImporter = () => {
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      const file = acceptedFiles[0];
      const fileUrl = URL.createObjectURL(file);
      navigate('/editor', { 
        state: { 
          videoFile: fileUrl
        }
      });
    }
  }, [navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    maxFiles: 1
  });

  return (
    <div 
      {...getRootProps()} 
      className={`
        w-full rounded-xl border-2 border-dashed p-8 cursor-pointer
        transition-colors duration-200
        ${isDragActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
          : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
        }
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-4">
        {/* Icône centrée */}
        <div className={`
          p-4 rounded-full 
          ${isDragActive 
            ? 'bg-blue-100 dark:bg-blue-900/50' 
            : 'bg-gray-100 dark:bg-gray-800'
          }
        `}>
          <FilmIcon className={`
            w-8 h-8 
            ${isDragActive 
              ? 'text-blue-500 dark:text-blue-400' 
              : 'text-gray-500 dark:text-gray-400'
            }
          `} />
        </div>

        {/* Texte */}
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-gray-700 dark:text-gray-300">
            {isDragActive ? 'Déposez votre vidéo ici' : 'Glissez-déposez votre vidéo ici'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ou cliquez pour sélectionner
          </p>
        </div>

        {/* Formats supportés */}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Formats supportés : MP4, MOV, AVI, MKV
        </p>
      </div>
    </div>
  );
};
