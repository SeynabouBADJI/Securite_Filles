import { useTheme } from '../context/ThemeContext';
import { StyleSheet } from 'react-native';

export const useThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  styleCreator: (theme: any) => T
) => {
  const { theme } = useTheme();
  return StyleSheet.create(styleCreator(theme));
};