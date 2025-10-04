import { getTheme } from './themes';

// Get the current theme from localStorage or default to 'dark'
const getCurrentThemeName = () => {
  return localStorage.getItem('app_theme') || 'dark';
};

export const theme = getTheme(getCurrentThemeName());
