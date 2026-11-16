import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { useEffect, useRef, type FormEvent } from 'react';
import { CheckAttachments } from './CheckAttachments';
import { Frown, Meh, Pencil, Smile } from 'lucide-react';
import { Icon } from '@/ui/Icon';
import { DailyWellbeingWelcome } from './DailyWellbeingWelcome';
import type { DailyCheckGuideViewModel, DailyCheckViewModel } from '../types';

const moodIcons = { good: Smile, neutral: Meh, low: Frown };

const steps = ['Contexto', 'Autoevaluación', 'Confirmación', 'Resultado'];

export function JournalForm({
  personName,
  saving,
  updating,
  model,
  guide,
}: {
  personName: string;
  saving: boolean;
  updating: boolean;
  model: DailyCheckViewModel;
  guide: DailyCheckGuideViewModel;
}) {
  const t = useTranslation();
  const { step, values } = model;
  const heading = useRef<HTMLHeadingElement>(null);
  const lastStep = useRef(step);
  useEffect(() => {
    if (lastStep.current !== step || (step === 2 && guide.mode === 'guided'))
      heading.current?.focus();
    lastStep.current = step;
  }, [step, guide.mode]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!saving) void model.advance(guide.mode !== 'guided' || guide.voice);
  }

  const tumi = (
    <DailyWellbeingWelcome
      personName={personName}
      result={step === 3}
      audioLabel={model.tumiAudioLabel}
      reply={model.tumiReply}
      words={model.tumiWords}
      spokenWords={model.tumiSpokenWords}
      speaking={model.tumiSpeaking}
      emotion={model.tumiExpression}
      playing={model.tumiAudioPlaying}
      audioStatus={model.tumiAudioStatus}
      onToggleAudio={model.toggleTumiAudio}
    />
  );

  return (
    <form
      id="daily-check-form"
      tabIndex={-1}
      className="journal-form daily-check-form"
      onSubmit={submit}
      noValidate={step !== 1}
    >
      {step === 0 && (
        <button
          type="button"
          className="text-button daily-check-change-mode"
          onClick={guide.chooseMode}
        >
          {t('Cambiar modo de registro')}
        </button>
      )}
      {step < 2 && (
        <>
          {tumi}
          <fieldset className="daily-mood">
            <legend>{t('¿Cómo describirías tu ánimo?')}</legend>
            <div className="daily-mood-options">
              {(['good', 'neutral', 'low'] as const).map((mood) => {
                const MoodIcon = moodIcons[mood];
                return (
                  <label key={mood} data-mood={mood} data-selected={values.mood === mood}>
                    <input
                      type="radio"
                      name="mood"
                      checked={values.mood === mood}
                      onChange={() => model.selectMood(mood)}
                    />
                    <MoodIcon aria-hidden="true" size={23} />
                    {t(mood === 'low' ? 'Triste' : model.moods[mood])}
                  </label>
                );
              })}
            </div>
            {values.mood && (
              <button type="button" className="text-button" onClick={() => model.selectMood()}>
                {t('Quitar respuesta de ánimo')}
              </button>
            )}
          </fieldset>
        </>
      )}
      <ol className="daily-check-progress" aria-label={t('Progreso del chequeo')}>
        {steps.map((name, index) => (
          <li
            key={name}
            aria-current={step === index ? 'step' : undefined}
            data-complete={index < step || undefined}
          >
            <span aria-hidden="true">
              {index < step ? <Icon name="check" size={13} /> : index + 1}
            </span>
            {t(name)}
          </li>
        ))}
      </ol>
      <div className="daily-check-step-header">
        <h4 ref={heading} tabIndex={-1}>
          {t(steps[step])}
        </h4>
        {step === 2 && (
          <div className="daily-check-review-actions">
            <button
              type="button"
              className="button secondary"
              disabled={saving}
              onClick={model.back}
            >
              <Pencil aria-hidden="true" size={18} />
              {t('Corregir respuestas')}
            </button>
            <button
              id="assistant-target-save-check"
              type="submit"
              className="button primary"
              disabled={saving}
            >
              <Icon name={saving ? 'loader' : 'clipboard'} />
              {t(saving ? 'Guardando…' : model.failed ? 'Reintentar guardado' : 'Guardar chequeo')}
            </button>
          </div>
        )}
      </div>
      {step === 0 && (
        <>
          <fieldset>
            <legend>{t('¿Qué actividad quieres registrar?')}</legend>
            <div className="daily-activity-options">
              {model.activities.map(({ id, label, icon }) => (
                <label key={id} data-selected={model.activity === id}>
                  <input
                    type="radio"
                    name="daily-activity"
                    checked={model.activity === id}
                    onChange={() => model.selectActivity(id)}
                  />
                  <Icon name={icon} size={20} />
                  {t(label)}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>{t('Momento del chequeo')}</legend>
            <div className="daily-moment-options">
              {model.moments.map(({ id, label }) => (
                <label key={id} data-selected={model.moment === id}>
                  <input
                    type="radio"
                    name="daily-moment"
                    checked={model.moment === id}
                    onChange={() => model.selectMoment(id)}
                  />
                  {t(label)}
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}
      {step === 1 && (
        <>
          <fieldset>
            <legend>{t('Bienestar general')}</legend>
            <div className="form-grid">
              <label>
                {t('Horas de sueño')}
                <input
                  aria-label={t('Horas de sueño')}
                  type="number"
                  min="0"
                  max="24"
                  step="0.1"
                  required
                  placeholder={t('Ej. 7,5')}
                  value={values.sleep}
                  onChange={(event) => model.setValues({ ...values, sleep: event.target.value })}
                />
              </label>
              <label>
                {t('Fatiga percibida')}
                <select
                  value={values.fatigue}
                  onChange={(event) => model.setValues({ ...values, fatigue: event.target.value })}
                >
                  <option value="">{t('Sin responder')}</option>
                  <option value="1">{t('1 · Muy poca')}</option>
                  <option value="2">{t('2 · Poca')}</option>
                  <option value="3">{t('3 · Moderada')}</option>
                  <option value="4">{t('4 · Alta')}</option>
                  <option value="5">{t('5 · Muy alta')}</option>
                </select>
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend>{t('¿Hiciste ejercicio hoy?')}</legend>
            <div className="mood-options">
              {[
                { label: 'Sí', value: true },
                { label: 'No', value: false },
                { label: 'Sin responder', value: undefined },
              ].map(({ label, value }) => (
                <label key={label}>
                  <input
                    type="radio"
                    name="exercise-done"
                    checked={values.exerciseDone === value}
                    onChange={() => model.setValues({ ...values, exerciseDone: value })}
                  />
                  {t(label)}
                </label>
              ))}
            </div>
          </fieldset>
          <label>
            {t('Región con molestias (opcional)')}
            <select
              value={model.region}
              onChange={(event) => {
                const selected = model.regions.find(({ id }) => id === event.target.value);
                model.setRegion(selected?.id ?? '');
              }}
            >
              <option value="">{t('Sin informar')}</option>
              {model.regions.map(({ id, label }) => (
                <option key={id} value={id}>
                  {t(label)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('Área de salud que quieres comentar (opcional)')}
            <select
              value={model.healthArea}
              onChange={(event) =>
                model.selectHealthArea(
                  model.healthAreas.find(({ id }) => id === event.target.value)?.id ?? '',
                )
              }
            >
              <option value="">{t('Sin indicar')}</option>
              {model.healthAreas.map(({ id, label }) => (
                <option key={id} value={id}>
                  {t(label)}
                </option>
              ))}
            </select>
          </label>
          {model.healthArea && (
            <label>
              {t('Estado reportado')}
              <select
                value={model.healthReport?.reportedState ?? ''}
                onChange={(event) =>
                  model.selectHealthState(
                    model.reportedStates.find((id) => id === event.target.value) ?? '',
                  )
                }
              >
                <option value="">{t('Sin responder')}</option>
                {model.reportedStates.map((id) => (
                  <option key={id} value={id}>
                    {t(model.reportedStateLabels[id])}
                  </option>
                ))}
              </select>
            </label>
          )}
          {model.healthArea === 'vision' && model.healthReport?.reportedState === 'change' && (
            <label>
              {t('¿En qué actividad visual notaste el cambio? (opcional)')}
              <select
                value={model.healthReport.visionActivityId ?? ''}
                onChange={(event) =>
                  model.selectVisionActivity(
                    model.visionActivities.find(({ id }) => id === event.target.value)?.id,
                  )
                }
              >
                <option value="">{t('Sin indicar')}</option>
                {model.visionActivities.map(({ id, label }) => (
                  <option key={id} value={id}>
                    {t(label)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <fieldset>
            <legend>{t('Datos de la actividad (opcionales)')}</legend>
            <div className="form-grid">
              {model.measurementsForm.map((field) => (
                <label key={field.key}>
                  {t(field.label)}
                  {t(field.unit ? ` (${field.unit})` : '')}
                  <input
                    type="number"
                    min={0}
                    max={field.max}
                    step={field.integer ? 1 : 'any'}
                    placeholder={t('Sin registrar')}
                    value={field.value}
                    onChange={(event) => model.setMeasurement(field.key, event.target.value)}
                  />
                  {field.max !== undefined && (
                    <span className="field-hint">
                      {t('Escala de demostración de 0 a ')}
                      {field.max}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </fieldset>
          <label>
            {t('Nota (opcional)')}
            <textarea
              rows={3}
              maxLength={400}
              value={values.note}
              onChange={(event) => model.setValues({ ...values, note: event.target.value })}
            />
          </label>
        </>
      )}
      {step === 2 && (
        <>
          <p className="sub">
            {t(personName)}
            {t(' · Un chequeo por persona y día UTC.')}
          </p>
          {updating && (
            <p className="daily-check-notice">
              {t('Ya existe un chequeo para este día UTC. Guardar actualizará ese registro.')}
            </p>
          )}
          {model.failed && (
            <p className="daily-check-notice" role="alert">
              {t('El borrador sigue disponible. Revisa los datos o vuelve a intentar el guardado.')}
            </p>
          )}
          <h5>{t('Tus respuestas')}</h5>
          <dl className="daily-check-summary">
            {model.review.map(({ label, value }) => (
              <div key={label}>
                <dt>{t(label)}</dt>
                <dd>{label === 'Nota' && values.note.trim() ? value : t(value)}</dd>
              </div>
            ))}
          </dl>
          <section aria-label={t('Datos adjuntos')}>
            <h5>{t('Datos adjuntos')}</h5>
            {model.attachment ? (
              <CheckAttachments data={model.attachment} />
            ) : (
              <p>{t('Sin datos adjuntos disponibles.')}</p>
            )}
          </section>
        </>
      )}
      {step === 3 && (
        <>
          {tumi}
          <div className="daily-check-result">
            <Icon name="checked" size={25} />
            <strong>{t('Chequeo guardado')}</strong>
            <button type="button" className="button secondary" onClick={guide.edit}>
              {t('Editar chequeo del día')}
            </button>
          </div>
        </>
      )}
      {step < 2 && (
        <div className="form-footer">
          {step > 0 && (
            <button
              type="button"
              className="button secondary"
              disabled={saving}
              onClick={model.back}
            >
              {t('Volver al contexto')}
            </button>
          )}
          <button
            className="button primary"
            disabled={saving || (step === 0 && (!model.activity || !model.moment))}
            id={step === 1 ? 'assistant-target-review-check' : undefined}
            data-assistant-control={step === 0 ? 'check-context' : undefined}
            type="submit"
          >
            {t(
              saving ? 'Guardando…' : step === 0 ? 'Continuar a autoevaluación' : 'Revisar chequeo',
            )}
          </button>
        </div>
      )}
    </form>
  );
}
