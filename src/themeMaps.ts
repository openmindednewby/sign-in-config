import type { AuthThemeShape, SignInConfigTheme, SignInThemeTokens } from './types';

/** Server page theme: every colour token plus the font stack, keyed like the SignInTheme record. */
export function toSignInTheme(theme: SignInConfigTheme): SignInThemeTokens {
  return { ...theme.colors, fontFamily: theme.fontFamily };
}

/** App form theme: config colours mapped onto the form tokens; radii, spacing and type fall back to base. */
export function toAuthTheme(theme: SignInConfigTheme, base: AuthThemeShape): AuthThemeShape {
  const c = theme.colors;
  return {
    colors: {
      background: c.pageTop,
      surface: c.card,
      text: c.ink,
      textSecondary: c.muted,
      border: c.line,
      primary: c.brand,
      onPrimary: c.brandInk,
      danger: c.errorText,
      success: c.success,
    },
    radii: { ...base.radii, ...theme.radii },
    spacing: { ...base.spacing, ...theme.spacing },
    typography: { ...base.typography, ...theme.typography },
  };
}
