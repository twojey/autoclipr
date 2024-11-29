import React, { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { NOTIFICATION_TYPES } from '../../context/NotificationContext';

const icons = {
  [NOTIFICATION_TYPES.SUCCESS]: CheckCircleIcon,
  [NOTIFICATION_TYPES.ERROR]: ExclamationCircleIcon,
  [NOTIFICATION_TYPES.INFO]: InformationCircleIcon,
  [NOTIFICATION_TYPES.WARNING]: ExclamationTriangleIcon,
};

const colors = {
  [NOTIFICATION_TYPES.SUCCESS]: 'bg-green-500',
  [NOTIFICATION_TYPES.ERROR]: 'bg-red-500',
  [NOTIFICATION_TYPES.INFO]: 'bg-primary-500',
  [NOTIFICATION_TYPES.WARNING]: 'bg-yellow-500',
};

const Toast = ({ notification, onClose }) => {
  const { type, message, duration } = notification;
  const progressRef = useRef(null);
  const Icon = icons[type];

  useEffect(() => {
    const progressElement = progressRef.current;
    if (progressElement && duration !== Infinity) {
      progressElement.style.transition = `width ${duration}ms linear`;
      progressElement.style.width = '0%';
    }
  }, [duration]);

  return (
    <div className="relative overflow-hidden animate-slide-up">
      <div className="flex items-center p-4 rounded-xl bg-light-background-elevated dark:bg-dark-background-elevated shadow-neumorph dark:shadow-neumorph-dark">
        {/* Icône */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${colors[type]} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colors[type].replace('bg-', 'text-')}`} />
        </div>

        {/* Message */}
        <div className="ml-4 mr-8 flex-grow">
          <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
            {message}
          </p>
        </div>

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute right-2 top-2 p-1.5 rounded-lg hover:bg-light-background-secondary dark:hover:bg-dark-background-secondary transition-colors"
        >
          <XMarkIcon className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary" />
        </button>

        {/* Barre de progression */}
        {duration !== Infinity && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-light-background-secondary dark:bg-dark-background-secondary">
            <div
              ref={progressRef}
              className={`h-full w-full ${colors[type]}`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Toast;
