import type { Rgba } from './types';

const HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const FUNCTIONAL = /^rgba?\( *([0-9]{1,3}) *, *([0-9]{1,3}) *, *([0-9]{1,3}) *(?:, *(0|1|0?\.[0-9]+) *)?\)$/;
const CHANNEL_MAX = 255;
const SHORT_HEX_MAX = 4;
const HEX_WITH_ALPHA = 8;
const HEX_RADIX = 16;
const SRGB_KNEE = 0.04045;
const SRGB_LINEAR_SLOPE = 12.92;
const SRGB_OFFSET = 0.055;
const SRGB_GAMMA = 2.4;
const LUMA_R = 0.2126;
const LUMA_G = 0.7152;
const LUMA_B = 0.0722;
const FLARE = 0.05;
const WHITE: Rgba = { r: CHANNEL_MAX, g: CHANNEL_MAX, b: CHANNEL_MAX, a: 1 };

/** Parses #rgb, #rgba, #rrggbb, #rrggbbaa, rgb() and rgba(); returns null for anything else or a channel over 255. */
export function parseCssColor(value: string): Rgba | null {
  const text = value.trim();
  if (HEX.test(text)) {
    return parseHex(text.slice(1));
  }
  const match = FUNCTIONAL.exec(text);
  if (match === null) {
    return null;
  }
  const r = Number(match[1]);
  const g = Number(match[2]);
  const b = Number(match[3]);
  if (r > CHANNEL_MAX || g > CHANNEL_MAX || b > CHANNEL_MAX) {
    return null;
  }
  return { r, g, b, a: match[4] === undefined ? 1 : Number(match[4]) };
}

function parseHex(hex: string): Rgba {
  const full = hex.length <= SHORT_HEX_MAX ? [...hex].map((c) => c + c).join('') : hex;
  const byte = (index: number): number => parseInt(full.slice(index * 2, index * 2 + 2), HEX_RADIX);
  return { r: byte(0), g: byte(1), b: byte(2), a: full.length === HEX_WITH_ALPHA ? byte(3) / CHANNEL_MAX : 1 };
}

/** Paints a colour over an opaque background and returns the opaque result. */
export function composite(top: Rgba, bottom: Rgba): Rgba {
  const mix = (front: number, back: number): number => front * top.a + back * (1 - top.a);
  return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a: 1 };
}

function linear(channel: number): number {
  const s = channel / CHANNEL_MAX;
  return s <= SRGB_KNEE ? s / SRGB_LINEAR_SLOPE : ((s + SRGB_OFFSET) / (1 + SRGB_OFFSET)) ** SRGB_GAMMA;
}

/** WCAG relative luminance of an opaque colour, 0 (black) to 1 (white). */
export function relativeLuminance(color: Rgba): number {
  return LUMA_R * linear(color.r) + LUMA_G * linear(color.g) + LUMA_B * linear(color.b);
}

/** WCAG contrast ratio of a colour drawn on a background; a translucent background is first laid on white. */
export function contrastRatio(foreground: Rgba, background: Rgba): number {
  const base = composite(background, WHITE);
  const top = composite(foreground, base);
  const a = relativeLuminance(top);
  const b = relativeLuminance(base);
  return (Math.max(a, b) + FLARE) / (Math.min(a, b) + FLARE);
}
