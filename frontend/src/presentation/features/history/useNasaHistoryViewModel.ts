import { useState } from 'react';
import type { NasaHistoryData, NasaIndicator, NasaHistoryPanelProps } from './types';

const indicators = [
  { id: 'glucose', label: 'Glucosa', unit: 'mg/dL', icon: 'activity' },
  { id: 'sodium', label: 'Sodio', unit: 'mmol/L', icon: 'chart' },
  { id: 'potassium', label: 'Potasio', unit: 'mmol/L', icon: 'orbit' },
] as const;

const decimal = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 });

export function useNasaHistoryViewModel(data: NasaHistoryData): NasaHistoryPanelProps {
  const [indicatorId, selectIndicator] = useState<NasaIndicator>('glucose');
  const [selectedPhase, selectPhase] = useState(data.points.at(-1)?.phase);
  const indicator = indicators.find(({ id }) => id === indicatorId) ?? indicators[0];
  const maximum = Math.max(1, ...data.points.map((point) => point[indicatorId]));
  const step = maximum >= 100 ? 20 : maximum >= 10 ? 10 : 1;
  const ceiling = Math.ceil(maximum / step) * step;
  const samples = data.points.map((point) => {
    const days = Number(point.phase.slice(2));
    const timing = point.phase.startsWith('L') ? 'antes del lanzamiento' : 'después del regreso';
    return {
      phase: point.phase,
      relativeDay: `${days} ${days === 1 ? 'día' : 'días'} ${timing}`,
      value: decimal.format(point[indicatorId]),
      height: (point[indicatorId] / ceiling) * 100,
    };
  });
  return {
    data: {
      mission: data.mission,
      study: data.study,
      source: data.source,
      download: data.download,
      sampleCount: data.sampleCount,
      indicators,
      indicator,
      ceiling: decimal.format(ceiling),
      selectedSample: samples.find((sample) => sample.phase === selectedPhase),
      groups: [
        {
          label: 'Antes del lanzamiento',
          samples: samples.filter(({ phase }) => phase.startsWith('L')),
        },
        {
          label: 'Después del regreso',
          samples: samples.filter(({ phase }) => phase.startsWith('R')),
        },
      ],
      rows: data.points.map(({ phase, glucose, sodium, potassium }) => ({
        phase,
        values: [glucose, sodium, potassium].map((value) => decimal.format(value)),
      })),
    },
    onSelectIndicator: selectIndicator,
    onSelectPhase: selectPhase,
  };
}
