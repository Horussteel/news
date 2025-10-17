import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');
  const [compactMode, setCompactMode] = useState(false);
  const [accentColor, setAccentColor] = useState('#667eea');

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appearanceSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setTheme(settings.theme || 'light');
        setFontSize(settings.fontSize || 'medium');
        setCompactMode(settings.compactMode || false);
        setAccentColor(settings.accentColor || '#667eea');
      } catch (error) {
        console.error('Error loading appearance settings:', error);
      }
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme attribute
    root.removeAttribute('data-theme');
    
    // Apply theme
    if (theme === 'auto') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Apply font size
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  // Apply compact mode
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-compact', compactMode.toString());
  }, [compactMode]);

  // Apply accent color
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent-color', accentColor);
    root.style.setProperty('--accent-hover', adjustColor(accentColor, -10));
  }, [accentColor]);

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      theme,
      fontSize,
      compactMode,
      accentColor
    };
    localStorage.setItem('appearanceSettings', JSON.stringify(settings));
  }, [theme, fontSize, compactMode, accentColor]);

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const updateFontSize = (newFontSize) => {
    setFontSize(newFontSize);
  };

  const updateCompactMode = (newCompactMode) => {
    setCompactMode(newCompactMode);
  };

  const updateAccentColor = (newAccentColor) => {
    setAccentColor(newAccentColor);
  };

  const resetToDefaults = () => {
    setTheme('light');
    setFontSize('medium');
    setCompactMode(false);
    setAccentColor('#667eea');
  };

  // Helper function to adjust color brightness
  const adjustColor = (color, amount) => {
    const usePound = color[0] === '#';
    const col = usePound ? color.slice(1) : color;
    const num = parseInt(col, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    r = r > 255 ? 255 : r < 0 ? 0 : r;
    g = g > 255 ? 255 : g < 0 ? 0 : g;
    b = b > 255 ? 255 : b < 0 ? 0 : b;
    return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
  };

  const value = {
    theme,
    fontSize,
    compactMode,
    accentColor,
    updateTheme,
    updateFontSize,
    updateCompactMode,
    updateAccentColor,
    resetToDefaults
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
