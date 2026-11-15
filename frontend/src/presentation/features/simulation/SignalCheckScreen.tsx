import { useMemo, useState } from 'react';
import { createSignalCheckDependencies } from '@/di/createSignalCheckDependencies.client';
import type { MetricData } from '../mission/types';
import { MissionSceneSlot } from '../../shared/mission/MissionSceneSlot';
import { useSignalCheckViewModel } from './useSignalCheckViewModel';
import { SignalCheckPanel } from './components/SignalCheckPanel';
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
  const dependencies = useMemo(() => createSignalCheckDependencies(), []);
  const model = useSignalCheckViewModel(
    dependencies.capture,
    dependencies.nextId,
    personId,
    metric,
  );
  const [showSensor, setShowSensor] = useState(false);

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
          <summary>Ubicar el sensor en 3D</summary>
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
