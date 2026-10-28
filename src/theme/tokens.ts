const palette = {
  primary: "#D92534",
  electricBlue: "#0511F2",
  deepBlue: "#263973",
  secondaryBlue: "#117DBF",
  gold: "#D9B64E",
  background: "#F4F6FC",
  surface: "#FFFFFF",
  surfaceSecondary: "#EEF1FA",
  textPrimary: "#263973",
  textSecondary: "#687493",
  textMuted: "#929BB2",
  border: "#E1E6F2",
  success: "#2E9D75",
  error: "#D92534",
} as const;

export const colors = {
  ...palette,
  red: palette.primary,
  electric: palette.electricBlue,
  navy: palette.deepBlue,
  azure: palette.secondaryBlue,
  white: palette.surface,
  title: palette.textPrimary,
  plate: palette.surface,
  textOnPlate: palette.textPrimary,
  primaryText: palette.surface,
  field: palette.surfaceSecondary,
  fieldText: palette.textPrimary,
  placeholder: palette.textMuted,
  shadow: palette.deepBlue,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  compact: 12,
  base: 16,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  huge: 40,
} as const;

export const radius = {
  small: 12,
  medium: 18,
  large: 24,
  extraLarge: 30,
  field: 14,
  key: 20,
  plate: 24,
  pill: 999,
} as const;

export const typography = {
  title: 28,
  subtitle: 18,
  body: 15,
  label: 13,
  badge: 14,
  small: 12,
  visor: 32,
} as const;

export const borders = {
  thin: 1,
  plateLight: 1,
  plateLip: 2,
  selected: 2,
  warning: 2,
  errorStripe: 4,
  conditionStripe: 6,
  photoFrame: 4,
} as const;

export const dimensions = {
  buttonMinHeight: 54,
  touchTarget: 48,
  tabBarHeight: 68,
  led: 14,
  smallLed: 10,
  thumbnail: 56,
  photoMinHeight: 220,
  multilineField: 96,
  stepSegmentHeight: 8,
  pressOffset: 2,
  tabIconFrame: 24,
  searchLens: 14,
  searchHandleLength: 8,
  searchHandleThickness: 2,
  searchHandleOffset: 13,
  listIconWidth: 18,
  listIconHeight: 20,
  listLineHeight: 2,
  listDotSize: 3,
} as const;

export const shadow = {
  shadowColor: colors.deepBlue,
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 3,
} as const;

export const shadows = {
  soft: shadow,
  medium: {
    shadowColor: colors.deepBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  primary: {
    shadowColor: colors.electricBlue,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  accent: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
};
