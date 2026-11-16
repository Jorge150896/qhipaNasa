'use client';
import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';

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
}: {
  data: CrewHologramData;
  sessions?: ExerciseSessionPreview[];
  onOpenHistory(): void;
  onOpenTelemetryHistory(): void;
}) {
  const t = useTranslation();
  const [open, setOpen] = useState(false);
  const { reading } = data;

  return (
    <details className="crew-hologram-more" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>{t('Ver detalles')}</summary>
      <p>{t(data.explanation)}</p>
      {data.recordKind === 'vision' && <VisionObservationGuide />}
      {open && sessions && <ExerciseSessionHistory sessions={sessions} />}
      {!reading && <p>{t(data.detail)}</p>}
      {reading && (
        <p className="crew-hologram-detail">
          {t(data.activity)} · {t(data.context)} · {t(data.contextTime)}
        </p>
      )}
      <p className="crew-hologram-detail">
        {t(reading ? 'Telemetría simulada' : 'Autorregistro de demostración')}
      </p>
      <button
        className="text-button"
        type="button"
        onClick={reading ? onOpenTelemetryHistory : onOpenHistory}
      >
        <Icon name="clock" size={15} />
        {t(reading ? 'Ver historial de mediciones' : 'Ver mis autorregistros')}
      </button>
    </details>
  );
}
