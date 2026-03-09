// Abily — Design System (tema "Estrada")
// Paleta automotiva: azul marinho profissional

import { Platform } from 'react-native';

// Returns cross-platform shadow styles (shadowColor/etc on native, boxShadow on web)
const toRgb = (hex) => {
  if (hex === '#000' || hex === '#000000') return '0,0,0';
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
};
export const makeShadow = (color = '#000', offsetY = 2, opacity = 0.08, radius = 6, elevation = 3) =>
  Platform.select({
    web: { boxShadow: `0 ${offsetY}px ${radius}px rgba(${toRgb(color)},${opacity})` },
    default: { shadowColor: color, shadowOffset: { width: 0, height: offsetY }, shadowOpacity: opacity, shadowRadius: radius, elevation },
  });

export const COLORS = {
  // Primary — Azul marinho premium
  primary: '#1D4ED8',
  primaryDark: '#1E3A8A',
  primaryLight: '#EFF6FF',

  // Accent — Âmbar (sinais de trânsito, destaque de preço)
  accent: '#F59E0B',
  accentLight: '#FEF3C7',

  // Semantic
  success: '#059669',
  successLight: '#ECFDF5',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  info: '#0284C7',
  infoLight: '#F0F9FF',

  // Neutrals
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  muted: '#94A3B8',
  textSecondary: '#64748B',
  textPrimary: '#0F172A',
  textLight: '#CBD5E1',

  // Login gradient
  navyDark: '#0F172A',
  navyMid: '#1E3A8A',
};

export const SHADOWS = {
  sm: makeShadow('#000', 1, 0.05, 3, 2),
  md: makeShadow('#000', 2, 0.08, 6, 3),
  lg: makeShadow('#000', 4, 0.12, 12, 6),
  primaryGlow: makeShadow('#1D4ED8', 4, 0.3, 8, 6),
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};
