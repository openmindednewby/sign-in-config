import schemaJson from '../schema/sign-in-config.schema.json';
import { checkColors } from './contrast';
import { checkSessionCap, checkValidation } from './rules';
import { validateAgainstSchema } from './schemaValidator';
import type { ParseOptions, ParseResult, SignInConfig, SignInConfigError } from './types';

/** The shipped JSON Schema (2020-12), byte-identical to schema/sign-in-config.schema.json. */
export const signInConfigSchema: Readonly<Record<string, unknown>> = schemaJson;

type Decoded = { value: unknown } | { error: SignInConfigError };

/** Validates a config object or JSON text: schema first, then colours, contrast, patterns and the session cap. */
export function parseSignInConfig(input: unknown, options: ParseOptions = {}): ParseResult {
  const decoded = decode(input);
  if ('error' in decoded) {
    return { ok: false, errors: [decoded.error] };
  }
  const schemaErrors = validateAgainstSchema(signInConfigSchema, decoded.value);
  if (schemaErrors.length > 0) {
    return { ok: false, errors: sortErrors(schemaErrors) };
  }
  const config = decoded.value as SignInConfig;
  const errors = [...checkColors(config.theme.colors), ...checkValidation(config.validation), ...checkSessionCap(config.features, options)];
  return errors.length > 0 ? { ok: false, errors: sortErrors(errors) } : { ok: true, config };
}

/** Returns the valid config or throws one line per error, so a host fails at startup or build, never at render. */
export function assertSignInConfig(input: unknown, options: ParseOptions = {}): SignInConfig {
  const result = parseSignInConfig(input, options);
  if (result.ok) {
    return result.config;
  }
  const lines = result.errors.map((e) => `${e.path === '' ? '/' : e.path}: ${e.message}`);
  throw new Error(`Invalid sign-in config:\n${lines.join('\n')}`);
}

function decode(input: unknown): Decoded {
  if (typeof input !== 'string') {
    return { value: input };
  }
  try {
    return { value: JSON.parse(input) as unknown };
  } catch (error) {
    return { error: { path: '', keyword: 'json', message: error instanceof Error ? error.message : String(error) } };
  }
}

function sortErrors(errors: SignInConfigError[]): SignInConfigError[] {
  const order = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);
  return [...errors].sort((a, b) => order(a.path, b.path) || order(a.keyword, b.keyword));
}
