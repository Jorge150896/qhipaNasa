import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import type { ReactNode } from 'react';
import { TumiAvatar } from '@/presentation/shared/tumi/TumiAvatar';
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
  const t = useTranslation();
  const title =
    missingCount > 1
      ? `Faltan ${missingCount} lecturas de ${metric.shortLabel}`
      : `Revisa la señal de ${metric.shortLabel}`;
  return (
    <section className="panel signal-check" aria-labelledby="signal-check-title">
      <div className="signal-check-content">
        <div className="signal-check-heading">
          <TumiAvatar />
          <div>
            <p className="eyebrow">{t('NAMI · DEMOSTRACIÓN SIMULADA')}</p>
            <h2 id="signal-check-title">{t(title)}</h2>
          </div>
        </div>
        <p>{t(metric.lastReading)}</p>
        <div className="signal-check-actions">
          <button
            type="button"
            className="button primary"
            disabled={state.kind === 'running'}
            onClick={onRepeat}
          >
            {t(state.kind === 'running' ? 'Capturando…' : 'Repetir medición simulada')}
          </button>
          <button type="button" className="text-button" onClick={onEvidence}>
            {t('Ver evidencia')}
          </button>
        </div>
        {state.kind === 'available' && (
          <div className="signal-check-result" role="status">
            <strong>
              {t('Nueva lectura simulada · ')}
              {t(state.value)}
            </strong>
            <span>{t(state.time)}</span>
          </div>
        )}
        {state.kind === 'missing' && (
          <p role="status">{t('La captura sigue sin una lectura disponible.')}</p>
        )}
        {state.kind === 'error' && (
          <p role="alert">{t('No se completó la captura. Puedes reintentar.')}</p>
        )}
      </div>
      <div className="signal-check-visuals">
        <TrendChart metric={metric} compact animated={false} />
      </div>
      {scene}
    </section>
  );
}
