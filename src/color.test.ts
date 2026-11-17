import { contrastRatio, parseCssColor } from './color';

describe('parseCssColor', () => {
  it('with a three-digit hex, expands each digit', () => {
    const value = '#fa0';

    const rgba = parseCssColor(value);

    expect(rgba).toEqual({ r: 255, g: 170, b: 0, a: 1 });
  });

  it('with an eight-digit hex, reads the alpha byte', () => {
    const value = '#00000080';

    const rgba = parseCssColor(value);

    expect(rgba).toEqual({ r: 0, g: 0, b: 0, a: 128 / 255 });
  });

  it('with rgba(), reads the alpha', () => {
    const value = 'rgba(10, 20, 30, 0.5)';

    const rgba = parseCssColor(value);

    expect(rgba).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
  });

  it('with a channel above 255, returns null', () => {
    const value = 'rgb(256, 0, 0)';

    const rgba = parseCssColor(value);

    expect(rgba).toBeNull();
  });

  it('with a colour name, returns null', () => {
    const value = 'red';

    const rgba = parseCssColor(value);

    expect(rgba).toBeNull();
  });
});

describe('contrastRatio', () => {
  it('with black on white, returns 21', () => {
    const black = { r: 0, g: 0, b: 0, a: 1 };
    const white = { r: 255, g: 255, b: 255, a: 1 };

    const ratio = contrastRatio(black, white);

    expect(ratio).toBeCloseTo(21, 5);
  });

  it('with the same colour twice, returns 1', () => {
    const grey = { r: 120, g: 120, b: 120, a: 1 };

    const ratio = contrastRatio(grey, grey);

    expect(ratio).toBeCloseTo(1, 5);
  });

  it('with half-transparent black on white, blends before measuring', () => {
    const halfBlack = { r: 0, g: 0, b: 0, a: 0.5 };
    const white = { r: 255, g: 255, b: 255, a: 1 };

    const ratio = contrastRatio(halfBlack, white);

    expect(ratio).toBeCloseTo(3.98, 1);
  });
});
