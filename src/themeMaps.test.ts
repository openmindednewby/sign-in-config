import { toAuthTheme, toSignInTheme } from './themeMaps';
import { readFixture } from './testFixtures.test-support';
import type { AuthThemeShape, SignInConfig } from './types';

const SERVER_THEME_KEYS = [
  'brand', 'brandHover', 'brandInk', 'brandOnLight', 'band', 'ink', 'label', 'line', 'muted', 'card',
  'pageTop', 'pageBottom', 'shadow', 'focusRing', 'errorBackground', 'errorBorder', 'errorText',
  'rowBackground', 'rowHover', 'fontFamily',
];

const base: AuthThemeShape = {
  colors: { background: '#000000', surface: '#000000', text: '#000000', textSecondary: '#000000', border: '#000000', primary: '#000000', onPrimary: '#000000', danger: '#000000', success: '#000000' },
  radii: { input: 4, card: 6 },
  spacing: { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  typography: { title: 20, subtitle: 14, label: 13, body: 15, caption: 11 },
};

describe('toSignInTheme', () => {
  it('with a config theme, returns every token the server theme record needs', () => {
    const { theme } = readFixture('valid/minimal.json') as SignInConfig;

    const tokens = toSignInTheme(theme);

    expect(Object.keys(tokens)).toEqual(expect.arrayContaining(SERVER_THEME_KEYS));
  });

  it('with a config theme, copies colours and font unchanged', () => {
    const { theme } = readFixture('valid/full.json') as SignInConfig;

    const tokens = toSignInTheme(theme);

    expect([tokens.muted, tokens.fontFamily]).toEqual([theme.colors.muted, theme.fontFamily]);
  });
});

describe('toAuthTheme', () => {
  it('with a config theme, maps page, card, text and brand tokens onto the app form colours', () => {
    const { theme } = readFixture('valid/minimal.json') as SignInConfig;
    const c = theme.colors;

    const auth = toAuthTheme(theme, base);

    expect(auth.colors).toEqual({
      background: c.pageTop, surface: c.card, text: c.ink, textSecondary: c.muted, border: c.line,
      primary: c.brand, onPrimary: c.brandInk, danger: c.errorText, success: c.success,
    });
  });

  it('with no radii, spacing or type in the config, keeps the base values', () => {
    const { theme } = readFixture('valid/minimal.json') as SignInConfig;

    const auth = toAuthTheme(theme, base);

    expect([auth.radii, auth.spacing, auth.typography]).toEqual([base.radii, base.spacing, base.typography]);
  });

  it('with radii in the config, overrides the base radii', () => {
    const { theme } = readFixture('valid/full.json') as SignInConfig;

    const auth = toAuthTheme(theme, base);

    expect(auth.radii).toEqual({ input: theme.radii?.input, card: theme.radii?.card });
  });
});
