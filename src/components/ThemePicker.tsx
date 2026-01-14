import React, { useState } from 'react';
import { useTheme, ColorTheme, colorThemes } from '../contexts/ThemeContext';

const ThemePicker: React.FC = () => {
  const { colorTheme, setColorTheme, theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeColors: { name: ColorTheme; label: string; icon: string }[] = [
    { name: 'purple', label: 'Purple', icon: '💜' },
    { name: 'blue', label: 'Blue', icon: '💙' },
    { name: 'green', label: 'Green', icon: '💚' },
    { name: 'red', label: 'Red', icon: '❤️' },
    { name: 'orange', label: 'Orange', icon: '🧡' },
    { name: 'pink', label: 'Pink', icon: '🩷' },
    { name: 'cyan', label: 'Cyan', icon: '💎' },
    { name: 'amber', label: 'Amber', icon: '💛' },
    { name: 'emerald', label: 'Emerald', icon: '💚' },
    { name: 'indigo', label: 'Indigo', icon: '💙' },
    { name: 'rose', label: 'Rose', icon: '🌹' },
    { name: 'violet', label: 'Violet', icon: '💜' },
    { name: 'teal', label: 'Teal', icon: '🩵' },
    { name: 'lime', label: 'Lime', icon: '💚' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-dark-card border border-dark-border hover:bg-dark-surface transition-all group flex items-center gap-2"
        aria-label="Theme picker"
      >
        <div
          className="w-5 h-5 rounded-full transition-all"
          style={{ backgroundColor: colorThemes[colorTheme].primary }}
        />
        <svg
          className={`w-4 h-4 text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 glass rounded-xl p-4 shadow-glass-lg z-50 animate-slide-up">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white mb-3">Color Theme</h3>
              <div className="grid grid-cols-4 gap-2">
                {themeColors.map(({ name, label, icon }) => (
                  <button
                    key={name}
                    onClick={() => {
                      setColorTheme(name);
                      setIsOpen(false);
                    }}
                    className={`relative p-3 rounded-lg border-2 transition-all group ${
                      colorTheme === name
                        ? 'border-white shadow-glow-purple'
                        : 'border-dark-border hover:border-gray-500'
                    }`}
                    style={{
                      backgroundColor: colorThemes[name].primary + '20',
                    }}
                    title={label}
                  >
                    <div
                      className="w-full h-8 rounded mb-1 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: colorThemes[name].primary }}
                    />
                    <div className="text-xs text-gray-300 text-center">{icon}</div>
                    {colorTheme === name && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-dark-bg" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-dark-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Dark Mode</span>
                <button
                  onClick={toggleTheme}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    theme === 'dark' ? '' : 'bg-gray-400'
                  }`}
                  style={theme === 'dark' ? {
                    backgroundColor: 'var(--color-primary)'
                  } : undefined}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemePicker;

