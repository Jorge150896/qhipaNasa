'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { ExerciseSessionPreview } from '../../crew-health/types';

const EquipmentScene = dynamic(() => import('./ExerciseEquipmentScene'), {
  ssr: false,
  loading: () => <p className="crew-hologram-detail">Cargando equipo 3D…</p>,
});

export function ExerciseSessionHistory({ sessions }: { sessions: ExerciseSessionPreview[] }) {
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
        <div className="crew-exercise-history" role="group" aria-label="Minutos por sesión">
          <h4>Minutos por sesión</h4>
          <div className="crew-exercise-bars">
            {measured
              .slice()
              .reverse()
              .map(({ entry }) => (
                <button
                  type="button"
                  key={entry.id}
                  aria-label={`${entry.activity} · ${entry.date} · ${entry.duration}`}
                  aria-pressed={selected.entry.id === entry.id}
                  onClick={() => selectSession(entry.id)}
                >
                  <span>{entry.minutes}</span>
                  <span className="crew-exercise-bar-track" aria-hidden="true">
                    <span style={{ height: `${((entry.minutes ?? 0) / max) * 100}%` }} />
                  </span>
                  <small>{entry.dayLabel}</small>
                </button>
              ))}
          </div>
          <p>
            <strong>
              {selected.entry.activity} · {selected.entry.duration}
            </strong>
          </p>
          <p className="crew-hologram-detail">{selected.entry.date}</p>
          {selected.entry.note && <p>{selected.entry.note}</p>}
        </div>
      )}
      {selected.equipment && (
        <EquipmentScene key={selected.equipment.kind} equipment={selected.equipment} />
      )}
    </>
  );
}
