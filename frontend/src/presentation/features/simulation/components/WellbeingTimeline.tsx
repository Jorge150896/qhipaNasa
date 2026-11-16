import { useId } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { publicAsset } from '@/presentation/shared/publicAsset';
import { wellbeingPlaybackSeconds, wellbeingRouteLabels } from '../types';
import type { useSimulationViewModel } from '../useSimulationViewModel';

type TimelineProps = Pick<
  ReturnType<typeof useSimulationViewModel>,
  'dayIndex' | 'playing' | 'canResume' | 'setDayIndex' | 'togglePlayback' | 'restartPlayback'
> & { days: NonNullable<ReturnType<typeof useSimulationViewModel>['days']> };

const levels = ['routine', 'adjustment', 'support'] as const;
const rowCenter = (row: number) => ((row + 0.5) * 100) / levels.length;

export function WellbeingTimeline({
  days,
  dayIndex,
  playing,
  canResume,
  setDayIndex,
  togglePlayback,
  restartPlayback,
}: TimelineProps) {
  const t = useTranslation();
  const titleId = useId();
  const lastIndex = days.length - 1;
  const currentDay = days[dayIndex];
  const points = days.map(({ route }, index) => ({
    x: 2 + (96 * index) / lastIndex,
    y: rowCenter(levels.indexOf(route)),
  }));
  const current = points[dayIndex];
  const { x, y } = points[0];
  const segments = points.slice(1).map((point) => ` H ${point.x} V ${point.y}`);
  const start = `M ${x} ${y}`;

  return (
    <section className="wellbeing-timeline" aria-labelledby={titleId}>
      <div className="wellbeing-timeline__header">
        <div>
          <h3 id={titleId}>{t('Línea de tiempo emocional')}</h3>
          <small>
            {t('Simulación')} · {t(`${days.length} días en ${wellbeingPlaybackSeconds} segundos`)}
          </small>
        </div>
        <div className="wellbeing-timeline__controls">
          <button type="button" className="button primary" onClick={togglePlayback}>
            {playing ? (
              <Pause size={16} aria-hidden="true" />
            ) : (
              <Play size={16} aria-hidden="true" />
            )}
            {t(playing ? 'Pausar mes' : canResume ? 'Continuar mes' : 'Reproducir mes')}
          </button>
          <button type="button" className="button secondary" onClick={restartPlayback}>
            <RotateCcw size={16} aria-hidden="true" />
            {t('Reiniciar mes')}
          </button>
        </div>
      </div>

      <div className="wellbeing-timeline__chart" aria-hidden="true">
        <div className="wellbeing-timeline__levels">
          {levels.map((level) => (
            <span key={level} data-route={level}>
              {t(wellbeingRouteLabels[level])}
            </span>
          ))}
        </div>
        <div className="wellbeing-timeline__plot">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
            {levels.map((level, row) => (
              <path
                key={level}
                className="wellbeing-timeline__guide"
                d={`M 0 ${rowCenter(row)} H 100`}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path
              className="wellbeing-timeline__future"
              d={start + segments.join('')}
              vectorEffect="non-scaling-stroke"
            />
            <path
              className="wellbeing-timeline__trace"
              d={start + segments.slice(0, dayIndex).join('')}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span
            key={currentDay.number}
            className="wellbeing-timeline__marker"
            data-route={currentDay.route}
            style={{
              left: `${current.x}%`,
              top: `${current.y}%`,
              backgroundImage: `url("${publicAsset('/brand/timeline-rocket.webp')}")`,
            }}
          />
        </div>
      </div>

      <input
        className="wellbeing-timeline__scrubber"
        type="range"
        min={0}
        max={lastIndex}
        value={dayIndex}
        aria-label={t('Día de la línea de tiempo')}
        aria-valuetext={`${t(currentDay.label)} · ${t(wellbeingRouteLabels[currentDay.route])}`}
        onChange={(event) => setDayIndex(event.currentTarget.valueAsNumber)}
      />
      <div className="wellbeing-timeline__dates">
        <span>{t(days[0].label)}</span>
        <strong>{t(`Día ${currentDay.number} de ${days.length}`)}</strong>
        <span>{t(days[lastIndex].label)}</span>
      </div>
    </section>
  );
}
