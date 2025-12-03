import React from 'react';
import { Card } from '@mantine/core';

/**
 * ResponsiveCard - A simple Card wrapper
 */
function ResponsiveCard({ children, title, extra, ...rest }) {
  return (
    <Card withBorder padding="lg" radius="md" {...rest}>
      {title && <Card.Section withBorder inheritPadding py="sm">{title}</Card.Section>}
      {children}
    </Card>
  );
}

export default ResponsiveCard;
