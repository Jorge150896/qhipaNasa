import type { CheckFormValues, MissionData } from '../mission/types';
export interface DailyCheckScreenProps {
  data: MissionData;
  saving: boolean;
  onSave(values: CheckFormValues): Promise<boolean>;
}

export type DailyCheckViewModel = ReturnType<
  typeof import('./useDailyCheckViewModel').useDailyCheckViewModel
>;
