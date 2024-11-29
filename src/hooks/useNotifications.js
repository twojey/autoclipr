import { useContext } from 'react';
import { NotificationContext, NOTIFICATION_TYPES } from '../context/NotificationContext';

let notificationCounter = 0;

const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }

  const { notifications, addNotification, removeNotification, clearNotifications } = context;

  const showNotification = (type, message, duration) => {
    const baseDelay = 2000; // 2 seconds minimum
    const wordsPerMinute = 200;
    const words = message.split(' ').length;
    const readingTime = (words / wordsPerMinute) * 60 * 1000;
    const calculatedDuration = duration || Math.max(baseDelay, readingTime);

    // Génère un ID unique en combinant timestamp et compteur
    const uniqueId = `${Date.now()}_${notificationCounter++}`;

    addNotification({
      id: uniqueId,
      type,
      message,
      duration: calculatedDuration,
      timestamp: new Date(),
    });
  };

  const showSuccess = (message, duration) => showNotification(NOTIFICATION_TYPES.SUCCESS, message, duration);
  const showError = (message, duration) => showNotification(NOTIFICATION_TYPES.ERROR, message, duration);
  const showWarning = (message, duration) => showNotification(NOTIFICATION_TYPES.WARNING, message, duration);
  const showInfo = (message, duration) => showNotification(NOTIFICATION_TYPES.INFO, message, duration);

  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearNotifications,
  };
};

export default useNotifications;
