import { useEffect, useRef, useState } from 'react';
import type { CaptureMonitoring } from '@/domain/usecases/CaptureMonitoring';
import type { MetricData } from '../mission/types';
import type { SignalCheckState } from './types';

const readingTime = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'short',
  timeStyle: 'medium',
  timeZone: 'UTC',
});

export function useSignalCheckViewModel(
  capture: CaptureMonitoring,
  nextId: () => string,
  personId: string,
  metric: MetricData,
) {
  const [state, setState] = useState<SignalCheckState>({ kind: 'idle' });
  const pending = useRef<AbortController | null>(null);

  useEffect(() => () => pending.current?.abort(), []);

  async function repeat() {
    if (pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setState({ kind: 'running' });
    try {
      const result = await capture.execute({
        requestId: nextId(),
        subjectId: personId,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      const sample = result.measurements.find((item) => item.indicator === metric.id);
      setState(
        sample?.quality === 'available' && sample.value !== null && sample.time.kind === 'instant'
          ? {
              kind: 'available',
              value: `${sample.value} ${sample.unit}`,
              time: `${readingTime.format(new Date(sample.time.at))} UTC`,
            }
          : { kind: 'missing' },
      );
    } catch {
      if (!controller.signal.aborted) setState({ kind: 'error' });
    } finally {
      pending.current = null;
    }
  }

  const lastAvailable = metric.history.reduce((index, row, i) => (row.missing ? index : i), -1);
  return { state, repeat, missingCount: metric.history.length - 1 - lastAvailable };
}
