import { useEffect, useMemo, useState } from 'react';
import type { CabinArchive, CabinSample } from '@/domain/environmentArchive';

const signals = [
  { key: 'co2', label: 'CO₂', unit: 'ppm' },
  { key: 'airTemperature', label: 'Temperatura del aire', unit: '°C' },
  { key: 'relativeHumidity', label: 'Humedad relativa', unit: '%' },
] as const satisfies readonly {
  key: Exclude<keyof CabinSample, 'time'>;
  label: string;
  unit: string;
}[];

const format = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 1 });
const plotWidth = 460;
const plotHeight = 76;
const padding = 5;

function minutes(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

export function useCabinHistoryViewModel(archive: CabinArchive, open: boolean) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const end = archive.samples.length - 1;
  const active = open && playing && index < end;
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setIndex((value) => Math.min(value + 1, end)), 125);
    return () => window.clearInterval(timer);
  }, [active, end]);

  const graphs = useMemo(() => {
    const start = minutes(archive.samples[0].time);
    const duration = minutes(archive.samples[end].time) - start || 1;
    return signals.map(({ key, label, unit }) => {
      const values = archive.samples.map((sample) => sample[key]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const points = values.map((value, i) => ({
        x:
          padding +
          ((minutes(archive.samples[i].time) - start) / duration) * (plotWidth - 2 * padding),
        y:
          max === min
            ? plotHeight / 2
            : plotHeight - padding - ((value - min) / (max - min)) * (plotHeight - 2 * padding),
      }));
      return {
        key,
        label,
        unit,
        values,
        points,
        path: points.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' '),
        min: format.format(min),
        max: format.format(max),
      };
    });
  }, [archive, end]);

  return {
    data: {
      index,
      end,
      playing: active,
      seriesDate: archive.seriesDate,
      sourceUrl: archive.sourceUrl,
      currentTime: archive.samples[index].time,
      firstTime: archive.samples[0].time,
      lastTime: archive.samples[end].time,
      plotWidth,
      plotHeight,
      signals: graphs.map(({ values, points, ...signal }) => ({
        ...signal,
        value: format.format(values[index]),
        point: points[index],
      })),
    },
    onSeek(next: number) {
      setPlaying(false);
      setIndex(Math.max(0, Math.min(next, end)));
    },
    onTogglePlayback() {
      if (active) {
        setPlaying(false);
      } else {
        if (index === end) setIndex(0);
        setPlaying(true);
      }
    },
  };
}
