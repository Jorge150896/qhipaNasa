import { Icon } from '@/ui/Icon';
import type { MonthlyWellbeingViewModel } from '../types';

function Values({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="monthly-wellbeing-values">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
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
  const { dayNumber, selectedMetric, points } = model;
  const showMood = selectedMetric.id === 'mood';
  return (
    <section className="monthly-wellbeing" aria-labelledby="monthly-wellbeing-title">
      <header className="monthly-wellbeing-header">
        <div>
          <p className="eyebrow">Odyssey 01 · Datos sintéticos</p>
          <h3 id="monthly-wellbeing-title">Seguimiento de 30 días</h3>
          <p>
            {model.reportName} · {model.period}
          </p>
        </div>
        <span className="badge">{model.trajectory}</span>
      </header>
      <div>
        <h4>Primera y última semana</h4>
        <Values items={model.summary} />
      </div>
      <div className="monthly-wellbeing-trend">
        <div className="monthly-wellbeing-trend-header">
          <label>
            Indicador
            <select
              value={selectedMetric.id}
              onChange={(event) => {
                const metric = model.metricOptions.find(({ id }) => id === event.target.value);
                if (metric) model.setMetric(metric.id);
              }}
            >
              {model.metricOptions.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <output aria-live="polite">
            {model.dayLabel} · {model.selectedValue}
          </output>
        </div>
        <div className="monthly-wellbeing-plot" aria-hidden="true">
          <div className="monthly-wellbeing-scale">
            {showMood ? (
              <>
                <span>Bien</span>
                <span>Regular</span>
                <span>Bajo</span>
              </>
            ) : (
              <>
                <span>
                  {selectedMetric.max} {selectedMetric.unit}
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
            aria-label="Día anterior"
            disabled={dayNumber === 1}
            onClick={() => model.setDay(dayNumber - 1)}
          >
            <Icon name="chevron" className="monthly-wellbeing-back" />
          </button>
          <label>
            <span className="sr-only">Día de la simulación</span>
            <input
              type="range"
              min={1}
              max={model.length}
              value={dayNumber}
              aria-valuetext={model.dayLabel}
              onChange={(event) => model.setDay(Number(event.target.value))}
            />
          </label>
          <button
            type="button"
            className="button secondary"
            aria-label="Día siguiente"
            disabled={dayNumber === model.length}
            onClick={() => model.setDay(dayNumber + 1)}
          >
            <Icon name="chevron" />
          </button>
        </div>
        <div className="monthly-wellbeing-dates" aria-hidden="true">
          <span>Día 1</span>
          <span>Día {model.length}</span>
        </div>
      </div>
      <div className="monthly-wellbeing-day">
        <header className="monthly-wellbeing-header">
          <h4>{model.dayLabel}</h4>
          {onAskTumi && (
            <button type="button" className="button secondary" onClick={onAskTumi}>
              <Icon name="sparkles" /> Preguntar a Tumi por este día
            </button>
          )}
        </header>
        <div className="monthly-wellbeing-day-grid">
          <div>
            <h5>Lo que reportó</h5>
            <p className="sub">Chequeo de las 08:00 UTC</p>
            <Values items={model.questions} />
            {model.note && <p className="monthly-wellbeing-note">{model.note}</p>}
          </div>
          <div>
            <h5>Signos vitales en reposo</h5>
            <p className="sub">Lecturas de las 07:45 UTC</p>
            <Values items={model.readings} />
            <h5>Cabina compartida</h5>
            <p className="sub">Noche previa · 23:30–07:30 UTC</p>
            <Values items={model.cabin} />
            <p className="sub">{model.event}</p>
          </div>
        </div>
      </div>
      <p className="sub">
        El ánimo, el aislamiento y el confinamiento provienen de respuestas simuladas. La
        coincidencia con el ambiente o los signos vitales permite explorar hipótesis.
      </p>
    </section>
  );
}
