import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Main provider component
export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to 'light'
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // Initialize font size from localStorage or default to 'medium'
  const [fontSize, setFontSize] = useState(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    return savedFontSize || 'medium';
  });

  // Initialize high contrast mode from localStorage or default to false
  const [highContrast, setHighContrast] = useState(() => {
    const savedHighContrast = localStorage.getItem('highContrast');
    return savedHighContrast === 'true';
  });

  // Initialize reduced motion preference
  const [reducedMotion, setReducedMotion] = useState(() => {
    const savedReducedMotion = localStorage.getItem('reducedMotion');
    return savedReducedMotion === 'true';
  });

  // Initialize reading guide/focus mode
  const [focusMode, setFocusMode] = useState(() => {
    const savedFocusMode = localStorage.getItem('focusMode');
    return savedFocusMode === 'true';
  });

  // Initialize screen reader optimizations
  const [screenReaderMode, setScreenReaderMode] = useState(() => {
    const savedScreenReaderMode = localStorage.getItem('screenReaderMode');
    return savedScreenReaderMode === 'true';
  });

  // Initialize keyboard shortcuts help visibility
  const [keyboardShortcutsVisible, setKeyboardShortcutsVisible] = useState(false);

  // Handle theme changes and save to localStorage
  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    console.log(`Toggling theme from ${currentTheme} to ${newTheme}`);
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Handle font size changes and save to localStorage
  const changeFontSize = (size) => {
    console.log(`Changing font size to ${size}`);
    setFontSize(size);
    localStorage.setItem('fontSize', size);
  };

  // Handle high contrast toggle and save to localStorage
  const toggleHighContrast = () => {
    const newValue = !highContrast;
    console.log(`Toggling high contrast to ${newValue}`);
    setHighContrast(newValue);
    localStorage.setItem('highContrast', newValue.toString());
  };

  // Handle reduced motion toggle and save to localStorage
  const toggleReducedMotion = () => {
    const newValue = !reducedMotion;
    console.log(`Toggling reduced motion to ${newValue}`);
    setReducedMotion(newValue);
    localStorage.setItem('reducedMotion', newValue.toString());
  };

  // Toggle focus mode for reading guide
  const toggleFocusMode = () => {
    const newValue = !focusMode;
    console.log(`Toggling focus mode to ${newValue}`);
    setFocusMode(newValue);
    localStorage.setItem('focusMode', newValue.toString());
  };

  // Toggle screen reader optimizations
  const toggleScreenReaderMode = () => {
    const newValue = !screenReaderMode;
    console.log(`Toggling screen reader optimizations to ${newValue}`);
    setScreenReaderMode(newValue);
    localStorage.setItem('screenReaderMode', newValue.toString());
  };

  // Toggle keyboard shortcuts help visibility
  const toggleKeyboardShortcutsHelp = () => {
    setKeyboardShortcutsVisible(!keyboardShortcutsVisible);
  };

  // Apply theme and accessibility settings to document
  useEffect(() => {
    // Apply theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.body.setAttribute('data-theme', currentTheme);
    console.log(`Applied theme: ${currentTheme}`);
    
    // Remove all font size classes first
    document.documentElement.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    // Then add the current font size class
    document.documentElement.classList.add(`font-size-${fontSize}`);
    console.log(`Applied font size: ${fontSize}`);
    
    // Apply high contrast
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
      console.log('High contrast mode enabled');
    } else {
      document.documentElement.classList.remove('high-contrast');
      console.log('High contrast mode disabled');
    }
    
    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
      console.log('Reduced motion mode disabled');
    } else {
      document.documentElement.classList.remove('reduced-motion');
      console.log('Reduced motion mode enabled');
    }

    // Apply focus mode
    if (focusMode) {
      document.documentElement.classList.add('focus-mode');
      console.log('Focus mode enabled');
    } else {
      document.documentElement.classList.remove('focus-mode');
      console.log('Focus mode disabled');
    }

    // Apply screen reader optimizations
    if (screenReaderMode) {
      document.documentElement.classList.add('screen-reader-mode');
      console.log('Screen reader optimizations enabled');
    } else {
      document.documentElement.classList.remove('screen-reader-mode');
      console.log('Screen reader optimizations disabled');
    }
  }, [currentTheme, fontSize, highContrast, reducedMotion, focusMode, screenReaderMode]);

  // Theme context value
  const themeContextValue = {
    currentTheme,
    toggleTheme,
    isDarkMode: currentTheme === 'dark',
    fontSize,
    changeFontSize,
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion,
    focusMode,
    toggleFocusMode,
    screenReaderMode,
    toggleScreenReaderMode,
    keyboardShortcutsVisible,
    toggleKeyboardShortcutsHelp
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;