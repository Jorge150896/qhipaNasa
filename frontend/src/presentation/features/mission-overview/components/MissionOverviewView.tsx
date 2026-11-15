import type { ReactNode } from 'react';
import type { SensorKey } from '../../mission/types';
import type { MissionPersonalSummary as Summary } from '../types';
import { MissionPersonalSummary } from './MissionPersonalSummary';

export function MissionOverviewView({
  summary,
  signalPanel,
  onStartSignalDemo,
  onStartMonitoring,
  onOpenModule,
  onOpenRecord,
  onOpenDailyCheck,
  onOpenObservation,
  onReviewSignal,
}: {
  summary: Summary;
  signalPanel?: ReactNode;
  onStartSignalDemo?(): void;
  onStartMonitoring(): void;
  onOpenModule(): void;
  onOpenRecord(): void;
  onOpenDailyCheck(): void;
  onOpenObservation(id: string): void;
  onReviewSignal(id: SensorKey): void;
}) {
  return (
    <MissionPersonalSummary
      data={summary}
      signalPanel={signalPanel}
      onStartSignalDemo={onStartSignalDemo}
      onOpenModule={onOpenModule}
      onOpenRecord={onOpenRecord}
      onOpenDailyCheck={onOpenDailyCheck}
      onOpenObservation={onOpenObservation}
      onStartMonitoring={onStartMonitoring}
      onReviewSignal={onReviewSignal}
    />
  );
}
