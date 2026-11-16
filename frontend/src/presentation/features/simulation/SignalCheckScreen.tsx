import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { useMemo, useState } from 'react';
import { createSignalCheckDependencies } from '@/di/createSignalCheckDependencies.client';
import type { MetricData } from '../mission/types';
import { MissionSceneSlot } from '../../shared/mission/MissionSceneSlot';
import { useSignalCheckViewModel } from './useSignalCheckViewModel';
import { SignalCheckPanel } from './components/SignalCheckPanel';
import { useTumiViewContext } from '../mission-assistant/useTumiViewContext';
import './signal-check.css';

export function SignalCheckScreen({
  personId,
  metric,
  onEvidence,
}: {
  personId: string;
  metric: MetricData;
  onEvidence(id: MetricData['id']): void;
}) {
  const t = useTranslation();
  const dependencies = useMemo(() => createSignalCheckDependencies(), []);
  const model = useSignalCheckViewModel(
    dependencies.capture,
    dependencies.nextId,
    personId,
    metric,
  );
  const [showSensor, setShowSensor] = useState(false);
  useTumiViewContext('Simulación · Pérdida de señal', [
    `Caso sintético de ${metric.label}: ${model.missingCount} lecturas recientes ausentes.`,
    model.state.kind === 'available'
      ? `El botón Repetir medición simulada obtuvo ${model.state.value} a las ${model.state.time}. Es una captura nueva, separada del historial.`
      : 'La captura simulada de repetición todavía no tiene una nueva lectura disponible.',
  ]);

  return (
    <SignalCheckPanel
      metric={metric}
      state={model.state}
      missingCount={model.missingCount}
      onRepeat={() => void model.repeat()}
      onEvidence={() => onEvidence(metric.id)}
      scene={
        <details
          className="signal-check-scene"
          onToggle={(event) => setShowSensor(event.currentTarget.open)}
        >
          <summary>{t('Ubicar el sensor en 3D')}</summary>
          {showSensor && (
            <MissionSceneSlot
              mode="crew"
              selectedSensor={metric.id}
              selectedZone=""
              onSelectSensor={onEvidence}
              onSelectZone={() => {}}
            />
          )}
        </details>
      }
    />
  );
}
