import React from 'react';
import { Title, Text, Group, Box, ThemeIcon } from '@mantine/core';

/**
 * PageTitle - A clean page title component
 */
function PageTitle({ title, subtitle, icon, action }) {
  return (
    <Group justify="space-between" align="flex-start" wrap="wrap" gap="md" mb="lg">
      <Group gap="sm">
        {icon && (
          <ThemeIcon size={40} radius="md" variant="gradient" gradient={{ from: 'violet', to: 'indigo' }}>
            {icon}
          </ThemeIcon>
        )}
        <Box>
          <Title order={2}>{title}</Title>
          {subtitle && (
            <Text c="dimmed" size="sm">{subtitle}</Text>
          )}
        </Box>
      </Group>
      {action && <Box>{action}</Box>}
    </Group>
  );
}

export default PageTitle;
