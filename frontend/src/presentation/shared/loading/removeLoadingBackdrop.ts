/** Matte for the pale blue backdrop of the local Nami video. Interior highlights stay intact. */
export function removeLoadingBackdrop(pixels: Uint8ClampedArray, width: number, height: number) {
  const count = width * height;
  const background = new Uint8Array(count);
  const queue = new Int32Array(count);
  let head = 0;
  let tail = 0;
  function visit(index: number) {
    if (index < 0 || index >= count || background[index]) return;
    const offset = index * 4;
    const r = pixels[offset];
    const g = pixels[offset + 1];
    const b = pixels[offset + 2];
    if (r < 95 || g < r - 8 || b < r - 8 || b - r > 75 || g - r > 55) return;
    background[index] = 1;
    queue[tail++] = index;
  }
  for (let x = 0; x < width; x++) {
    visit(x);
    visit((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    visit(y * width);
    visit(y * width + width - 1);
  }
  while (head < tail) {
    const index = queue[head++];
    if (index % width) visit(index - 1);
    if (index % width !== width - 1) visit(index + 1);
    visit(index - width);
    visit(index + width);
  }
  for (let index = 0; index < count; index++) {
    const offset = index * 4;
    if (background[index]) {
      pixels[offset + 3] = 0;
    } else {
      const x = index % width;
      const boundary =
        (x > 0 && background[index - 1]) ||
        (x < width - 1 && background[index + 1]) ||
        background[index - width] ||
        background[index + width];
      if (boundary) {
        // Defringe only exposed neutral pixels, never the gold or cyan artwork.
        const r = pixels[offset];
        const g = pixels[offset + 1];
        const b = pixels[offset + 2];
        const neutral = Math.max(r, g, b) - Math.min(r, g, b) < 55;
        const cyan = b > r + 25 && g > r + 20;
        let coverage = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const neighbor = index + dy * width + dx;
            if (
              x + dx >= 0 &&
              x + dx < width &&
              neighbor >= 0 &&
              neighbor < count &&
              !background[neighbor]
            ) {
              coverage += (dx === 0 ? 2 : 1) * (dy === 0 ? 2 : 1);
            }
          }
        }
        const edgeAlpha = coverage / 16;
        if (neutral || cyan) {
          const matte = neutral ? (220 - Math.max(r, g, b)) / 125 : (235 - r) / 170;
          const alpha = Math.min(edgeAlpha, Math.max(0, matte));
          pixels[offset + 3] = Math.round(alpha * 255);
          if (alpha > 0) {
            for (let channel = 0; channel < 3; channel++) {
              pixels[offset + channel] = Math.max(
                0,
                (pixels[offset + channel] - 220 * (1 - alpha)) / alpha,
              );
            }
          }
        } else pixels[offset + 3] = Math.round(edgeAlpha * 255);
      }
    }
  }
}
