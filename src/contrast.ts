import { composite, contrastRatio, parseCssColor } from './color';
import type { ColorName, Rgba, SignInColors, SignInConfigError } from './types';

export const MIN_TEXT_CONTRAST = 4.5;

/** Text token and the surface it is drawn on; each pair must reach MIN_TEXT_CONTRAST. */
export const TEXT_CONTRAST_PAIRS: ReadonlyArray<readonly [ColorName, ColorName]> = [
  ['ink', 'card'],
  ['label', 'card'],
  ['muted', 'card'],
  ['brandOnLight', 'card'],
  ['success', 'card'],
  ['brandInk', 'brand'],
  ['brandInk', 'brandHover'],
  ['errorText', 'errorBackground'],
  ['ink', 'rowBackground'],
  ['ink', 'rowHover'],
];

const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };
const RATIO_DIGITS = 2;

const colorPath = (name: ColorName): string => `/theme/colors/${name}`;

/** Checks every theme colour parses and every text pair reaches 4.5:1; errors point at the text token. */
export function checkColors(colors: SignInColors): SignInConfigError[] {
  const errors: SignInConfigError[] = [];
  const parsed = new Map<ColorName, Rgba>();
  for (const name of Object.keys(colors) as ColorName[]) {
    const rgba = parseCssColor(colors[name]);
    if (rgba === null) {
      errors.push({ path: colorPath(name), keyword: 'color', message: `${colors[name]} is not a colour with channels 0-255` });
    } else {
      parsed.set(name, rgba);
    }
  }
  const surfaceOf = surfaces(parsed);
  for (const [text, surface] of TEXT_CONTRAST_PAIRS) {
    const front = parsed.get(text);
    const back = surfaceOf(surface);
    if (front === undefined || back === undefined) {
      continue;
    }
    const ratio = contrastRatio(front, back);
    if (ratio < MIN_TEXT_CONTRAST) {
      errors.push({ path: colorPath(text), keyword: 'contrast', message: `contrast ${ratio.toFixed(RATIO_DIGITS)}:1 against ${surface}, needs ${MIN_TEXT_CONTRAST}:1` });
    }
  }
  return errors;
}

function surfaces(parsed: ReadonlyMap<ColorName, Rgba>): (name: ColorName) => Rgba | undefined {
  const page = composite(parsed.get('pageTop') ?? WHITE, WHITE);
  const card = composite(parsed.get('card') ?? page, page);
  return (name) => {
    if (name === 'card') {
      return card;
    }
    const color = parsed.get(name);
    return color === undefined ? undefined : composite(color, card);
  };
}
