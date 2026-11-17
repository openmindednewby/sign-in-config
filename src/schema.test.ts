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

describe('signInConfigSchema motion names', () => {
  const motion = (signInConfigSchema as { $defs: { motion: { properties: Record<string, { properties: Record<string, { enum: string[] }> }> } } }).$defs.motion.properties;

  it('with the intro preset enum, lists exactly the logo-kit raster intro names', () => {
    const rasterIntros = ['fade-up', 'scale-settle', 'mask-wipe', 'light-sweep', 'focus-in', 'glow-sweep', 'punch-sweep', 'double-sweep', 'burst-settle', 'tilt-sweep'];

    const names = motion.intro.properties.preset.enum;

    expect(names).toEqual(rasterIntros);
  });

  it('with the micro preset enum, lists exactly the logo-kit raster micro names', () => {
    const rasterMicros = ['pulse', 'glint', 'nudge', 'underline-draw'];

    const names = motion.micro.properties.preset.enum;

    expect(names).toEqual(rasterMicros);
  });

  it('with the idle recipe enum, lists exactly the logo-kit raster idle names', () => {
    const rasterIdles = ['slow-glint', 'glow-breathe', 'sheen-drift', 'soft-lift', 'twin-shimmer'];

    const names = motion.idle.properties.recipe.enum;

    expect(names).toEqual(rasterIdles);
  });
});
