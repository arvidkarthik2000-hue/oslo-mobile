/**
 * OSLO Design Tokens — inline copy of oslo-shared tokens.
 * Will be replaced with @oslo/shared import once the package is linked.
 */
export const colors = {
  // Accent
  accent: '#0F6E56',
  accentMuted: '#E1F5EE',
  accentStrong: '#085041',

  // Status — clinical meaning only
  statusOk: '#3B6D11',
  statusOkBg: '#EAF3DE',
  statusWatch: '#BA7517',
  statusWatchBg: '#FAEEDA',
  statusFlag: '#A32D2D',
  statusFlagBg: '#FCEBEB',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#5F5E5A',
  textTertiary: '#888780',
  textOnDark: '#FFFFFF',

  // Surfaces
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F7F7F5',
  bgTertiary: '#F1EFE8',

  // Borders
  borderTertiary: 'rgba(0,0,0,0.08)',
  borderSecondary: 'rgba(0,0,0,0.15)',
  borderPrimary: 'rgba(0,0,0,0.25)',
} as const;

export const spacing = (n: number): number => n * 4;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

export const fontFamily = {
  sans: 'Inter',
  mono: 'JetBrains Mono',
} as const;
