import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { signInConfigSchema } from './parse';
import { SUPPORTED_KEYWORDS } from './schemaValidator';
import { FIXTURES_DIR, readManifest } from './testFixtures.test-support';

const NAMED_MAPS = new Set(['properties', '$defs', 'dependentRequired']);

function keywordsOf(node: unknown, found: Set<string>): Set<string> {
  if (Array.isArray(node)) {
    node.forEach((item) => keywordsOf(item, found));
    return found;
  }
  if (typeof node !== 'object' || node === null) {
    return found;
  }
  for (const [key, child] of Object.entries(node)) {
    found.add(key);
    if (NAMED_MAPS.has(key)) {
      Object.values(child as object).forEach((sub) => keywordsOf(sub, found));
    } else if (typeof child === 'object') {
      keywordsOf(child, found);
    }
  }
  return found;
}

describe('signInConfigSchema', () => {
  it('with the shipped schema, uses only keywords the validator supports', () => {
    const supported = [...SUPPORTED_KEYWORDS];

    const used = [...keywordsOf(signInConfigSchema, new Set<string>())];

    expect(supported).toEqual(expect.arrayContaining(used));
  });

  it('with the fixtures folder, lists every fixture file in the manifest', () => {
    const manifest = readManifest();
    const onDisk = ['valid', 'invalid'].flatMap((dir) => readdirSync(join(FIXTURES_DIR, dir)).map((f) => `${dir}/${f}`));

    const listed = [...manifest.valid, ...manifest.invalid].map((c) => c.file);

    expect(listed.sort()).toEqual(onDisk.sort());
  });
});
