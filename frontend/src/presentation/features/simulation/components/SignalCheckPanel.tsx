import type { ReactNode } from 'react';
import { AssistantRobot } from '../../mission-assistant/components/AssistantRobot';
import { TrendChart } from '../../../shared/mission/TrendChart';
import type { MetricData } from '../../mission/types';
import type { SignalCheckState } from '../types';

export function SignalCheckPanel({
  metric,
  state,
  missingCount,
  scene,
  onRepeat,
  onEvidence,
}: {
  metric: MetricData;
  state: SignalCheckState;
  missingCount: number;
  scene: ReactNode;
  onRepeat(): void;
  onEvidence(): void;
}) {
  const title =
    missingCount > 1
      ? `Faltan ${missingCount} lecturas de ${metric.shortLabel}`
      : `Revisa la señal de ${metric.shortLabel}`;
  return (
    <section className="panel signal-check" aria-labelledby="signal-check-title">
      <div className="signal-check-content">
        <div className="signal-check-heading">
          <AssistantRobot />
          <div>
            <p className="eyebrow">TUMI · DEMOSTRACIÓN SIMULADA</p>
            <h2 id="signal-check-title">{title}</h2>
          </div>
        </div>
        <p>{metric.lastReading}</p>
        <div className="signal-check-actions">
          <button
            type="button"
            className="button primary"
            disabled={state.kind === 'running'}
            onClick={onRepeat}
          >
            {state.kind === 'running' ? 'Capturando…' : 'Repetir medición simulada'}
          </button>
          <button type="button" className="text-button" onClick={onEvidence}>
            Ver evidencia
          </button>
        </div>
        {state.kind === 'available' && (
          <div className="signal-check-result" role="status">
            <strong>Nueva lectura simulada · {state.value}</strong>
            <span>{state.time}</span>
          </div>
        )}
        {state.kind === 'missing' && (
          <p role="status">La captura sigue sin una lectura disponible.</p>
        )}
        {state.kind === 'error' && (
          <p role="alert">No se completó la captura. Puedes reintentar.</p>
        )}
      </div>
      <div className="signal-check-visuals">
        <TrendChart metric={metric} compact animated={false} />
      </div>
      {scene}
    </section>
  );
}
