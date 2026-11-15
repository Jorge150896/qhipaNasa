import type { ObservationData } from '../mission/types';
export interface ObservationsScreenProps {
  observations: ObservationData[];
  pendingCount: string;
  saving: boolean;
  onOpenRelated(item: ObservationData): void;
  onReview(id: string, reviewed: boolean): Promise<void>;
}
