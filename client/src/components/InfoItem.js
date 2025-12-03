import React from 'react';
import { Group, Text } from '@mantine/core';

/**
 * InfoItem - A simple label/value display component
 */
function InfoItem({ icon, label, value, className }) {
  return (
    <Group gap="xs" className={className}>
      {icon}
      <Text size="sm" c="dimmed">{label}</Text>
      <Text size="sm" fw={500}>{value}</Text>
    </Group>
  );
}

export default InfoItem;
