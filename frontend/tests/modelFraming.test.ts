import { describe, expect, it } from 'vitest';
import { detailCameraDistance } from '@/presentation/features/space-map/components/mapCamera';
import { mapObjectRadii } from '@/presentation/features/space-map/components/spaceMapLayout';

describe('Encuadre de detalle', () => {
  it('mantiene el cuerpo completo dentro de ambos ejes en escritorio y móvil', () => {
    for (const id of ['earth', 'moon', 'mars', 'ship', 'station'] as const) {
      for (const aspect of [0.58, 1, 1.7, 2.2]) {
        const distance = detailCameraDistance(id, aspect);
        const halfField = Math.atan(Math.tan(Math.PI / 8) * Math.min(1, aspect));
        expect(distance).toBeGreaterThan(mapObjectRadii[id] * 1.25);
        expect(Math.asin(mapObjectRadii[id] / distance)).toBeLessThan(halfField);
      }
    }
  });
  it('acerca más la Luna y amplía el margen para pantallas estrechas', () => {
    expect(detailCameraDistance('moon', 1.7)).toBeLessThan(detailCameraDistance('earth', 1.7));
    expect(detailCameraDistance('mars', 0.6)).toBeGreaterThan(detailCameraDistance('mars', 1.7));
  });
});
