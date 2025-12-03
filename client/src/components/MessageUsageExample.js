import React from 'react';
import { Button, Group, Stack, Text } from '@mantine/core';
import { message } from '../utils/notifications';

/**
 * Example component demonstrating how to use the notification API
 * 
 * This shows how to use the message utility from our notifications module
 */
const MessageUsageExample = () => {
  const showSuccess = () => {
    message.success('This is a success message');
  };

  const showError = () => {
    message.error('This is an error message');
  };

  const showWarning = () => {
    message.warning('This is a warning message');
  };

  const showInfo = () => {
    message.info('This is an information message');
  };

  const showLoading = () => {
    const id = message.loading('Action in progress...');
    // Dismiss the loading message after 2.5 seconds
    setTimeout(() => message.update(id, { loading: false, message: 'Done!' }), 2500);
  };

  return (
    <Stack gap="md">
      <Text fw={500} size="lg">Message Examples</Text>
      <Group>
        <Button onClick={showSuccess}>Success</Button>
        <Button color="red" onClick={showError}>Error</Button>
        <Button variant="outline" onClick={showWarning}>Warning</Button>
        <Button variant="default" onClick={showInfo}>Info</Button>
        <Button variant="light" onClick={showLoading}>Loading</Button>
      </Group>
      <Text size="sm" c="dimmed">
        Note: Use message from utils/notifications in your components
        for consistent notifications.
      </Text>
    </Stack>
  );
};

export default MessageUsageExample;