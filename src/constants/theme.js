// CartaOn — Design System (tema "Estrada")
// Paleta automotiva: azul marinho profissional

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
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryGlow: {
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};
