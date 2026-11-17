import Ajv2020 from 'ajv/dist/2020';
import { signInConfigSchema } from './parse';
import { readFixture, readManifest } from './testFixtures.test-support';

const SEMANTIC_KEYWORDS = new Set(['color', 'contrast', 'regex', 'range', 'sessionCap']);
const ajv = new Ajv2020({ strict: false, allErrors: true });
const validate = ajv.compile(signInConfigSchema);
const manifest = readManifest();
const cases = [...manifest.valid, ...manifest.invalid].map((c) => [c.file, c] as const);

describe('signInConfigSchema under Ajv', () => {
  it.each(cases)('with fixture %s, agrees with the manifest on schema validity', (_file, fixture) => {
    const expectSchemaValid = (fixture.errors ?? []).every((e) => SEMANTIC_KEYWORDS.has(e.keyword));

    const valid = validate(readFixture(fixture.file));

    expect(valid).toBe(expectSchemaValid);
  });
});
