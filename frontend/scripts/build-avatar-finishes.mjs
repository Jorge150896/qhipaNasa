import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const models = new URL('../public/models/', import.meta.url);
const glb = await readFile(new URL('astronaut.glb', models));
const jsonLength = glb.readUInt32LE(12);
const model = JSON.parse(glb.subarray(20, 20 + jsonLength));
const diffuse = model.materials[0].pbrMetallicRoughness.baseColorTexture.index;
const source = model.textures[diffuse].source;
const view = model.bufferViews[model.images[source].bufferView];
const start = 28 + jsonLength + view.byteOffset;
const { data: original, info } = await sharp(glb.subarray(start, start + view.byteLength))
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const palette = { purple: [131, 56, 236], orange: [251, 86, 7] };
for (const [bands, bandColor] of Object.entries(palette)) {
  for (const [controls, controlColor] of Object.entries(palette)) {
    const pixels = Buffer.from(original);
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const offset = (y * info.width + x) * 3;
        const [red, green, blue] = original.subarray(offset, offset + 3);
        const max = Math.max(red, green, blue);
        const saturation = max - Math.min(red, green, blue);
        if (max < 70 || saturation < 45) continue;
        const isBand = x <= 620 && y >= 439 && y <= 753;
        const isControl =
          (x >= 200 && x <= 352 && y <= 220) || (x >= 516 && x <= 569 && y >= 373 && y <= 423);
        const color = isBand ? bandColor : isControl ? controlColor : undefined;
        if (!color) continue;
        const shade = Math.max(0.42, Math.min(1.12, max / 224));
        const weight = Math.min(1, (saturation - 45) / 45);
        color.forEach((channel, index) => {
          pixels[offset + index] = Math.round(
            original[offset + index] * (1 - weight) + Math.min(255, channel * shade) * weight,
          );
        });
      }
    }
    const output = await sharp(pixels, { raw: info }).webp({ quality: 92 }).toBuffer();
    await writeFile(new URL(`avatar/suit-${bands}-${controls}.webp`, models), output);
  }
}
