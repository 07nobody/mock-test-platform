// Custom notification helper functions using Mantine notifications
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconInfoCircle, IconAlertTriangle } from '@tabler/icons-react';
import React from 'react';

export const showNotification = {
  success: (message, title = 'Success') => {
    notifications.show({
      title,
      message,
      color: 'green',
      icon: React.createElement(IconCheck, { size: 18 }),
      autoClose: 4000,
    });
  },
  
  error: (message, title = 'Error') => {
    notifications.show({
      title,
      message,
      color: 'red',
      icon: React.createElement(IconX, { size: 18 }),
      autoClose: 5000,
    });
  },
  
  info: (message, title = 'Info') => {
    notifications.show({
      title,
      message,
      color: 'blue',
      icon: React.createElement(IconInfoCircle, { size: 18 }),
      autoClose: 4000,
    });
  },
  
  warning: (message, title = 'Warning') => {
    notifications.show({
      title,
      message,
      color: 'yellow',
      icon: React.createElement(IconAlertTriangle, { size: 18 }),
      autoClose: 4500,
    });
  },
  
  loading: (message, title = 'Loading') => {
    return notifications.show({
      title,
      message,
      loading: true,
      autoClose: false,
      withCloseButton: false,
    });
  },
  
  update: (id, { title, message, color, icon, loading = false, autoClose = 4000 }) => {
    notifications.update({
      id,
      title,
      message,
      color,
      icon,
      loading,
      autoClose,
    });
  },
  
  hide: (id) => {
    notifications.hide(id);
  },
};

// Legacy compatibility - maps to antd message.xxx() API style
export const message = {
  success: (content) => showNotification.success(content),
  error: (content) => showNotification.error(content),
  info: (content) => showNotification.info(content),
  warning: (content) => showNotification.warning(content),
  loading: (content) => showNotification.loading(content),
};

export default showNotification;
