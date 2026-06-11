import React, { createContext, useState, useContext } from 'react';
import { Appearance } from 'react-native';

// Tema Paletleri
export const lightColors = {
  background: '#F8FBFF',
  cardBackground: '#FFFFFF',
  text: '#333333',
  textSecondary: '#8E8E93',
  border: '#E2E8F0',
  primary: '#4A90E2',
  shadow: '#000000',
  tabBar: '#FFFFFF',
  tabBarInactive: '#BDBDBD',
  modalBackground: '#FFFFFF',
  modalOverlay: 'rgba(0,0,0,0.4)',
};

export const darkColors = {
  background: '#0F172A',       // Koyu lacivert/füme arka plan
  cardBackground: '#1E293B',   // Kart arka planı
  text: '#F8FAFC',             // Açık renk metin
  textSecondary: '#94A3B8',    // İkincil metin
  border: '#334155',           // Sınır çizgileri
  primary: '#3B82F6',          // Parlak mavi
  shadow: '#000000',
  tabBar: '#1E293B',
  tabBarInactive: '#64748B',
  modalBackground: '#1E293B',
  modalOverlay: 'rgba(0,0,0,0.7)',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const colorScheme = Appearance.getColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
