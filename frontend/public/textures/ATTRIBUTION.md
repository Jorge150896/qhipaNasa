# Planetary textures

Author: Solar System Scope / INOVE. Source: https://www.solarsystemscope.com/textures/
License: Creative Commons Attribution 4.0 International, https://creativecommons.org/licenses/by/4.0/
Downloaded 2026-11-11. Files are unchanged, 2048-pixel equirectangular JPEGs:

- `2k_earth_daymap.jpg`: https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg
- `2k_moon.jpg`: https://www.solarsystemscope.com/textures/download/2k_moon.jpg
- `2k_mars.jpg`: https://www.solarsystemscope.com/textures/download/2k_mars.jpg

The author derives these maps from NASA imagery and elevation data, adjusts colors and fills some unmapped areas with illustrative terrain. These are educational surface illustrations, not current imagery or scientific measurements. The app serves all three files locally; no texture CDN is required.

## Additional Earth layers (2026-11-11)

Same author and CC BY 4.0 license:

- `earth-clouds.webp`: source https://www.solarsystemscope.com/textures/download/2k_earth_clouds.jpg, resized to 1024×512 and encoded as WebP (quality 85). Used as cloud opacity, not current weather.
- `earth-normal.webp`: source https://www.solarsystemscope.com/textures/download/2k_earth_normal_map.tif, converted to lossless WebP at 2048×1024. Loaded as linear normal data.
- `earth-roughness.webp`: source https://www.solarsystemscope.com/textures/download/2k_earth_specular_map.tif, resized to 1024×512, grayscale/inverted and remapped (`0.6 × inverted value + 80`) to a lossless WebP roughness illustration. Loaded as linear data; not a scientific measurement of surface reflectance.

These derivatives total about 502 KiB. Original source files are not required at runtime. Moon and Mars use their existing color maps for subtle artistic bump shading; this is not measured altimetry. Geometry and texture coordinates remain unchanged for geographic markers. The shuttle is original procedural project geometry with original panel graphics, not a NASA flight asset or technical interior model.
