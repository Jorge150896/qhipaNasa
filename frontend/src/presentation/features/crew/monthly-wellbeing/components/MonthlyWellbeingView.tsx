import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { Icon } from '@/ui/Icon';
import type { MonthlyWellbeingViewModel } from '../types';

function Values({ items }: { items: { label: string; value: string }[] }) {
  const t = useTranslation();
  return (
    <dl className="monthly-wellbeing-values">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt>{t(label)}</dt>
          <dd>{t(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function MonthlyWellbeingView({
  model,
  onAskTumi,
}: {
  model: MonthlyWellbeingViewModel;
  onAskTumi?(): void;
}) {
  const t = useTranslation();
  const { dayNumber, selectedMetric, points } = model;
  const showMood = selectedMetric.id === 'mood';
  return (
    <section className="monthly-wellbeing" aria-labelledby="monthly-wellbeing-title">
      <header className="monthly-wellbeing-header">
        <div>
          <p className="eyebrow">{t('Odyssey 01 · Datos sintéticos')}</p>
          <h3 id="monthly-wellbeing-title">{t('Seguimiento de 30 días')}</h3>
          <p>
            {t(model.reportName)} · {t(model.period)}
          </p>
        </div>
        <span className="badge">{t(model.trajectory)}</span>
      </header>
      <div>
        <h4>{t('Primera y última semana')}</h4>
        <Values items={model.summary} />
      </div>
      <div className="monthly-wellbeing-trend">
        <div className="monthly-wellbeing-trend-header">
          <label>
            {t('Indicador')}
            <select
              value={selectedMetric.id}
              onChange={(event) => {
                const metric = model.metricOptions.find(({ id }) => id === event.target.value);
                if (metric) model.setMetric(metric.id);
              }}
            >
              {model.metricOptions.map(({ id, label }) => (
                <option key={id} value={id}>
                  {t(label)}
                </option>
              ))}
            </select>
          </label>
          <output aria-live="polite">
            {t(model.dayLabel)} · {t(model.selectedValue)}
          </output>
        </div>
        <div className="monthly-wellbeing-plot" aria-hidden="true">
          <div className="monthly-wellbeing-scale">
            {showMood ? (
              <>
                <span>{t('Bien')}</span>
                <span>{t('Regular')}</span>
                <span>{t('Bajo')}</span>
              </>
            ) : (
              <>
                <span>
                  {t(selectedMetric.max)} {t(selectedMetric.unit)}
                </span>
                <span>0</span>
              </>
            )}
          </div>
          <div className="monthly-wellbeing-bars" data-mood={showMood}>
            {points.map((point) => (
              <span
                key={point.day}
                data-selected={point.day === dayNumber}
                data-absent={point.value === null}
              >
                {point.value !== null && (
                  <i
                    style={{
                      ...(showMood
                        ? { bottom: `${(point.value - 1) * 50}%` }
                        : {
                            height: `${Math.min(100, (point.value / selectedMetric.max) * 100)}%`,
                          }),
                    }}
                  />
                )}
              </span>
            ))}
          </div>
        </div>
        <div className="monthly-wellbeing-range">
          <button
            type="button"
            className="button secondary"
            aria-label={t('Día anterior')}
            disabled={dayNumber === 1}
            onClick={() => model.setDay(dayNumber - 1)}
          >
            <Icon name="chevron" className="monthly-wellbeing-back" />
          </button>
          <label>
            <span className="sr-only">{t('Día de la simulación')}</span>
            <input
              type="range"
              min={1}
              max={model.length}
              value={dayNumber}
              aria-valuetext={t(model.dayLabel)}
              onChange={(event) => model.setDay(Number(event.target.value))}
            />
          </label>
          <button
            type="button"
            className="button secondary"
            aria-label={t('Día siguiente')}
            disabled={dayNumber === model.length}
            onClick={() => model.setDay(dayNumber + 1)}
          >
            <Icon name="chevron" />
          </button>
        </div>
        <div className="monthly-wellbeing-dates" aria-hidden="true">
          <span>{t('Día 1')}</span>
          <span>
            {t('Día ')}
            {model.length}
          </span>
        </div>
      </div>
      <div className="monthly-wellbeing-day">
        <header className="monthly-wellbeing-header">
          <h4>{t(model.dayLabel)}</h4>
          {onAskTumi && (
            <button type="button" className="button secondary" onClick={onAskTumi}>
              <Icon name="sparkles" />
              {t(' Preguntar a Nami por este día')}
            </button>
          )}
        </header>
        <div className="monthly-wellbeing-day-grid">
          <div>
            <h5>{t('Lo que reportó')}</h5>
            <p className="sub">{t('Chequeo de las 08:00 UTC')}</p>
            <Values items={model.questions} />
            {model.note && <p className="monthly-wellbeing-note">{t(model.note)}</p>}
          </div>
          <div>
            <h5>{t('Signos vitales en reposo')}</h5>
            <p className="sub">{t('Lecturas de las 07:45 UTC')}</p>
            <Values items={model.readings} />
            <h5>{t('Cabina compartida')}</h5>
            <p className="sub">{t('Noche previa · 23:30–07:30 UTC')}</p>
            <Values items={model.cabin} />
            <p className="sub">{t(model.event)}</p>
          </div>
        </div>
      </div>
      <p className="sub">
        {t(
          'El ánimo, el aislamiento y el confinamiento provienen de respuestas simuladas. La coincidencia con el ambiente o los signos vitales permite explorar hipótesis.',
        )}
      </p>
    </section>
  );
}
