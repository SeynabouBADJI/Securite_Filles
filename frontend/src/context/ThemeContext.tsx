import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeType = 'light' | 'dark';

export interface Theme {
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  secondaryColor: string;
  cardColor: string;
  borderColor: string;
  iconColor: string;
  headerColor: string;
  headerTextColor: string;
  sosColor: string;
  successColor: string;
  warningColor: string;
  dangerColor: string;
}

export const lightTheme: Theme = {
  backgroundColor: '#ffffff',
  textColor: '#333333',
  primaryColor: '#e91e63',
  secondaryColor: '#ff9800',
  cardColor: '#f9f9f9',
  borderColor: '#f0f0f0',
  iconColor: '#666666',
  headerColor: '#e91e63',
  headerTextColor: '#ffffff',
  sosColor: '#ff1744',
  successColor: '#4caf50',
  warningColor: '#ff9800',
  dangerColor: '#f44336',
};

export const darkTheme: Theme = {
  backgroundColor: '#121212',
  textColor: '#ffffff',
  primaryColor: '#e91e63',
  secondaryColor: '#ff9800',
  cardColor: '#1e1e1e',
  borderColor: '#333333',
  iconColor: '#cccccc',
  headerColor: '#1e1e1e',
  headerTextColor: '#e91e63',
  sosColor: '#ff1744',
  successColor: '#4caf50',
  warningColor: '#ff9800',
  dangerColor: '#f44336',
};

const ThemeContext = createContext<{
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};