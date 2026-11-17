import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ParseOptions } from './types';

export interface FixtureCase {
  file: string;
  options?: ParseOptions;
  errors?: { path: string; keyword: string }[];
}

export interface FixtureManifest {
  valid: FixtureCase[];
  invalid: FixtureCase[];
}

export const FIXTURES_DIR = join(__dirname, '..', 'fixtures');

export function readFixture(file: string): unknown {
  return JSON.parse(readFileSync(join(FIXTURES_DIR, file), 'utf8')) as unknown;
}

export function readManifest(): FixtureManifest {
  return readFixture('manifest.json') as FixtureManifest;
}
