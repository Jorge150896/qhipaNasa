import { useState } from 'react';
import type { BodyDisplay, HologramAppearance } from './hologramTypes';
export function useCrewHologramViewModel(habitatId: string, crewId: string) {
  const [display, selectDisplay] = useState<BodyDisplay>('astronaut');
  const [appearances, setAppearances] = useState<Record<string, HologramAppearance>>({});
  const key = `${habitatId}:${crewId}`;
  return {
    display,
    selectDisplay,
    appearance: appearances[key] ?? 'neutral',
    selectAppearance(value: HologramAppearance) {
      setAppearances((current) => ({ ...current, [key]: value }));
    },
  };
}
