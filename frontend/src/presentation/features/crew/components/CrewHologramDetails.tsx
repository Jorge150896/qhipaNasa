'use client';

import { useState } from 'react';
import { Icon } from '@/ui/Icon';
import type { ExerciseSessionPreview } from '../../crew-health/types';
import type { CrewHologramData } from '../types';
import { ExerciseSessionHistory } from './ExerciseSessionHistory';
import { VisionObservationGuide } from '../../crew-health/components/VisionObservationGuide';

export function CrewHologramDetails({
  data,
  sessions,
  onOpenHistory,
  onOpenTelemetryHistory,
  onOpenEntry,
}: {
  data: CrewHologramData;
  sessions?: ExerciseSessionPreview[];
  onOpenHistory(): void;
  onOpenTelemetryHistory(): void;
  onOpenEntry(): void;
}) {
  const [open, setOpen] = useState(false);
  const { reading, trend } = data;

  return (
    <details className="crew-hologram-more" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>Ver detalles</summary>
      <p>{data.explanation}</p>
      {data.recordKind === 'vision' && <VisionObservationGuide />}
      {open && sessions && <ExerciseSessionHistory sessions={sessions} />}
      {!reading && <p>{data.detail}</p>}
      {reading && (
        <p className="crew-hologram-detail">
          {data.activity} · {data.context} · {data.contextTime}
        </p>
      )}
      <p className="crew-hologram-detail">
        {reading ? 'Telemetría simulada' : 'Autorregistro de demostración'}
      </p>
      <button
        className="text-button"
        type="button"
        onClick={reading ? onOpenTelemetryHistory : onOpenHistory}
      >
        <Icon name="clock" size={15} />
        {reading ? 'Ver historial de mediciones' : 'Ver mis autorregistros'}
      </button>
      {trend && (
        <button className="text-button" type="button" onClick={onOpenEntry}>
          <Icon name="clipboard" size={15} />
          {data.entryAction}
        </button>
      )}
    </details>
  );
}
