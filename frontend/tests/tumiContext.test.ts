import { expect, it } from 'vitest';
import { SimulatedMissionRepository } from '@/data/mission/SimulatedMissionRepository';
import { captureMetricContext } from '@/presentation/features/mission-assistant/explainMission';
import { mapTumiContext } from '@/presentation/features/mission-assistant/mapTumiContext';
import { mapMissionPresentation } from '@/presentation/features/mission/mapMissionPresentation';

it('envía la muestra elegida sin atribuirle la ubicación actual ni incluir notas locales', async () => {
  const snapshot = await new SimulatedMissionRepository().load('baseline');
  const mission = mapMissionPresentation(
    snapshot,
    { checks: [], reviewedObservationIds: [] },
    'elena',
    'respiration',
    'habitat',
    '2026-11-08',
  );
  mission.dailyCheckDraft = { sleep: '', fatigue: '', note: 'Nota privada fuera de contexto' };
  const sample = mission.metric.history[1];
  const reading = captureMetricContext('metric-respiration', mission, { at: sample.at });
  const context = mapTumiContext(
    '/mission/crew',
    mission,
    { view: 'Tripulación · Historial', details: '' },
    reading,
  );

  expect(context.view).toBe('Tripulación · Historial');
  expect(context.details.split('\n')[0]).toContain(sample.at);
  expect(context.details.split('\n')[0]).toContain(sample.value);
  expect(context.details.split('\n')[0]).toContain('Sin ubicación ni ambiente registrados');
  expect(context.details).not.toContain('Nota privada');
  expect(context.details).toContain('Origen: telemetría sintética');
});
