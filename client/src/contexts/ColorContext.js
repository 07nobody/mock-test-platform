import React, { createContext, useState, useContext, useEffect } from 'react';

const ColorContext = createContext();

// Create a custom hook to use the color context
export const useColors = () => {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error('useColors must be used within a ColorProvider');
  }
  return context;
};

// Default color scheme with expanded color options
const defaultColors = {
  // Primary UI colors
  primary: '#2563eb',
  secondary: '#6b7280',
  accent: '#8b5cf6',
  
  // State colors
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#0ea5e9',
  
  // Background colors
  background: '#ffffff',
  backgroundSecondary: '#f9fafb',
  backgroundTertiary: '#f3f4f6',
  
  // Text colors
  text: '#111827',
  textSecondary: '#4b5563',
  textTertiary: '#9ca3af',
  textInverse: '#ffffff',
  
  // Border colors
  border: '#e5e7eb',
  borderDark: '#d1d5db',
  
  // Component specific
  cardBackground: '#ffffff',
  navBackground: '#ffffff',
  sidebarBackground: '#f9fafb',
  headerBackground: '#ffffff',
  footerBackground: '#f9fafb',
  
  // Interactive elements
  buttonBackground: '#2563eb',
  buttonText: '#ffffff',
  inputBackground: '#ffffff',
  inputBorder: '#d1d5db',
  
  // Additional UI elements
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  divider: '#e5e7eb',
};

// Enhanced predefined color presets - define them outside of the component
const predefinedColorPresets = {
  default: defaultColors,
  dark: {
    // Primary UI colors
    primary: '#3b82f6',
    secondary: '#9ca3af',
    accent: '#a78bfa',
    
    // State colors
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
    info: '#38bdf8',
    
    // Background colors
    background: '#111827',
    backgroundSecondary: '#1f2937',
    backgroundTertiary: '#374151',
    
    // Text colors
    text: '#f9fafb',
    textSecondary: '#e5e7eb',
    textTertiary: '#9ca3af',
    textInverse: '#111827',
    
    // Border colors
    border: '#374151',
    borderDark: '#4b5563',
    
    // Component specific
    cardBackground: '#1f2937',
    navBackground: '#111827',
    sidebarBackground: '#1f2937',
    headerBackground: '#111827',
    footerBackground: '#1f2937',
    
    // Interactive elements
    buttonBackground: '#3b82f6',
    buttonText: '#ffffff',
    inputBackground: '#374151',
    inputBorder: '#4b5563',
    
    // Additional UI elements
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    divider: '#374151',
  },
  nature: {
    // Primary UI colors
    primary: '#059669',
    secondary: '#84cc16',
    accent: '#15803d',
    
    // State colors
    success: '#22c55e',
    warning: '#eab308',
    danger: '#dc2626',
    info: '#0ea5e9',
    
    // Background colors
    background: '#f0fdf4',
    backgroundSecondary: '#ecfdf5',
    backgroundTertiary: '#d1fae5',
    
    // Text colors
    text: '#14532d',
    textSecondary: '#166534',
    textTertiary: '#4ade80',
    textInverse: '#ffffff',
    
    // Border colors
    border: '#86efac',
    borderDark: '#4ade80',
    
    // Component specific
    cardBackground: '#ecfdf5',
    navBackground: '#f0fdf4',
    sidebarBackground: '#ecfdf5',
    headerBackground: '#f0fdf4',
    footerBackground: '#ecfdf5',
    
    // Interactive elements
    buttonBackground: '#059669',
    buttonText: '#ffffff',
    inputBackground: '#ffffff',
    inputBorder: '#86efac',
    
    // Additional UI elements
    shadow: 'rgba(5, 150, 105, 0.1)',
    overlay: 'rgba(5, 150, 105, 0.5)',
    divider: '#86efac',
  },
  ocean: {
    // Primary UI colors
    primary: '#0ea5e9',
    secondary: '#38bdf8',
    accent: '#0284c7',
    
    // State colors
    success: '#06b6d4',
    warning: '#fbbf24',
    danger: '#f43f5e',
    info: '#0ea5e9',
    
    // Background colors
    background: '#f0f9ff',
    backgroundSecondary: '#e0f2fe',
    backgroundTertiary: '#bae6fd',
    
    // Text colors
    text: '#0c4a6e',
    textSecondary: '#0369a1',
    textTertiary: '#38bdf8',
    textInverse: '#ffffff',
    
    // Border colors
    border: '#7dd3fc',
    borderDark: '#38bdf8',
    
    // Component specific
    cardBackground: '#e0f2fe',
    navBackground: '#f0f9ff',
    sidebarBackground: '#e0f2fe',
    headerBackground: '#f0f9ff',
    footerBackground: '#e0f2fe',
    
    // Interactive elements
    buttonBackground: '#0ea5e9',
    buttonText: '#ffffff',
    inputBackground: '#ffffff',
    inputBorder: '#7dd3fc',
    
    // Additional UI elements
    shadow: 'rgba(14, 165, 233, 0.1)',
    overlay: 'rgba(14, 165, 233, 0.5)',
    divider: '#7dd3fc',
  },
  sunset: {
    // Primary UI colors
    primary: '#f97316',
    secondary: '#fb923c',
    accent: '#c2410c',
    
    // State colors
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#0ea5e9',
    
    // Background colors
    background: '#fff7ed',
    backgroundSecondary: '#ffedd5',
    backgroundTertiary: '#fed7aa',
    
    // Text colors
    text: '#7c2d12',
    textSecondary: '#9a3412',
    textTertiary: '#fb923c',
    textInverse: '#ffffff',
    
    // Border colors
    border: '#fed7aa',
    borderDark: '#fb923c',
    
    // Component specific
    cardBackground: '#ffedd5',
    navBackground: '#fff7ed',
    sidebarBackground: '#ffedd5',
    headerBackground: '#fff7ed',
    footerBackground: '#ffedd5',
    
    // Interactive elements
    buttonBackground: '#f97316',
    buttonText: '#ffffff',
    inputBackground: '#ffffff',
    inputBorder: '#fed7aa',
    
    // Additional UI elements
    shadow: 'rgba(249, 115, 22, 0.1)',
    overlay: 'rgba(249, 115, 22, 0.5)',
    divider: '#fed7aa',
  },
  midnight: {
    // Primary UI colors
    primary: '#8b5cf6',
    secondary: '#a78bfa',
    accent: '#7c3aed',
    
    // State colors
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#0ea5e9',
    
    // Background colors
    background: '#1e1b4b',
    backgroundSecondary: '#312e81',
    backgroundTertiary: '#4338ca',
    
    // Text colors
    text: '#e0e7ff',
    textSecondary: '#c7d2fe',
    textTertiary: '#a5b4fc',
    textInverse: '#1e1b4b',
    
    // Border colors
    border: '#4338ca',
    borderDark: '#3730a3',
    
    // Component specific
    cardBackground: '#312e81',
    navBackground: '#1e1b4b',
    sidebarBackground: '#312e81',
    headerBackground: '#1e1b4b',
    footerBackground: '#312e81',
    
    // Interactive elements
    buttonBackground: '#8b5cf6',
    buttonText: '#ffffff',
    inputBackground: '#312e81',
    inputBorder: '#4338ca',
    
    // Additional UI elements
    shadow: 'rgba(79, 70, 229, 0.3)',
    overlay: 'rgba(79, 70, 229, 0.7)',
    divider: '#4338ca',
  },
};

// Color categories for the UI
const colorCategories = [
  {
    name: 'Primary Colors',
    description: 'Main color scheme for the application',
    colors: ['primary', 'secondary', 'accent']
  },
  {
    name: 'State Colors',
    description: 'Colors representing different states and feedback',
    colors: ['success', 'warning', 'danger', 'info']
  },
  {
    name: 'Background Colors',
    description: 'Background colors for different sections',
    colors: ['background', 'backgroundSecondary', 'backgroundTertiary']
  },
  {
    name: 'Text Colors',
    description: 'Text colors for different purposes',
    colors: ['text', 'textSecondary', 'textTertiary', 'textInverse']
  },
  {
    name: 'Border Colors',
    description: 'Colors for borders and dividers',
    colors: ['border', 'borderDark', 'divider']
  },
  {
    name: 'Component Colors',
    description: 'Specific colors for UI components',
    colors: ['cardBackground', 'navBackground', 'sidebarBackground', 'headerBackground', 'footerBackground']
  },
  {
    name: 'Interactive Elements',
    description: 'Colors for buttons, inputs and interactive elements',
    colors: ['buttonBackground', 'buttonText', 'inputBackground', 'inputBorder']
  },
  {
    name: 'Special Effects',
    description: 'Colors for shadows, overlays and effects',
    colors: ['shadow', 'overlay']
  }
];

// Function to update CSS variables based on color state
const updateCSSVariables = (colors) => {
  // Map ColorContext keys to CSS variable names
  const cssVarMap = {
    primary: '--primary',
    secondary: '--secondary',
    accent: '--accent',
    success: '--success',
    warning: '--warning',
    danger: '--danger',
    info: '--info',
    background: '--background-primary',
    backgroundSecondary: '--background-secondary',
    backgroundTertiary: '--background-tertiary',
    text: '--text-primary',
    textSecondary: '--text-secondary',
    textTertiary: '--text-tertiary',
    textInverse: '--text-white',
    border: '--border-color',
    borderDark: '--border-color-dark',
  };

  // Update CSS variables
  Object.entries(colors).forEach(([key, value]) => {
    if (cssVarMap[key]) {
      document.documentElement.style.setProperty(cssVarMap[key], value);
      
      // Also update related variables (like hover states) with slight modifications
      if (key === 'primary') {
        // Create a slightly darker version for hover
        const darkerColor = adjustColorBrightness(value, -10);
        document.documentElement.style.setProperty('--primary-hover', darkerColor);
        // Create a lighter version for light variant
        const lighterColor = adjustColorBrightness(value, 40, true);
        document.documentElement.style.setProperty('--primary-light', lighterColor);
      }
      
      // Do the same for other main colors
      if (['secondary', 'accent', 'success', 'warning', 'danger'].includes(key)) {
        const baseVar = cssVarMap[key];
        const darkerColor = adjustColorBrightness(value, -10);
        const lighterColor = adjustColorBrightness(value, 40, true);
        document.documentElement.style.setProperty(`${baseVar}-hover`, darkerColor);
        document.documentElement.style.setProperty(`${baseVar}-light`, lighterColor);
      }
    }
  });
};

// Helper function to adjust color brightness
const adjustColorBrightness = (hex, percent, lighten = false) => {
  // Convert hex to RGB
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);

  // Adjust brightness
  if (lighten) {
    r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
    g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
    b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));
  } else {
    r = Math.max(0, Math.floor(r * (100 - percent) / 100));
    g = Math.max(0, Math.floor(g * (100 - percent) / 100));
    b = Math.max(0, Math.floor(b * (100 - percent) / 100));
  }

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const ColorProvider = ({ children }) => {
  const [colors, setColors] = useState(defaultColors);
  
  // Initialize customPresets state first
  const [customPresets, setCustomPresets] = useState(() => {
    const savedPresets = localStorage.getItem('customColorPresets');
    return savedPresets ? JSON.parse(savedPresets) : {};
  });
  
  // Use the predefined presets (defined outside the component) and combine with custom presets
  const [colorPresets, setColorPresets] = useState(() => ({
    ...predefinedColorPresets,
    ...customPresets
  }));

  // Color categories for organization in the UI
  const colorCategories = [
    {
      name: 'Primary Colors',
      description: 'Main brand and UI colors',
      colors: ['primary', 'secondary', 'accent']
    },
    {
      name: 'State Colors',
      description: 'Colors for different states and notifications',
      colors: ['success', 'warning', 'danger', 'info']
    },
    {
      name: 'Background Colors',
      description: 'Colors for different background levels',
      colors: ['background', 'backgroundSecondary', 'backgroundTertiary']
    },
    {
      name: 'Text Colors',
      description: 'Colors for different text elements',
      colors: ['text', 'textSecondary', 'textTertiary', 'textInverse']
    },
    {
      name: 'Border Colors',
      description: 'Colors for borders and dividers',
      colors: ['border', 'borderDark', 'divider']
    },
    {
      name: 'Component Colors',
      description: 'Colors specific to UI components',
      colors: [
        'cardBackground', 'navBackground', 'sidebarBackground', 
        'headerBackground', 'footerBackground'
      ]
    },
    {
      name: 'Interactive Elements',
      description: 'Colors for buttons, inputs and interactive elements',
      colors: ['buttonBackground', 'buttonText', 'inputBackground', 'inputBorder']
    }
  ];

  // Add this use effect to update CSS variables when colors change
  useEffect(() => {
    updateCSSVariables(colors);
  }, [colors]);

  const updateColor = (key, value) => {
    if (colors[key]) {
      setColors(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const updateMultipleColors = (colorUpdates) => {
    setColors(prev => ({
      ...prev,
      ...colorUpdates
    }));
  };

  // Apply a preset color scheme
  const applyPreset = (presetName) => {
    const preset = colorPresets[presetName];
    if (preset) {
      setColors(preset);
      localStorage.setItem('appColors', JSON.stringify(preset));
    }
  };

  // Save current colors as a new preset
  const saveAsPreset = (presetName) => {
    setCustomPresets(prev => {
      const newPresets = { ...prev, [presetName]: colors };
      localStorage.setItem('customColorPresets', JSON.stringify(newPresets));
      return newPresets;
    });
  };

  // Delete a custom preset
  const deletePreset = (presetName) => {
    if (customPresets[presetName]) {
      setCustomPresets(prev => {
        const newPresets = { ...prev };
        delete newPresets[presetName];
        localStorage.setItem('customColorPresets', JSON.stringify(newPresets));
        return newPresets;
      });
      return true;
    }
    return false;
  };

  // Reset colors to default
  const resetColors = () => {
    setColors(defaultColors);
    localStorage.setItem('appColors', JSON.stringify(defaultColors));
  };

  // Generate a complementary color palette based on primary color
  const generateColorPalette = (baseColor) => {
    const palette = {};
    
    // Convert hex to HSL for easier manipulation
    const hexToHSL = (hex) => {
      let r = parseInt(hex.substring(1, 3), 16) / 255;
      let g = parseInt(hex.substring(3, 5), 16) / 255;
      let b = parseInt(hex.substring(5, 7), 16) / 255;
      
      let max = Math.max(r, g, b);
      let min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      
      if (max === min) {
        h = s = 0; // achromatic
      } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: h = 0;
        }
        h /= 6;
      }
      
      return { h: h * 360, s: s * 100, l: l * 100 };
    };
    
    // Convert HSL to hex
    const hslToHex = (h, s, l) => {
      s /= 100;
      l /= 100;
      
      let c = (1 - Math.abs(2 * l - 1)) * s;
      let x = c * (1 - Math.abs((h / 60) % 2 - 1));
      let m = l - c / 2;
      let r, g, b;
      
      if (0 <= h && h < 60) {
        [r, g, b] = [c, x, 0];
      } else if (60 <= h && h < 120) {
        [r, g, b] = [x, c, 0];
      } else if (120 <= h && h < 180) {
        [r, g, b] = [0, c, x];
      } else if (180 <= h && h < 240) {
        [r, g, b] = [0, x, c];
      } else if (240 <= h && h < 300) {
        [r, g, b] = [x, 0, c];
      } else if (300 <= h && h < 360) {
        [r, g, b] = [c, 0, x];
      }
      
      r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
      g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
      b = Math.round((b + m) * 255).toString(16).padStart(2, '0');
      
      return `#${r}${g}${b}`;
    };
    
    const hsl = hexToHSL(baseColor);
    
    // Create primary and its variations
    palette.primary = baseColor;
    palette.secondary = hslToHex((hsl.h + 60) % 360, hsl.s - 10, hsl.l);
    palette.accent = hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);
    
    // State colors based on common color meanings
    palette.success = '#10b981'; // Keep standard green for success
    palette.warning = '#f59e0b'; // Keep standard amber for warning
    palette.danger = '#ef4444';  // Keep standard red for danger
    palette.info = hslToHex((hsl.h + 210) % 360, 70, 60); // Info blue
    
    // Background colors
    palette.background = '#ffffff'; // Keep white background
    palette.backgroundSecondary = hslToHex(hsl.h, 10, 97);
    palette.backgroundTertiary = hslToHex(hsl.h, 20, 94);
    
    // Text colors
    palette.text = '#111827'; // Keep dark text
    palette.textSecondary = '#4b5563';
    palette.textTertiary = '#9ca3af';
    palette.textInverse = '#ffffff';
    
    // Complement remaining colors
    palette.border = hslToHex(hsl.h, 10, 90);
    palette.borderDark = hslToHex(hsl.h, 10, 80);
    palette.cardBackground = '#ffffff';
    palette.navBackground = '#ffffff';
    palette.sidebarBackground = hslToHex(hsl.h, 10, 97);
    palette.headerBackground = '#ffffff';
    palette.footerBackground = hslToHex(hsl.h, 10, 97);
    palette.buttonBackground = baseColor;
    palette.buttonText = '#ffffff';
    palette.inputBackground = '#ffffff';
    palette.inputBorder = hslToHex(hsl.h, 10, 85);
    palette.shadow = 'rgba(0, 0, 0, 0.1)';
    palette.overlay = 'rgba(0, 0, 0, 0.5)';
    palette.divider = hslToHex(hsl.h, 10, 90);
    
    return palette;
  };

  // Apply CSS variables whenever colors change
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      // Handle special case for shadow and overlay which are rgba values
      if (key === 'shadow' || key === 'overlay') {
        root.style.setProperty(`--${key}`, value);
      } else {
        root.style.setProperty(`--${key}`, value);
        
        // Calculate and set hover and light variations for appropriate colors
        if (['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info'].includes(key)) {
          root.style.setProperty(`--${key}-hover`, adjustColorBrightness(value, -10));
          root.style.setProperty(`--${key}-light`, adjustColorBrightness(value, 40));
        }
      }
    });
  }, [colors]);

  const value = {
    colors,
    updateColor,
    updateMultipleColors,
    presets: { ...colorPresets, ...customPresets },
    categories: colorCategories,
    applyPreset,
    saveAsPreset,
    deletePreset,
    resetColors,
    generateColorPalette,
    adjustColorBrightness
  };

  return (
    <ColorContext.Provider value={value}>
      {children}
    </ColorContext.Provider>
  );
};

export default ColorContext;