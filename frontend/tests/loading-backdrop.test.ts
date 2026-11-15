import { describe, expect, it } from 'vitest';
import { removeLoadingBackdrop } from '../src/presentation/shared/loading/removeLoadingBackdrop';

describe('local Tumi video matte', () => {
  it('removes the connected pale background while retaining enclosed white highlights and gold', () => {
    const size = 7;
    const pixels = new Uint8ClampedArray(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const interior = x >= 1 && x <= 5 && y >= 1 && y <= 5;
        pixels.set(interior ? [25, 30, 35, 255] : [220, 230, 240, 255], (y * size + x) * 4);
      }
    }
    pixels.set([245, 245, 245, 255], (3 * size + 3) * 4);
    pixels.set([245, 180, 40, 255], (2 * size + 2) * 4);
    removeLoadingBackdrop(pixels, size, size);
    expect(pixels[3]).toBe(0);
    expect(Array.from(pixels.slice((3 * size + 3) * 4, (3 * size + 3) * 4 + 4))).toEqual([
      245, 245, 245, 255,
    ]);
    expect(Array.from(pixels.slice((2 * size + 2) * 4, (2 * size + 2) * 4 + 4))).toEqual([
      245, 180, 40, 255,
    ]);
  });
});
