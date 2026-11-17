# Changelog

## 1.0.0

- JSON Schema 2020-12 for a sign-in page config: features (remember me with an hour cap, forgot password, sign up, demo accounts), field validation, 20 theme colour tokens plus font, radii, spacing and type, logo motion (intro <= 1200 ms, micro <= 300 ms, idle <= 600 ms) and copy.
- `parseSignInConfig` / `assertSignInConfig`: zero-dependency validator; every error has a JSON Pointer `path` and a `keyword`.
- Theme colours checked at load: each text token reaches 4.5:1 against its surface.
- `sessionMaxHours` option rejects a remember-me cap above the host session limit.
- `toSignInTheme` (server page) and `toAuthTheme` (app form) map the tokens.
- `fixtures/` with `manifest.json`: shared valid and invalid cases for other runtimes.
