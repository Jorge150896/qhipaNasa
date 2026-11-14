import type { ObservationData } from '../mission/types';
export interface ObservationsScreenProps {
  observations: ObservationData[];
  pendingCount: string;
  saving: boolean;
  onReview(id: string, reviewed: boolean): Promise<void>;
}
