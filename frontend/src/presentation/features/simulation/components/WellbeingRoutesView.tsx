import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { useId, type ReactNode } from 'react';
import { Icon, type IconName } from '@/ui/Icon';
import { TumiTechPortrait, type TumiEmotion } from '@/presentation/shared/tumi/TumiTechPortrait';
import { wellbeingRouteLabels, type WellbeingRoute } from '../types';
import type { useSimulationViewModel } from '../useSimulationViewModel';
import { FlightEvidence } from './FlightEvidence';
import { SimulationNarration, type SimulationNarrationProps } from './SimulationNarration';
import { WellbeingTimeline } from './WellbeingTimeline';

const routes: {
  id: WellbeingRoute;
  icon: IconName;
  steps: { emotion: TumiEmotion; label: string }[];
  action: string;
}[] = [
  {
    id: 'routine',
    icon: 'sparkles',
    steps: [
      { emotion: 'happy', label: 'Animado' },
      { emotion: 'joy', label: 'Feliz' },
      { emotion: 'motivated', label: 'Motivado' },
    ],
    action: 'Ver su módulo',
  },
  {
    id: 'adjustment',
    icon: 'orbit',
    steps: [
      { emotion: 'understanding', label: 'Tranquilo' },
      { emotion: 'neutral', label: 'Habitual' },
      { emotion: 'thinking', label: 'Pensativo' },
    ],
    action: 'Abrir historial',
  },
  {
    id: 'support',
    icon: 'heart',
    steps: [
      { emotion: 'worried', label: 'Preocupado' },
      { emotion: 'sad', label: 'Triste' },
      { emotion: 'worried', label: 'Necesita apoyo' },
    ],
    action: 'Abrir monitoreo diario',
  },
];

export function WellbeingRoutesView({
  crewName,
  location,
  astronaut,
  backdrop,
  model,
  narration,
  onOpenRoute,
}: {
  crewName: string;
  location: string;
  astronaut: ReactNode;
  backdrop: string;
  model: ReturnType<typeof useSimulationViewModel>;
  narration?: SimulationNarrationProps;
  onOpenRoute(route: WellbeingRoute): void;
}) {
  const t = useTranslation();
  const { position, days, point, trial } = model;
  const portraitId = useId();
  const activeStep = point && routes.find(({ id }) => id === point.route)?.steps[point.index];

  return (
    <section className="simulation-routes" aria-labelledby="simulation-routes-title">
      <header className="simulation-routes__heading">
        <div>
          <h2 id="simulation-routes-title">{t('Ruta emocional')}</h2>
          <p>{t('Explora el bienestar del tripulante día a día.')}</p>
        </div>
        {days && (
          <div className="simulation-routes__day">
            <label htmlFor={`${portraitId}-day`}>{t('Día simulado')}</label>
            <select
              id={`${portraitId}-day`}
              value={model.dayIndex}
              onChange={(event) => model.setDayIndex(Number(event.target.value))}
            >
              {days.map(({ number, label }, index) => (
                <option value={index} key={number}>
                  {t(label)}
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      {days && days.length > 1 && (
        <WellbeingTimeline
          days={days}
          dayIndex={model.dayIndex}
          playing={model.playing}
          canResume={model.canResume}
          setDayIndex={model.setDayIndex}
          togglePlayback={model.togglePlayback}
          restartPlayback={model.restartPlayback}
        />
      )}

      <div
        className="simulation-routes__layout"
        style={{
          backgroundImage: `linear-gradient(145deg, #24113fe8, #1f143ebb 60%, #160b32ed), url("${backdrop}")`,
        }}
      >
        <div className="simulation-routes__sidebar">
          <div className="simulation-routes__astronaut">
            <div className="simulation-routes__model">{astronaut}</div>
            <div className="simulation-routes__profile">
              <strong>{t(crewName)}</strong>
              <span>
                {t('Ubicación en la misión · ')}
                {t(location)}
              </span>
            </div>
          </div>
          <div className="simulation-routes__details">
            {position ? (
              <div className="simulation-routes__evidence">
                <h3>{t('Autorregistro del día')}</h3>
                <p>
                  <strong>{t('Ánimo:')}</strong> {t(position.mood)} · <strong>{t('Sueño:')}</strong>{' '}
                  {t(position.sleep)}
                  {t(' ')}· <strong>{t('Fatiga:')}</strong> {t(position.fatigue)}
                </p>
                <p>
                  <strong>{t('Ejercicio del día anterior:')}</strong> {t(position.exercise)} ·
                  {t(' ')}
                  <strong>{t('Aislamiento percibido:')}</strong>
                  {t(' ')}
                  {t(position.isolation === null ? 'Sin responder' : `${position.isolation}/4`)}
                </p>
                <p>{t(position.reason)}</p>
              </div>
            ) : (
              <p className="simulation-routes__evidence">
                {t('Este tripulante aún no tiene una serie de bienestar simulada.')}
              </p>
            )}

            <fieldset className="simulation-routes__habits">
              <legend>{t('Simular un cambio de hábitos')}</legend>
              <div className="simulation-routes__fields">
                {model.habitFields.map(({ id, label, value, options }) => (
                  <div className="simulation-routes__day" key={id}>
                    <label htmlFor={`${portraitId}-habit-${id}`}>{t(label)}</label>
                    <select
                      id={`${portraitId}-habit-${id}`}
                      value={value}
                      onChange={(event) => model.setHabit(id, event.target.value)}
                    >
                      <option value="">{t('Elige una opción')}</option>
                      {options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {t(option.text)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="simulation-routes__trial">
                <p>
                  {t(
                    trial
                      ? `Resultado de la prueba: ${activeStep?.label}. Los hábitos elegidos solo se aplican a esta simulación.`
                      : 'Elige los tres hábitos para mover el punto en el mapa. Es un escenario de ejemplo.',
                  )}
                </p>
                {model.habitFields.some(({ value }) => value) && (
                  <button type="button" className="text-button" onClick={model.resetHabits}>
                    {t('Restablecer hábitos')}
                  </button>
                )}
              </div>
            </fieldset>
          </div>
        </div>

        <div className="simulation-routes__content">
          {narration && <SimulationNarration {...narration} />}
          <p className="simulation-routes__position" aria-live={model.playing ? 'off' : 'polite'}>
            {point && activeStep ? (
              <>
                <span className="simulation-routes__dot" aria-hidden="true" />
                {t(' ')}
                <strong>{t(crewName)}</strong> · {t(wellbeingRouteLabels[point.route])} /{t(' ')}
                {t(activeStep.label)} <small>{t(point.source)}</small>
              </>
            ) : (
              t('Todavía no hay una posición asignada.')
            )}
          </p>
          <ul className="simulation-routes__tracks" aria-label={t('Rutas emocionales disponibles')}>
            {routes.map(({ id, icon, steps, action }) => {
              const active = point?.route === id;

              return (
                <li
                  className="simulation-track"
                  data-route={id}
                  aria-current={active ? 'step' : undefined}
                  key={id}
                >
                  <div className="simulation-track__top">
                    <h3>
                      <Icon name={icon} /> {t(wellbeingRouteLabels[id])}
                    </h3>
                    <button
                      type="button"
                      className="text-button simulation-track__action"
                      onClick={() => onOpenRoute(id)}
                    >
                      {t(action)} <Icon name="arrow" size={15} />
                    </button>
                  </div>
                  <ol className="simulation-track__steps" aria-label={t(wellbeingRouteLabels[id])}>
                    {steps.map(({ emotion, label }, index) => {
                      const here = active && point.index === index;
                      return (
                        <li key={label} data-here={here || undefined}>
                          <div className="simulation-track__portrait" aria-hidden="true">
                            <TumiTechPortrait
                              id={`${portraitId}-${id}-${index}-`}
                              emotion={emotion}
                            />
                          </div>
                          <span className="simulation-track__label">{t(label)}</span>
                          {here && (
                            <span className="simulation-track__marker">
                              {t('Aquí está')} {crewName.split(' ')[0]}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </li>
              );
            })}
          </ul>
          <FlightEvidence />
        </div>
      </div>
    </section>
  );
}
