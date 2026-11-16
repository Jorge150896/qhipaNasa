'use client';
import { LocalizedText, useTranslation } from '@/presentation/shared/language/AppLanguageProvider';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { ExerciseSessionPreview } from '../../crew-health/types';

const EquipmentScene = dynamic(() => import('./ExerciseEquipmentScene'), {
  ssr: false,
  loading: () => (
    <p className="crew-hologram-detail">
      <LocalizedText>Cargando equipo 3D…</LocalizedText>
    </p>
  ),
});

export function ExerciseSessionHistory({ sessions }: { sessions: ExerciseSessionPreview[] }) {
  const t = useTranslation();
  const [selectedId, selectSession] = useState<string>();
  const measured = sessions.filter(({ entry }) => entry.minutes !== null);
  const showChart = measured.length > 1;
  const selected =
    measured.find(({ entry }) => entry.id === selectedId) ??
    (showChart ? measured[0] : sessions[0]);
  if (!selected) return null;

  const max = Math.max(1, ...measured.map(({ entry }) => entry.minutes ?? 0));
  return (
    <>
      {showChart && (
        <div className="crew-exercise-history" role="group" aria-label={t('Minutos por sesión')}>
          <h4>{t('Minutos por sesión')}</h4>
          <div className="crew-exercise-bars">
            {measured
              .slice()
              .reverse()
              .map(({ entry }) => (
                <button
                  type="button"
                  key={entry.id}
                  aria-label={t(`${entry.activity} · ${entry.date} · ${entry.duration}`)}
                  aria-pressed={selected.entry.id === entry.id}
                  onClick={() => selectSession(entry.id)}
                >
                  <span>{t(entry.minutes)}</span>
                  <span className="crew-exercise-bar-track" aria-hidden="true">
                    <span style={{ height: `${((entry.minutes ?? 0) / max) * 100}%` }} />
                  </span>
                  <small>{t(entry.dayLabel)}</small>
                </button>
              ))}
          </div>
          <p>
            <strong>
              {t(selected.entry.activity)} · {t(selected.entry.duration)}
            </strong>
          </p>
          <p className="crew-hologram-detail">{t(selected.entry.date)}</p>
          {selected.entry.note && <p>{selected.entry.note}</p>}
        </div>
      )}
      {selected.equipment && (
        <EquipmentScene key={selected.equipment.kind} equipment={selected.equipment} />
      )}
    </>
  );
}
