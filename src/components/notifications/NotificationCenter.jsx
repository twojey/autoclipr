import React, { useState } from 'react';
import useNotifications from '../../hooks/useNotifications';
import { BellIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, clearNotifications } = useNotifications();

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Bouton de notification avec badge */}
      <button
        onClick={toggleOpen}
        className="btn-icon group relative"
        aria-label="Notifications"
      >
        <BellIcon className="w-6 h-6 text-light-text-secondary dark:text-dark-text-secondary 
                           group-hover:text-primary-500 dark:group-hover:text-primary-400 
                           transition-colors duration-300" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-500 
                         text-white text-xs flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Panel de notifications */}
      {isOpen && (
        <>
          {/* Overlay pour fermer en cliquant en dehors */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 max-h-[80vh] overflow-y-auto z-50
                        bg-light-background-elevated dark:bg-dark-background-elevated
                        rounded-xl shadow-neumorph dark:shadow-neumorph-dark
                        animate-slide-down">
            {/* Header */}
            <div className="sticky top-0 bg-light-background-elevated dark:bg-dark-background-elevated
                          p-4 border-b border-light-background-tertiary dark:border-dark-background-tertiary
                          flex items-center justify-between">
              <h3 className="font-medium">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="btn-icon group"
                  aria-label="Clear all notifications"
                >
                  <TrashIcon className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary
                                     group-hover:text-error-500 dark:group-hover:text-error-400
                                     transition-colors duration-300" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="btn-icon group ml-2"
                aria-label="Close notifications"
              >
                <XMarkIcon className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary
                                   group-hover:text-light-text-primary dark:group-hover:text-dark-text-primary
                                   transition-colors duration-300" />
              </button>
            </div>

            {/* Liste des notifications */}
            <div className="p-2">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-light-text-tertiary dark:text-dark-text-tertiary">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 mb-2 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary
                             border border-light-background-tertiary dark:border-dark-background-tertiary"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-light-text-primary dark:text-dark-text-primary">
                          {notification.message}
                        </p>
                        <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                          {format(new Date(notification.timestamp), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
