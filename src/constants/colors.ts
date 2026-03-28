export const COLORS = {
  bg: {
    base:    '#0f111a',
    surface: '#161826',
    elevated:'#1e2132',
    overlay: '#252840',
  },
  border: {
    subtle:  '#2a2d42',
    default: '#363a55',
    strong:  '#4a4f6e',
  },
  text: {
    primary:   '#e8eaf6',
    secondary: '#9097b8',
    muted:     '#555c7a',
    inverse:   '#0f111a',
  },
  accent: {
    DEFAULT: '#7c83ff',
    soft:    '#3d4280',
    glow:    'rgba(124,131,255,0.15)',
  },
  success: '#4ade80',
  warning: '#fb923c',
  error:   '#f87171',
  syntax: {
    keyword:  '#c792ea',
    string:   '#c3e88d',
    comment:  '#546e7a',
    number:   '#f78c6c',
    function: '#82aaff',
  },
} as const;
