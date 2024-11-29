import React from 'react';
import useNotifications from '../hooks/useNotifications';
import { NOTIFICATION_TYPES } from '../context/NotificationContext';

const getNotificationStyles = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return 'bg-green-500';
    case NOTIFICATION_TYPES.ERROR:
      return 'bg-red-500';
    case NOTIFICATION_TYPES.WARNING:
      return 'bg-yellow-500';
    case NOTIFICATION_TYPES.INFO:
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getNotificationStyles(
            notification.type
          )} text-white px-4 py-2 rounded-lg shadow-lg mb-2 flex items-center justify-between`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-4 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
