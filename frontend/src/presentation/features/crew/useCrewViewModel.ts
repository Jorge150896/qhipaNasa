import { useState } from 'react';
import type { BodySystemKey } from '../crew-health/types';
import { useMissionDashboardViewModel } from '../../shared/mission/useMissionDashboardViewModel';
export function useCrewViewModel(habitatId: string) {
  const dashboard = useMissionDashboardViewModel(habitatId, 'crew');
  const [healthSystem, selectHealthSystem] = useState<BodySystemKey>('cardio');
  return { ...dashboard, healthSystem, selectHealthSystem };
}
