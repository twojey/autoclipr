import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Text } from '../ui/Typography';
import {
  ScissorsIcon,
  CameraIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const VideoControls = ({
  onTrim,
  onCapture,
  onExport,
  onDelete,
  isProcessing = false,
  className = '',
}) => {
  return (
    <Card
      variant="default"
      className={`${className} p-4`}
    >
      <div className="flex flex-col space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="primary"
            onClick={onTrim}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2"
          >
            <ScissorsIcon className="w-5 h-5" />
            <Text>Découper</Text>
          </Button>

          <Button
            variant="primary"
            onClick={onCapture}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2"
          >
            <CameraIcon className="w-5 h-5" />
            <Text>Capturer</Text>
          </Button>

          <Button
            variant="secondary"
            onClick={onExport}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <Text>Exporter</Text>
          </Button>

          <Button
            variant="outline"
            onClick={onDelete}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
          >
            <TrashIcon className="w-5 h-5" />
            <Text>Supprimer</Text>
          </Button>
        </div>

        {isProcessing && (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
            <Text className="ml-2">Traitement en cours...</Text>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VideoControls;
