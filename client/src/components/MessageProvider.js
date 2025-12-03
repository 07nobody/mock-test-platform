// This file is kept for backwards compatibility but is no longer needed
// The app now uses Mantine notifications via src/utils/notifications.js
import React from 'react';

// Re-export message from notifications for any components still importing from here
export { message, message as useMessage } from '../utils/notifications';

// Dummy provider that just renders children (for backwards compatibility)
export const MessageProvider = ({ children }) => children;

export default MessageProvider;
