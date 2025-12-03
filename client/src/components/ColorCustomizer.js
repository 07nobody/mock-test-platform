import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Button,
  Tabs,
  TextInput,
  Tooltip,
  Group,
  Stack,
  Card,
  Accordion,
  Grid,
  Divider,
  Switch,
  Text,
  Title,
  ActionIcon,
  Box,
  Paper,
  SimpleGrid,
  UnstyledButton,
  ScrollArea
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { HexColorPicker } from 'react-colorful';
import {
  IconPalette,
  IconDeviceFloppy,
  IconArrowBack,
  IconTrash,
  IconInfoCircle,
  IconCheck,
  IconSettings,
  IconHighlight,
  IconEye,
  IconLayoutGrid
} from '@tabler/icons-react';
import { useColors } from '../contexts/ColorContext';
import { message } from '../utils/notifications';

const COLOR_LABELS = {
  primary: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
  success: 'Success',
  warning: 'Warning',
  danger: 'Danger',
  info: 'Info',
  background: 'Background',
  backgroundSecondary: 'Background Secondary',
  backgroundTertiary: 'Background Tertiary',
  text: 'Text',
  textSecondary: 'Text Secondary',
  textTertiary: 'Text Tertiary',
  textInverse: 'Text Inverse',
  border: 'Border',
  borderDark: 'Border Dark',
  divider: 'Divider',
  cardBackground: 'Card Background',
  navBackground: 'Navigation Background',
  sidebarBackground: 'Sidebar Background',
  headerBackground: 'Header Background',
  footerBackground: 'Footer Background',
  buttonBackground: 'Button Background',
  buttonText: 'Button Text',
  inputBackground: 'Input Background',
  inputBorder: 'Input Border',
  shadow: 'Shadow',
  overlay: 'Overlay'
};

const ColorSwatch = ({ color, onClick, active, size = 'normal', label = null }) => {
  const sizeMap = {
    small: 24,
    normal: 32,
    large: 48
  };
  const swatchSize = sizeMap[size] || 32;

  return (
    <UnstyledButton onClick={onClick}>
      <Stack align="center" gap={4}>
        <Box
          w={swatchSize}
          h={swatchSize}
          style={{
            backgroundColor: color,
            borderRadius: 4,
            border: '1px solid var(--mantine-color-gray-3)',
            transform: active ? 'scale(1.1)' : 'scale(1)',
            boxShadow: active ? '0 0 0 2px var(--mantine-color-blue-5)' : 'none',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {active && <IconCheck size={14} color="white" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }} />}
        </Box>
        {label && (
          <Text size="xs" ta="center" maw={60} truncate>
            {label}
          </Text>
        )}
      </Stack>
    </UnstyledButton>
  );
};

const ElementPreview = ({ style, colors }) => {
  return (
    <Box mt="md">
      <Title order={4} mb="sm">UI Preview</Title>
      <Paper withBorder p={0} style={{ overflow: 'hidden' }}>
        <Box p="xs" bg="gray.1" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
          <Group justify="space-between">
            <Text fw={500} size="sm">Sample UI</Text>
            <Button size="xs">Action</Button>
          </Group>
        </Box>
        <Box p="md" bg="gray.0">
          <Card withBorder p="sm" mb="sm">
            <Text fw={500} mb="xs">Card Title</Text>
            <Text size="sm" c="dimmed">This is a sample card showing how your color scheme looks.</Text>
            <Stack gap="xs" mt="sm">
              <TextInput placeholder="Input field" size="xs" />
              <Group gap="xs">
                <Button size="xs">Primary</Button>
                <Button size="xs" variant="default">Default</Button>
                <Button size="xs" variant="outline">Outline</Button>
              </Group>
            </Stack>
          </Card>
          <Group gap="xs">
            <Box px="xs" py={4} style={{ borderRadius: 4, border: '1px solid var(--mantine-color-green-5)', backgroundColor: 'var(--mantine-color-green-0)' }}>
              <Text size="xs" c="green">Success</Text>
            </Box>
            <Box px="xs" py={4} style={{ borderRadius: 4, border: '1px solid var(--mantine-color-yellow-5)', backgroundColor: 'var(--mantine-color-yellow-0)' }}>
              <Text size="xs" c="yellow.8">Warning</Text>
            </Box>
            <Box px="xs" py={4} style={{ borderRadius: 4, border: '1px solid var(--mantine-color-red-5)', backgroundColor: 'var(--mantine-color-red-0)' }}>
              <Text size="xs" c="red">Error</Text>
            </Box>
            <Box px="xs" py={4} style={{ borderRadius: 4, border: '1px solid var(--mantine-color-blue-5)', backgroundColor: 'var(--mantine-color-blue-0)' }}>
              <Text size="xs" c="blue">Info</Text>
            </Box>
          </Group>
        </Box>
      </Paper>
    </Box>
  );
};

const ColorPalette = ({ colors, onSelect }) => {
  const palette = [
    '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e',
    '#10b981', '#059669', '#047857', '#065f46', '#064e3b',
    '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
    '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95',
    '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f',
    '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843',
    '#111827', '#1f2937', '#374151', '#4b5563', '#6b7280',
    '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6', '#f9fafb',
  ];

  return (
    <Box mt="md">
      <Group gap={4} wrap="wrap" justify="center">
        {palette.map(color => (
          <ColorSwatch
            key={color}
            color={color}
            onClick={() => onSelect(color)}
            size="small"
          />
        ))}
      </Group>
    </Box>
  );
};

const ColorPickerWithRef = React.forwardRef((props, ref) => {
  return <HexColorPicker {...props} />;
});

ColorPickerWithRef.displayName = 'ColorPickerWithRef';

const ColorCustomizer = React.memo(({ visible, onClose }) => {
  const {
    colors,
    updateColor,
    updateMultipleColors,
    colorPresets: presets,
    colorCategories: categories = [],
    applyPreset,
    saveAsPreset,
    deletePreset,
    resetColors,
    generateColorPalette
  } = useColors();

  const [selectedCategory, setSelectedCategory] = useState(
    categories && categories.length > 0 ? categories[0].name : ''
  );
  const [selectedColor, setSelectedColor] = useState(
    categories && categories.length > 0 && categories[0].colors && categories[0].colors.length > 0
      ? categories[0].colors[0]
      : 'primary'
  );
  const [activeTab, setActiveTab] = useState('customize');
  const [newPresetName, setNewPresetName] = useState('');
  const [advancedMode, setAdvancedMode] = useState(false);
  const [autoGenerateColors, setAutoGenerateColors] = useState(false);
  const [currentPreview, setCurrentPreview] = useState({});

  const colorPickerRef = useRef(null);

  useEffect(() => {
    updatePreview();
  }, [colors]);

  const updatePreview = () => {
    setCurrentPreview({
      backgroundColor: colors.background,
      color: colors.text
    });
  };

  const findCategoryForColor = (colorKey) => {
    if (!categories || categories.length === 0) {
      return '';
    }
    const category = categories.find(cat => cat.colors && cat.colors.includes(colorKey));
    return category ? category.name : categories[0].name;
  };

  const handlePaletteSelect = (color) => {
    updateColor(selectedColor, color);

    if (autoGenerateColors) {
      const palette = generateColorPalette(color);
      const currentCategory = categories.find(cat => cat.name === selectedCategory);
      if (currentCategory) {
        const updates = {};
        currentCategory.colors.forEach(colorKey => {
          if (palette[colorKey] && colorKey !== selectedColor) {
            updates[colorKey] = palette[colorKey];
          }
        });
        updateMultipleColors(updates);
      }
    }
  };

  const handleColorSelect = (colorKey) => {
    setSelectedColor(colorKey);
    setSelectedCategory(findCategoryForColor(colorKey));
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    const category = categories.find(cat => cat.name === categoryName);
    if (category && category.colors.length > 0) {
      setSelectedColor(category.colors[0]);
    }
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      message.error('Please enter a preset name');
      return;
    }
    saveAsPreset(newPresetName.trim());
    message.success('Color preset saved successfully!');
    setNewPresetName('');
  };

  const handleReset = () => {
    resetColors();
    message.success('Colors reset to default');
    updatePreview();
  };

  const handleDeletePreset = (presetName) => {
    modals.openConfirmModal({
      title: 'Delete Preset',
      children: <Text size="sm">Are you sure you want to delete this preset?</Text>,
      labels: { confirm: 'Yes', cancel: 'No' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        if (deletePreset(presetName)) {
          message.success(`Deleted preset: ${presetName}`);
        } else {
          message.error('Cannot delete built-in presets');
        }
      },
    });
  };

  const handleGenerateFromPrimary = () => {
    const primaryColor = colors.primary;
    const generatedPalette = generateColorPalette(primaryColor);
    updateMultipleColors(generatedPalette);
    message.success('Generated color scheme based on primary color');
    updatePreview();
  };

  const renderColorPicker = () => (
    <Box mb="lg">
      <Group justify="space-between" mb="md">
        <Title order={4}>Color Picker</Title>
        <Switch
          onLabel="Auto"
          offLabel="Manual"
          checked={autoGenerateColors}
          onChange={(event) => setAutoGenerateColors(event.currentTarget.checked)}
        />
      </Group>

      <Box>
        <ColorPickerWithRef
          ref={colorPickerRef}
          color={colors[selectedColor]}
          onChange={(color) => updateColor(selectedColor, color)}
          style={{ width: '100%', height: 200 }}
        />

        <Group mt="md" gap="sm">
          <Box
            w={36}
            h={36}
            style={{
              backgroundColor: colors[selectedColor],
              borderRadius: 4,
              border: '1px solid var(--mantine-color-gray-3)'
            }}
          />
          <TextInput
            value={colors[selectedColor]}
            onChange={(e) => updateColor(selectedColor, e.target.value)}
            style={{ flex: 1, fontFamily: 'monospace' }}
          />
        </Group>

        <ColorPalette
          colors={colors}
          onSelect={handlePaletteSelect}
        />

        {autoGenerateColors && (
          <Paper p="sm" mt="md" bg="gray.0" radius="sm">
            <Group gap="xs">
              <IconInfoCircle size={16} />
              <Text size="sm" c="dimmed">Selecting a color will automatically generate complementary colors.</Text>
            </Group>
          </Paper>
        )}
      </Box>
    </Box>
  );

  const renderColorCategories = () => (
    <ScrollArea h={500} mt="md">
      <Accordion variant="separated">
        {categories.map(category => (
          <Accordion.Item
            key={category.name}
            value={category.name}
            style={selectedCategory === category.name ? { borderLeft: '2px solid var(--mantine-color-blue-5)' } : {}}
          >
            <Accordion.Control onClick={() => handleCategorySelect(category.name)}>
              <Stack gap={2}>
                <Text fw={600}>{category.name}</Text>
                <Text size="sm" c="dimmed">{category.description}</Text>
              </Stack>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="xs">
                {category.colors.map(colorKey => (
                  <UnstyledButton
                    key={colorKey}
                    onClick={() => handleColorSelect(colorKey)}
                    p="xs"
                    style={{
                      borderRadius: 4,
                      backgroundColor: selectedColor === colorKey ? 'var(--mantine-color-gray-1)' : 'transparent',
                      borderLeft: selectedColor === colorKey ? '2px solid var(--mantine-color-blue-5)' : '2px solid transparent'
                    }}
                  >
                    <Group gap="sm">
                      <Box
                        w={24}
                        h={24}
                        style={{
                          backgroundColor: colors[colorKey],
                          borderRadius: 4,
                          border: '1px solid var(--mantine-color-gray-3)'
                        }}
                      />
                      <Stack gap={0}>
                        <Text size="sm" fw={500}>{COLOR_LABELS[colorKey] || colorKey}</Text>
                        <Text size="xs" c="dimmed">{colors[colorKey]}</Text>
                      </Stack>
                    </Group>
                  </UnstyledButton>
                ))}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </ScrollArea>
  );

  const renderPresets = () => (
    <Box py="md">
      <Group gap="sm" mb="lg">
        <TextInput
          placeholder="Enter preset name"
          value={newPresetName}
          onChange={(e) => setNewPresetName(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Button
          leftSection={<IconDeviceFloppy size={16} />}
          onClick={handleSavePreset}
        >
          Save Current Colors
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        {presets && Object.entries(presets).map(([name, scheme]) => (
          <Card
            key={name}
            p="sm"
            withBorder
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            onClick={() => {
              applyPreset(name);
              message.success(`Applied ${name} color scheme`);
              updatePreview();
            }}
          >
            <Group justify="space-between" mb="xs">
              <Text fw={500}>{name}</Text>
              {!['default', 'dark', 'nature', 'ocean', 'sunset', 'midnight'].includes(name) && (
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePreset(name);
                  }}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              )}
            </Group>
            <Box style={{ borderRadius: 4, overflow: 'hidden' }}>
              <Box
                p="xs"
                style={{
                  backgroundColor: scheme.primary,
                  color: scheme.buttonText
                }}
              >
                <Text size="sm" fw={500}>{name}</Text>
              </Box>
              <Box
                p="sm"
                style={{
                  backgroundColor: scheme.background,
                  color: scheme.text
                }}
              >
                <Group gap="xs" justify="center" mt="xs">
                  {['primary', 'secondary', 'accent', 'success', 'warning', 'danger'].map(key => (
                    <Tooltip key={key} label={key} position="top">
                      <Box
                        w={24}
                        h={24}
                        style={{
                          backgroundColor: scheme[key],
                          borderRadius: 4,
                          border: '1px solid rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </Tooltip>
                  ))}
                </Group>
              </Box>
            </Box>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );

  return (
    <Modal
      title={
        <Group gap="xs">
          <IconPalette size={20} />
          <span>Advanced Color Customizer</span>
        </Group>
      }
      opened={visible}
      onClose={onClose}
      size="xl"
      styles={{ body: { maxHeight: '80vh', overflow: 'auto' } }}
    >
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="customize" leftSection={<IconSettings size={16} />}>
            Customize Colors
          </Tabs.Tab>
          <Tabs.Tab value="presets" leftSection={<IconLayoutGrid size={16} />}>
            Color Presets
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="customize" pt="md">
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
              <Box style={{ borderRight: '1px solid var(--mantine-color-gray-3)' }} pr="md">
                <Group justify="space-between" mb="md">
                  <Text fw={500}>Mode:</Text>
                  <Switch
                    onLabel="Advanced"
                    offLabel="Simple"
                    checked={advancedMode}
                    onChange={(event) => setAdvancedMode(event.currentTarget.checked)}
                  />
                </Group>

                {advancedMode ? renderColorCategories() : (
                  <Box mt="md">
                    <Title order={5} mb="md">Choose a color to customize</Title>
                    <Group gap="sm" wrap="wrap">
                      {['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'background', 'text'].map(colorKey => (
                        <ColorSwatch
                          key={colorKey}
                          color={colors[colorKey]}
                          label={COLOR_LABELS[colorKey]}
                          active={selectedColor === colorKey}
                          onClick={() => handleColorSelect(colorKey)}
                        />
                      ))}
                    </Group>
                  </Box>
                )}
              </Box>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6, lg: 5 }}>
              <Box px="md">
                {renderColorPicker()}

                <Divider
                  label={
                    <Group gap="xs">
                      <IconEye size={16} />
                      <span>Preview</span>
                    </Group>
                  }
                  labelPosition="center"
                  my="md"
                />

                <ElementPreview style={currentPreview} colors={colors} />
              </Box>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Box pl="md" style={{ borderLeft: '1px solid var(--mantine-color-gray-3)' }}>
                <Title order={5} mb="md">Tips & Information</Title>

                <Card withBorder p="sm" mb="md">
                  <Text fw={500} mb="xs">About this color</Text>
                  <Text size="sm">
                    <Text component="span" fw={600}>{COLOR_LABELS[selectedColor] || selectedColor}</Text> is used for{' '}
                    {selectedColor === 'primary' && 'the main brand color and primary buttons'}
                    {selectedColor === 'secondary' && 'secondary elements and less prominent UI'}
                    {selectedColor === 'accent' && 'accent elements that should stand out'}
                    {selectedColor === 'success' && 'success messages and completion states'}
                    {selectedColor === 'warning' && 'warning messages and cautionary elements'}
                    {selectedColor === 'danger' && 'error messages and destructive actions'}
                    {selectedColor === 'info' && 'informational messages and neutral states'}
                    {selectedColor === 'background' && 'the main background of the application'}
                    {selectedColor === 'text' && 'the main text color throughout the application'}
                    {!['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info', 'background', 'text'].includes(selectedColor) && 'specific UI elements'}
                  </Text>
                </Card>

                <Card withBorder p="sm" mb="md">
                  <Text fw={500} mb="xs">Color Theory Tips</Text>
                  <Stack gap="xs">
                    <Text size="sm">• Use contrasting colors for text and backgrounds for better readability</Text>
                    <Text size="sm">• Maintain a consistent color palette with 2-3 primary colors</Text>
                    <Text size="sm">• Use warm colors (red, orange) for actions and cool colors (blue, green) for information</Text>
                    <Text size="sm">• The "Generate from Primary" button can help create a harmonious palette</Text>
                  </Stack>
                </Card>

                <Card
                  withBorder
                  p="sm"
                  style={{ borderTop: `3px solid ${colors[selectedColor]}` }}
                >
                  <Text fw={500} mb="xs">Current Selection</Text>
                  <Group>
                    <Box
                      w={48}
                      h={48}
                      style={{
                        backgroundColor: colors[selectedColor],
                        borderRadius: 4,
                        border: '1px solid var(--mantine-color-gray-3)'
                      }}
                    />
                    <Stack gap={0}>
                      <Text ff="monospace" fw={500}>{colors[selectedColor]}</Text>
                      <Text size="sm" c="dimmed">{COLOR_LABELS[selectedColor] || selectedColor}</Text>
                    </Stack>
                  </Group>
                </Card>
              </Box>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="presets" pt="md">
          {renderPresets()}
        </Tabs.Panel>
      </Tabs>

      <Divider my="md" />

      <Group justify="space-between">
        <Button
          variant="light"
          leftSection={<IconHighlight size={16} />}
          onClick={handleGenerateFromPrimary}
        >
          Generate from Primary
        </Button>
        <Group>
          <Button variant="default" leftSection={<IconArrowBack size={16} />} onClick={handleReset}>
            Reset to Default
          </Button>
          <Button onClick={onClose}>
            Close
          </Button>
        </Group>
      </Group>
    </Modal>
  );
});

export default ColorCustomizer;
