import React from 'react';
import { Modal, Switch, SegmentedControl, Tooltip, Button, Divider, Group, Text, Stack } from '@mantine/core';
import { 
  IconPalette, 
  IconTextSize, 
  IconEye, 
  IconBolt,
  IconMoon,
  IconSun,
  IconHighlight
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
    toggleReducedMotion
  } = useTheme();

  // For debugging
  console.log('AccessibilitySettings rendering with:', { 
    currentTheme, fontSize, highContrast, reducedMotion 
  });

  return (
    <Modal
      title={
        <Group gap="xs">
          <IconEye size={20} />
          <span>Accessibility Settings</span>
        </Group>
      }
      opened={visible}
      onClose={onClose}
      size="md"
      closeOnClickOutside
    >
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            {currentTheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
            <Text fw={500}>Dark Mode</Text>
          </Group>
          <Switch 
            checked={currentTheme === 'dark'} 
            onChange={() => {
              console.log('Toggle theme clicked, current theme:', currentTheme);
              toggleTheme();
            }} 
            onLabel="On"
            offLabel="Off"
          />
        </Group>
        
        <Divider my="xs" />
        
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconTextSize size={18} />
            <Text fw={500}>Font Size</Text>
          </Group>
          <SegmentedControl
            value={fontSize}
            onChange={(value) => {
              console.log('Font size changed to:', value);
              changeFontSize(value);
            }}
            size="xs"
            data={[
              { label: 'Small', value: 'small' },
              { label: 'Medium', value: 'medium' },
              { label: 'Large', value: 'large' },
            ]}
          />
        </Group>
        
        <Divider my="xs" />
        
        <Group justify="space-between" align="center">
          <Tooltip label="Increases contrast for better readability">
            <Group gap="xs" className="cursor-help">
              <IconHighlight size={18} />
              <Text fw={500}>High Contrast</Text>
            </Group>
          </Tooltip>
          <Switch 
            checked={highContrast} 
            onChange={() => {
              console.log('High contrast toggled, current value:', highContrast);
              toggleHighContrast();
            }}
            onLabel="On"
            offLabel="Off"
          />
        </Group>
        
        <Divider my="xs" />
        
        <Group justify="space-between" align="center">
          <Tooltip label="Reduces animations for users sensitive to motion">
            <Group gap="xs" className="cursor-help">
              <IconBolt size={18} />
              <Text fw={500}>Reduce Motion</Text>
            </Group>
          </Tooltip>
          <Switch 
            checked={reducedMotion} 
            onChange={() => {
              console.log('Reduced motion toggled, current value:', reducedMotion);
              toggleReducedMotion();
            }}
            onLabel="On"
            offLabel="Off"
          />
        </Group>
        
        <Divider my="xs" />
        
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default AccessibilitySettings;