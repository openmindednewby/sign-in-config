import type { IdleRecipe } from './IdleRecipe';
import type { IntroPreset } from './IntroPreset';
import type { MicroPreset } from './MicroPreset';
import type { UsernameKind } from './UsernameKind';

export interface SignInColors {
  brand: string;
  brandHover: string;
  brandInk: string;
  brandOnLight: string;
  band: string;
  ink: string;
  label: string;
  line: string;
  muted: string;
  card: string;
  pageTop: string;
  pageBottom: string;
  shadow: string;
  focusRing: string;
  errorBackground: string;
  errorBorder: string;
  errorText: string;
  rowBackground: string;
  rowHover: string;
  success: string;
}

export type ColorName = keyof SignInColors;

export interface AuthThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  onPrimary: string;
  danger: string;
  success: string;
}

export interface AuthThemeRadii {
  input: number;
  card: number;
}

export interface AuthThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface AuthThemeTypography {
  title: number;
  subtitle: number;
  label: number;
  body: number;
  caption: number;
}

/** Structural twin of the app form theme, so this package needs no UI dependency. */
export interface AuthThemeShape {
  colors: AuthThemeColors;
  radii: AuthThemeRadii;
  spacing: AuthThemeSpacing;
  typography: AuthThemeTypography;
}

export interface SignInConfigTheme {
  colors: SignInColors;
  fontFamily: string;
  radii?: Partial<AuthThemeRadii>;
  spacing?: Partial<AuthThemeSpacing>;
  typography?: Partial<AuthThemeTypography>;
}

export interface ToggleFeature {
  enabled: boolean;
}

export interface RememberMeFeature extends ToggleFeature {
  maxHours?: number;
}

export interface ForgotPasswordFeature extends ToggleFeature {
  tokenMinutes?: number;
}

export interface SignUpFeature extends ToggleFeature {
  href?: string;
}

export interface SignInFeatures {
  rememberMe?: RememberMeFeature;
  forgotPassword?: ForgotPasswordFeature;
  signUp?: SignUpFeature;
  demoAccounts?: ToggleFeature;
}

export interface FieldRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
}

export interface UsernameRule extends FieldRule {
  kind?: UsernameKind;
}

export interface SignInValidation {
  username?: UsernameRule;
  password?: FieldRule;
}

export interface MotionBeatConfig<TPreset extends string = IntroPreset | MicroPreset> {
  preset: TPreset;
  durationMs?: number;
}

export interface IdleMotionConfig {
  recipe: IdleRecipe;
  durationMs?: number;
}

export interface SignInMotionConfig {
  enabled: boolean;
  intro?: MotionBeatConfig<IntroPreset>;
  micro?: MotionBeatConfig<MicroPreset>;
  idle?: IdleMotionConfig;
}

export interface SignInCopyConfig {
  usernameLabel: string;
  passwordLabel: string;
  submitLabel: string;
  requiredMessage: string;
  tooShortMessage: string;
  tooLongMessage: string;
  footer?: string;
  emailInvalidMessage?: string;
  rememberMeLabel?: string;
  forgotPasswordLink?: string;
  forgotPasswordTitle?: string;
  forgotPasswordSubmit?: string;
  forgotPasswordSent?: string;
  resetPasswordTitle?: string;
  resetPasswordSubmit?: string;
  resetPasswordDone?: string;
  resetPasswordInvalid?: string;
  signUpLink?: string;
  demoToggle?: string;
  demoHint?: string;
  demoAriaLabel?: string;
  demoRowAriaLabel?: string;
}

export interface SignInConfig {
  $schema?: string;
  version: 1;
  features?: SignInFeatures;
  validation?: SignInValidation;
  theme: SignInConfigTheme;
  motion?: SignInMotionConfig;
  copy: SignInCopyConfig;
}

/** One failure: a JSON Pointer to the field, the rule that failed and a developer message. */
export interface SignInConfigError {
  path: string;
  keyword: string;
  message: string;
}

export interface ParseOptions {
  sessionMaxHours?: number;
}

export type ParseResult = { ok: true; config: SignInConfig } | { ok: false; errors: SignInConfigError[] };

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export type SignInThemeTokens = SignInColors & { fontFamily: string };
