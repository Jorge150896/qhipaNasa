import { useState } from 'react';
export function useMissionDashboardViewModel(habitatId: string, initialMode: 'crew' | 'ship') {
  const [mode, setMode] = useState(initialMode);
  return {
    mode,
    onModeChange: setMode,
    habitatLabel: habitatId === 'odyssey' ? 'Nave' : habitatId === 'aurora' ? 'Estación' : 'Base',
    habitatKind:
      habitatId === 'odyssey'
        ? ('ship' as const)
        : habitatId === 'aurora'
          ? ('station' as const)
          : ('base' as const),
  };
}
