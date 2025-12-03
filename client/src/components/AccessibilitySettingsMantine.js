import React from 'react';
import {
  Box,
  Modal,
  Switch,
  SegmentedControl,
  Group,
  Stack,
  Text,
  Divider,
  Button,
  Tooltip,
} from '@mantine/core';
import {
  IconEye,
  IconSun,
  IconMoon,
  IconTextSize,
  IconContrast,
  IconBolt,
} from '@tabler/icons-react';
import { useTheme } from '../contexts/ThemeContext';

const AccessibilitySettings = ({ visible, onClose }) => {
  const {
    currentTheme,
    toggleTheme,
    fontSize,
    changeFontSize,
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion,
  } = useTheme();

  return (
    <Modal
      opened={visible}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconEye size={20} />
          <Text fw={600}>Accessibility Settings</Text>
        </Group>
      }
      size="sm"
      centered
    >
      <Stack gap="lg">
        {/* Dark Mode Toggle */}
        <Group justify="space-between" align="center">
          <Group gap="xs">
            {currentTheme === 'dark' ? (
              <IconSun size={18} stroke={1.5} />
            ) : (
              <IconMoon size={18} stroke={1.5} />
            )}
            <Text fw={500}>Dark Mode</Text>
          </Group>
          <Switch
            checked={currentTheme === 'dark'}
            onChange={toggleTheme}
            onLabel="ON"
            offLabel="OFF"
            size="md"
          />
        </Group>

        <Divider />

        {/* Font Size */}
        <Box>
          <Group gap="xs" mb="xs">
            <IconTextSize size={18} stroke={1.5} />
            <Text fw={500}>Font Size</Text>
          </Group>
          <SegmentedControl
            value={fontSize}
            onChange={changeFontSize}
            data={[
              { label: 'Small', value: 'small' },
              { label: 'Medium', value: 'medium' },
              { label: 'Large', value: 'large' },
            ]}
            fullWidth
          />
        </Box>

        <Divider />

        {/* High Contrast */}
        <Tooltip
          label="Increases contrast for better readability"
          position="left"
          withArrow
        >
          <Group justify="space-between" align="center" className="accessibility-option">
            <Group gap="xs">
              <IconContrast size={18} stroke={1.5} />
              <Text fw={500}>High Contrast</Text>
            </Group>
            <Switch
              checked={highContrast}
              onChange={toggleHighContrast}
              onLabel="ON"
              offLabel="OFF"
              size="md"
            />
          </Group>
        </Tooltip>

        <Divider />

        {/* Reduced Motion */}
        <Tooltip
          label="Reduces animations for users sensitive to motion"
          position="left"
          withArrow
        >
          <Group justify="space-between" align="center" className="accessibility-option">
            <Group gap="xs">
              <IconBolt size={18} stroke={1.5} />
              <Text fw={500}>Reduce Motion</Text>
            </Group>
            <Switch
              checked={reducedMotion}
              onChange={toggleReducedMotion}
              onLabel="ON"
              offLabel="OFF"
              size="md"
            />
          </Group>
        </Tooltip>

        <Divider />

        <Button variant="light" fullWidth onClick={onClose}>
          Close
        </Button>
      </Stack>
    </Modal>
  );
};

export default AccessibilitySettings;
