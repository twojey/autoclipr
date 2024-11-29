import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '../ui/Card';
import { Text } from '../ui/Typography';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

const VideoUploader = ({ 
  onUpload, 
  maxSize = 100 * 1024 * 1024, // 100MB
  accept = {
    'video/*': ['.mp4', '.mov', '.avi', '.mkv']
  },
  className = ''
}) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      onUpload?.(acceptedFiles[0]);
    }
  }, [onUpload]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false
  });

  const getErrorMessage = () => {
    if (fileRejections.length === 0) return null;
    
    const { errors } = fileRejections[0];
    if (errors[0]?.code === 'file-too-large') {
      return `Le fichier est trop volumineux. Taille maximum : ${maxSize / 1024 / 1024}MB`;
    }
    if (errors[0]?.code === 'file-invalid-type') {
      return 'Format de fichier non supporté';
    }
    return 'Erreur lors du téléchargement';
  };

  return (
    <Card
      variant="interactive"
      className={`${className} ${
        isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''
      } ${
        isDragReject ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
      }`}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <CloudArrowUpIcon 
          className={`w-16 h-16 ${
            isDragActive ? 'text-primary-500' : 
            isDragReject ? 'text-red-500' : 
            'text-light-text-secondary dark:text-dark-text-secondary'
          }`}
        />
        
        <div className="text-center">
          <Text size="lg" className="font-medium">
            {isDragActive
              ? 'Déposez votre vidéo ici'
              : 'Glissez-déposez votre vidéo ou cliquez pour sélectionner'}
          </Text>
          
          <Text variant="secondary" size="sm" className="mt-2">
            MP4, MOV, AVI ou MKV • Maximum {maxSize / 1024 / 1024}MB
          </Text>
          
          {getErrorMessage() && (
            <Text 
              className="mt-2 text-red-500 dark:text-red-400"
              size="sm"
            >
              {getErrorMessage()}
            </Text>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VideoUploader;
