import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'dark' | 'light';
export type ColorTheme = 
  | 'purple' 
  | 'blue' 
  | 'green' 
  | 'red' 
  | 'orange' 
  | 'pink' 
  | 'cyan' 
  | 'amber' 
  | 'emerald' 
  | 'indigo' 
  | 'rose' 
  | 'violet'
  | 'teal'
  | 'lime'
  | 'sky'
  | 'fuchsia'
  | 'slate'
  | 'gold';

interface ThemeContextType {
  theme: Theme;
  colorTheme: ColorTheme;
  toggleTheme: () => void;
  setColorTheme: (color: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const colorThemes: Record<ColorTheme, { primary: string; secondary: string; accent: string }> = {
  purple: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' },
  blue: { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa' },
  green: { primary: '#10b981', secondary: '#059669', accent: '#34d399' },
  red: { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171' },
  orange: { primary: '#f97316', secondary: '#ea580c', accent: '#fb923c' },
  pink: { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6' },
  cyan: { primary: '#06b6d4', secondary: '#0891b2', accent: '#22d3ee' },
  amber: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
  emerald: { primary: '#10b981', secondary: '#059669', accent: '#34d399' },
  indigo: { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8' },
  rose: { primary: '#f43f5e', secondary: '#e11d48', accent: '#fb7185' },
  violet: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' },
  teal: { primary: '#14b8a6', secondary: '#0d9488', accent: '#2dd4bf' },
  lime: { primary: '#84cc16', secondary: '#65a30d', accent: '#a3e635' },
  sky: { primary: '#0ea5e9', secondary: '#0284c7', accent: '#38bdf8' },
  fuchsia: { primary: '#d946ef', secondary: '#c026d3', accent: '#e879f9' },
  slate: { primary: '#64748b', secondary: '#475569', accent: '#94a3b8' },
  gold: { primary: '#eab308', secondary: '#ca8a04', accent: '#facc15' },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) return saved;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'dark';
  });

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    const saved = localStorage.getItem('colorTheme') as ColorTheme;
    return saved || 'purple';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const colors = colorThemes[colorTheme];
    
    // Remove all color theme classes
    Object.keys(colorThemes).forEach(color => {
      root.classList.remove(`theme-${color}`);
    });
    
    // Add current color theme class
    root.classList.add(`theme-${colorTheme}`);
    
    // Set CSS variables
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    
    localStorage.setItem('colorTheme', colorTheme);
  }, [colorTheme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setColorTheme = (color: ColorTheme) => {
    setColorThemeState(color);
  };

  return (
    <ThemeContext.Provider value={{ theme, colorTheme, toggleTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { colorThemes };
