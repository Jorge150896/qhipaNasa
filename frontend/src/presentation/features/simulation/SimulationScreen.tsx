import type { SimulationScreenProps } from './types';
import { SimulationView } from './components/SimulationView';
import { SignalCheckScreen } from './SignalCheckScreen';

export function SimulationScreen({
  signal,
  onOpenSignalEvidence,
  ...props
}: SimulationScreenProps) {
  return (
    <>
      <SimulationView {...props} hasSignal={Boolean(signal)} />
      {signal && (
        <SignalCheckScreen
          key={`${signal.personId}:${signal.metric.id}`}
          personId={signal.personId}
          metric={signal.metric}
          onEvidence={() => onOpenSignalEvidence(signal.personId)}
        />
      )}
    </>
  );
}
