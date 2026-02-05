const tintColorLight = '#4285F4';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#1e293b',
    background: '#fff',
    tint: tintColorLight,
    primary: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#0f172a',
    tint: tintColorDark,
    primary: tintColorLight, // Keeping primary blue even in dark mode for consistency
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
