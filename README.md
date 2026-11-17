# @dloizides/sign-in-config

One JSON file configures a sign-in page: which features are on, how fields are validated, the theme colours, the logo motion and every piece of copy. The same file drives a server-rendered page and an app form.

```bash
npm install @dloizides/sign-in-config
```

## Use

```ts
import { assertSignInConfig, toAuthTheme, toSignInTheme } from '@dloizides/sign-in-config';
import raw from './sign-in.json';

const config = assertSignInConfig(raw, { sessionMaxHours: 10 });
const serverTheme = toSignInTheme(config.theme);
const formTheme = toAuthTheme(config.theme, defaultFormTheme);
```

`assertSignInConfig` throws one line per error (`/motion/intro/durationMs: must be at most 1200`). Call it at startup or build so a bad config never reaches render. `parseSignInConfig` returns `{ ok, config }` or `{ ok: false, errors }` instead.

## Keys

| Key | What it holds |
| --- | --- |
| `version` | Always `1`. |
| `features` | `rememberMe { enabled, maxHours }`, `forgotPassword { enabled, tokenMinutes }`, `signUp { enabled, href }`, `demoAccounts { enabled }`. |
| `validation` | `username { kind: email or text, required, minLength, maxLength, pattern, patternMessage }`, `password` (same, no `kind`). |
| `theme` | `colors` (20 tokens), `fontFamily`, optional `radii`, `spacing`, `typography`. |
| `motion` | `enabled`, `intro { preset, durationMs <= 1200 }`, `micro { preset, durationMs <= 300 }`, `idle { recipe, durationMs <= 600 }`. Renderers stay still under reduced motion. |
| `copy` | Labels and messages. Placeholders: `{field}`, `{min}`, `{max}`, `{label}`. Turning a feature on makes its copy keys required. |

## Checks

1. Schema: unknown keys, types, ranges, enums, patterns, feature copy.
2. Colours: every token parses; each text token reaches 4.5:1 on its surface (see `TEXT_CONTRAST_PAIRS`).
3. Validation: each `pattern` compiles; `minLength` is not above `maxLength`.
4. Session: `rememberMe.maxHours` is not above `options.sessionMaxHours`.

Each error is `{ path, keyword, message }`; `path` is a JSON Pointer. Semantic keywords are `color`, `contrast`, `regex`, `range`, `sessionCap`; the rest are schema keywords.

## Other runtimes

`schema/sign-in-config.schema.json` is the contract. `fixtures/manifest.json` lists every valid and invalid fixture with the expected `{ path, keyword }` errors, sorted by path then keyword. Copy both byte for byte and assert the same results. A required key is reported at the missing key's path; an unknown key at its own path.

## License

MIT
