import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageTransition } from '../components/ui/PageTransition';
import { FilmIcon } from '@heroicons/react/24/outline';

export const HomePage = ({ onVideoSelect }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      onVideoSelect(acceptedFiles[0]);
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
    <div className="h-full bg-gradient-to-br from-gray-100 via-blue-100 to-blue-200 dark:from-gray-950 dark:via-purple-900 dark:to-purple-800 grid place-items-center">
      <PageTransition>
        <div className="flex flex-col items-center gap-8 -mt-8"> 
          {/* Titre avec animation */}
          <motion.h1 
            className="text-2xl md:text-4xl font-bold text-center bg-gradient-to-r from-primary-500 to-accent-500 text-transparent bg-clip-text dark:from-blue-300 dark:to-purple-300"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Create clips in seconds for free
          </motion.h1>

          {/* Zone de glisser-déposer */}
          <div {...getRootProps()}>
            <Card 
              variant="interactive" 
              className={`w-full max-w-2xl p-8 flex flex-col items-center justify-center gap-6 cursor-pointer
                ${isDragActive ? 'border-2 border-primary-500 shadow-glow' : ''}`}
            >
              <input {...getInputProps()} />
              
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center mx-auto"
                animate={{
                  scale: isDragActive ? 1.1 : 1,
                  boxShadow: isDragActive 
                    ? '0 0 30px rgba(var(--primary-rgb), 0.3)' 
                    : '0 0 20px rgba(var(--primary-rgb), 0.2)'
                }}
                transition={{ duration: 0.3 }}
              >
                <FilmIcon className="w-10 h-10 text-white" />
              </motion.div>

              <div className="text-center space-y-4">
                <p className="text-xl font-medium">
                  {isDragActive ? 'Drop your video here' : 'Drag & drop your video here'}
                </p>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  or
                </p>
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={(e) => {
                    e.stopPropagation();
                    document.querySelector('input[type="file"]').click();
                  }}
                >
                  Choose a file
                </Button>
              </div>

              <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary text-center w-full mt-4">
                Supports MP4, MOV, AVI, MKV
              </p>
            </Card>
          </div>
        </div>
      </PageTransition>
    </div>
  );
};
