import React from 'react';
import { Group } from '@mantine/core';

/**
 * ActionButtons - A simple button group wrapper
 */
function ActionButtons({ children, align = 'right', ...rest }) {
  return (
    <Group justify={align === 'left' ? 'flex-start' : 'flex-end'} gap="xs" {...rest}>
      {children}
    </Group>
  );
}

export default ActionButtons;
