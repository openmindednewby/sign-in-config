import type { ParseOptions, SignInConfigError, SignInFeatures, SignInValidation } from './types';

const FIELDS = ['username', 'password'] as const;

/** Checks each field pattern compiles and each minLength is not above its maxLength. */
export function checkValidation(validation: SignInValidation | undefined): SignInConfigError[] {
  const errors: SignInConfigError[] = [];
  for (const field of FIELDS) {
    const rule = validation?.[field];
    if (rule === undefined) {
      continue;
    }
    if (rule.pattern !== undefined && !compiles(rule.pattern)) {
      errors.push({ path: `/validation/${field}/pattern`, keyword: 'regex', message: `${rule.pattern} is not a valid regular expression` });
    }
    if (rule.minLength !== undefined && rule.maxLength !== undefined && rule.minLength > rule.maxLength) {
      errors.push({ path: `/validation/${field}/minLength`, keyword: 'range', message: `minLength ${rule.minLength} is above maxLength ${rule.maxLength}` });
    }
  }
  return errors;
}

function compiles(pattern: string): boolean {
  try {
    new RegExp(pattern, 'u');
    return true;
  } catch {
    return false;
  }
}

/** Checks the remember-me cap never exceeds the host session limit (SESSION-1) when the host passes one. */
export function checkSessionCap(features: SignInFeatures | undefined, options: ParseOptions): SignInConfigError[] {
  const maxHours = features?.rememberMe?.maxHours;
  const limit = options.sessionMaxHours;
  if (maxHours === undefined || limit === undefined || maxHours <= limit) {
    return [];
  }
  return [{ path: '/features/rememberMe/maxHours', keyword: 'sessionCap', message: `${maxHours} h is above the session limit of ${limit} h` }];
}
