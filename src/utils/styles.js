import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function to merge Tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Animation keyframes for gradient text
export const gradientTextKeyframes = {
  '0%, 100%': {
    'background-size': '200% 200%',
    'background-position': 'left center',
  },
  '50%': {
    'background-size': '200% 200%',
    'background-position': 'right center',
  },
};

// Shadow styles for neumorphic design
export const neumorphicShadows = {
  light: {
    outer: '12px 12px 24px #b8b9be, -12px -12px 24px #ffffff',
    inner: 'inset 6px 6px 12px #b8b9be, inset -6px -6px 12px #ffffff',
    glow: '0 0 15px rgba(59, 130, 246, 0.5)',
  },
  dark: {
    outer: '12px 12px 24px #0f172a, -12px -12px 24px #1e293b',
    inner: 'inset 6px 6px 12px #0f172a, inset -6px -6px 12px #1e293b',
    glow: '0 0 15px rgba(96, 165, 250, 0.5)',
  },
};

// Theme colors with opacity variants
export const themeColors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  accent: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
};
