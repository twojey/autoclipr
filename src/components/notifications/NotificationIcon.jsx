import React from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const iconMap = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationCircleIcon,
  info: InformationCircleIcon,
};

const colorMap = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

const NotificationIcon = ({ type = 'info', className = '' }) => {
  const Icon = iconMap[type] || iconMap.info;
  return <Icon className={`w-6 h-6 ${colorMap[type]} ${className}`} />;
};

export { NotificationIcon, iconMap, colorMap };
