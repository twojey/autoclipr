import React, { createContext, useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const NotificationContext = createContext();

// Types de notifications
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

// Actions
const ACTIONS = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
};

// Calculer la durée d'affichage en fonction du contenu
const calculateDuration = (message, type) => {
  const baseTime = 2000; // 2 secondes minimum
  const wordsPerSecond = 3; // Vitesse de lecture moyenne
  const words = message.split(' ').length;
  const readingTime = (words / wordsPerSecond) * 1000;
  
  // Durée plus longue pour les erreurs et les avertissements
  const typeDuration = type === NOTIFICATION_TYPES.ERROR || type === NOTIFICATION_TYPES.WARNING 
    ? 2000 
    : 0;

  return Math.max(baseTime, readingTime + typeDuration);
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
        history: [...state.history, action.payload],
      };
    case ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
      };
    case ACTIONS.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
      };
    default:
      return state;
  }
};

const initialState = {
  notifications: [],
  history: [], // Historique pour le centre de notifications
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = useCallback((notification) => {
    const id = uuidv4();
    const duration = calculateDuration(notification.message, notification.type);

    const newNotification = {
      id,
      duration,
      timestamp: new Date(),
      ...notification,
    };

    dispatch({
      type: ACTIONS.ADD_NOTIFICATION,
      payload: newNotification,
    });

    // Auto-remove après la durée spécifiée
    if (duration !== Infinity) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    dispatch({
      type: ACTIONS.REMOVE_NOTIFICATION,
      payload: id,
    });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_NOTIFICATIONS });
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications: state.notifications,
        history: state.history,
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
