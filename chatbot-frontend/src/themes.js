export const themes = {
  dark: {
    name: 'Dark',
    colors: {
      background: {
        primary: '#0F0F0F',
        secondary: '#1A1A1A',
        sidebar: '#0A0A0A',
        messageUser: '#2D5BFF',
        messageBot: '#252525',
        hover: '#2A2A2A',
        input: '#1F1F1F',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#B0B0B0',
        tertiary: '#808080',
        muted: '#606060',
      },
      border: {
        primary: '#2A2A2A',
        secondary: '#1F1F1F',
        active: '#3D3D3D',
      },
      accent: {
        primary: '#2D5BFF',
        hover: '#4169FF',
        danger: '#FF4444',
        dangerHover: '#FF6666',
      },
    },
  },
  
  light: {
    name: 'Light',
    colors: {
      background: {
        primary: '#FFFFFF',
        secondary: '#F5F5F5',
        sidebar: '#FAFAFA',
        messageUser: '#2D5BFF',
        messageBot: '#F0F0F0',
        hover: '#E8E8E8',
        input: '#FFFFFF',
      },
      text: {
        primary: '#1A1A1A',
        secondary: '#666666',
        tertiary: '#999999',
        muted: '#AAAAAA',
      },
      border: {
        primary: '#E0E0E0',
        secondary: '#EEEEEE',
        active: '#CCCCCC',
      },
      accent: {
        primary: '#2D5BFF',
        hover: '#4169FF',
        danger: '#DC3545',
        dangerHover: '#E55561',
      },
    },
  },
  
  branded: {
    name: 'Ocean',
    colors: {
      background: {
        primary: '#0A1929',
        secondary: '#132F4C',
        sidebar: '#001E3C',
        messageUser: '#00B4D8',
        messageBot: '#1A3A52',
        hover: '#1E4976',
        input: '#0F2942',
      },
      text: {
        primary: '#E3F2FD',
        secondary: '#90CAF9',
        tertiary: '#64B5F6',
        muted: '#42A5F5',
      },
      border: {
        primary: '#1E4976',
        secondary: '#132F4C',
        active: '#2A5B8C',
      },
      accent: {
        primary: '#00B4D8',
        hover: '#00D9FF',
        danger: '#FF6B6B',
        dangerHover: '#FF8787',
      },
    },
  },
};

export const baseTheme = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  fontSize: {
    xs: '11px',
    sm: '13px',
    md: '14px',
    base: '15px',
    lg: '16px',
    xl: '18px',
    xxl: '24px',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 2px 4px rgba(0, 0, 0, 0.4)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.5)',
  },
  transitions: {
    fast: '0.15s ease',
    normal: '0.25s ease',
    slow: '0.35s ease',
  },
};

export const getTheme = (themeName = 'dark') => {
  const selectedTheme = themes[themeName] || themes.dark;
  return {
    ...baseTheme,
    ...selectedTheme,
  };
};
