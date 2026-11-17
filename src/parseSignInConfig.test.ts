import { assertSignInConfig, parseSignInConfig } from './parse';
import { readFixture, readManifest } from './testFixtures.test-support';

const manifest = readManifest();
const validCases = manifest.valid.map((c) => [c.file, c] as const);
const invalidCases = manifest.invalid.map((c) => [c.file, c] as const);

describe('parseSignInConfig', () => {
  it.each(validCases)('with valid fixture %s, returns the config', (_file, fixture) => {
    const input = readFixture(fixture.file);

    const result = parseSignInConfig(input, fixture.options);

    expect(result).toEqual({ ok: true, config: input });
  });

  it.each(invalidCases)('with invalid fixture %s, reports each failing field path', (_file, fixture) => {
    const input = readFixture(fixture.file);

    const result = parseSignInConfig(input, fixture.options);

    const reported = result.ok ? [] : result.errors.map((e) => ({ path: e.path, keyword: e.keyword }));
    expect(reported).toEqual(fixture.errors);
  });

  it('with a JSON string, parses it before validating', () => {
    const config = readFixture('valid/minimal.json');
    const text = JSON.stringify(config);

    const result = parseSignInConfig(text);

    expect(result).toEqual({ ok: true, config });
  });

  it('with text that is not JSON, reports a json error at the root', () => {
    const text = '{ not json';

    const result = parseSignInConfig(text);

    expect(result.ok ? [] : result.errors.map((e) => [e.path, e.keyword])).toEqual([['', 'json']]);
  });

  it('with remember me over the host session cap, names the cap in the message', () => {
    const input = readFixture('invalid/remember-me-over-session-cap.json');
    const sessionMaxHours = 10;

    const result = parseSignInConfig(input, { sessionMaxHours });

    expect(result.ok ? '' : result.errors[0].message).toContain(String(sessionMaxHours));
  });
});

describe('assertSignInConfig', () => {
  it('with a valid config, returns it', () => {
    const input = readFixture('valid/full.json');

    const config = assertSignInConfig(input);

    expect(config).toEqual(input);
  });

  it('with an invalid config, throws naming the field path', () => {
    const input = readFixture('invalid/motion-intro-over-cap.json');

    const act = (): unknown => assertSignInConfig(input);

    expect(act).toThrow('/motion/intro/durationMs');
  });
});
