import { useCallback, useId, useState, type FormEvent } from 'react';
import { reportedStateLabels } from '../constants';
import type { HealthFormValues, HealthSystemContent } from '../types';
import { findVisionActivity, visionActivities } from '../visionActivities';
import { VisionActivityIllustration } from './VisionObservationGuide';

const emptyForm: HealthFormValues = {
  state: 'not-assessed',
  note: '',
  activity: '',
  minutes: '',
};

export function HealthEntryForm({
  system,
  name,
  disabled,
  zones,
  onSave,
  savedEntryId,
  onOpenTimelineRecord,
}: {
  system: HealthSystemContent;
  name: string;
  disabled: boolean;
  zones: { id: string; name: string }[];
  onSave(values: HealthFormValues): Promise<boolean>;
  savedEntryId?: string;
  onOpenTimelineRecord(id: string): void;
}) {
  const stateId = useId();
  const visionId = useId();
  const noteHelpId = useId();
  const [values, setValues] = useState(emptyForm);
  const [confirming, setConfirming] = useState(false);
  const [saved, setSaved] = useState(false);
  const isVision = system.id === 'vision';
  const selectedActivity = findVisionActivity(values.visionActivityId);
  const showSavedRecord = saved && isVision && savedEntryId;
  const focusSavedRecord = useCallback((button: HTMLButtonElement | null) => {
    button?.focus();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;
    if (!confirming) {
      setConfirming(true);
      setSaved(false);
      return;
    }
    if (await onSave(values)) {
      setValues(emptyForm);
      setConfirming(false);
      setSaved(true);
    }
  }

  return (
    <form className="health-entry-form" onSubmit={submit}>
      <h4
        tabIndex={-1}
        ref={confirming ? (heading) => heading?.focus({ preventScroll: true }) : undefined}
      >
        {confirming ? 'Confirma tu autorregistro' : 'Nuevo autorregistro'}
      </h4>
      {confirming ? (
        <>
          <dl className="health-confirmation">
            <div>
              <dt>Tripulante y área</dt>
              <dd>
                {name} · {system.label}
              </dd>
            </div>
            <div>
              <dt>Estado reportado</dt>
              <dd>{reportedStateLabels[values.state]}</dd>
            </div>
            {system.id === 'fitness' && (
              <div>
                <dt>Actividad y duración</dt>
                <dd>
                  {values.activity.trim() || 'Actividad sin informar'} ·{' '}
                  {values.minutes ? `${values.minutes} min` : 'Duración sin informar'}
                </dd>
              </div>
            )}
            {isVision && selectedActivity && (
              <div>
                <dt>Actividad visual</dt>
                <dd>{selectedActivity.label}</dd>
              </div>
            )}
            {values.zoneId && (
              <div>
                <dt>Módulo reportado</dt>
                <dd>{zones.find((zone) => zone.id === values.zoneId)?.name}</dd>
              </div>
            )}
            <div>
              <dt>Observación</dt>
              <dd>{values.note.trim() || 'Sin observación escrita'}</dd>
            </div>
          </dl>
          <div className="health-form-actions">
            <button className="button primary" type="submit" disabled={disabled}>
              Guardar autorregistro
            </button>
            <button
              className="button secondary"
              type="button"
              disabled={disabled}
              onClick={() => setConfirming(false)}
            >
              Editar respuestas
            </button>
          </div>
        </>
      ) : (
        <>
          {showSavedRecord && (
            <div className="health-vision-saved">
              <span>Registro visual guardado</span>
              <button
                className="button primary"
                type="button"
                ref={focusSavedRecord}
                onClick={() => onOpenTimelineRecord(showSavedRecord)}
              >
                Ver mi registro
              </button>
            </div>
          )}
          {!isVision && <p>{system.checkPrompt}</p>}
          <p>Registra solo datos ficticios de {name}. Se guardan en este navegador.</p>
          {isVision && (
            <fieldset className="health-vision-field" disabled={disabled}>
              <legend>
                ¿Qué estabas haciendo? <span>(opcional)</span>
              </legend>
              <div className="health-vision-options">
                {visionActivities.map(({ id, label }) => (
                  <label className="health-vision-choice" key={id}>
                    <input
                      type="radio"
                      name={visionId}
                      value={id}
                      checked={values.visionActivityId === id}
                      onChange={() => setValues({ ...values, visionActivityId: id })}
                    />
                    <span className="health-vision-tile">
                      <VisionActivityIllustration id={id} />
                      <strong>{label}</strong>
                    </span>
                  </label>
                ))}
              </div>
              <label className="health-vision-skip">
                <input
                  type="radio"
                  name={visionId}
                  value=""
                  checked={!values.visionActivityId}
                  onChange={() => setValues({ ...values, visionActivityId: undefined })}
                />
                Sin indicar
              </label>
            </fieldset>
          )}
          <div className="health-select-field">
            <label htmlFor={stateId}>Estado reportado</label>
            <select
              id={stateId}
              value={values.state}
              disabled={disabled}
              onChange={(event) =>
                setValues({ ...values, state: event.target.value as HealthFormValues['state'] })
              }
            >
              <option value="not-assessed">No evaluado</option>
              <option value="no-change">Sin cambios reportados</option>
              <option value="change">Cambio reportado</option>
            </select>
          </div>
          {system.id === 'fitness' && (
            <div className="health-form-row">
              <label>
                Actividad registrada
                <input
                  maxLength={80}
                  value={values.activity}
                  placeholder="Ejemplo ficticio: bicicleta"
                  disabled={disabled}
                  required={values.minutes !== ''}
                  onChange={(event) => setValues({ ...values, activity: event.target.value })}
                />
              </label>
              <label>
                Duración registrada (min)
                <input
                  type="number"
                  min="0"
                  max="1440"
                  step="any"
                  value={values.minutes}
                  placeholder="Sin informar"
                  disabled={disabled}
                  onChange={(event) => setValues({ ...values, minutes: event.target.value })}
                />
              </label>
            </div>
          )}
          <label>
            Módulo al que corresponde el registro (opcional)
            <select
              value={values.zoneId ?? ''}
              disabled={disabled}
              onChange={(event) => setValues({ ...values, zoneId: event.target.value })}
            >
              <option value="">Sin informar</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            {isVision ? 'Observación visual' : 'Observación y contexto'}
            <textarea
              aria-describedby={isVision ? noteHelpId : undefined}
              value={values.note}
              maxLength={600}
              rows={3}
              disabled={disabled}
              required={values.state === 'change'}
              onChange={(event) => setValues({ ...values, note: event.target.value })}
            />
          </label>
          {isVision && (
            <p id={noteHelpId} className="health-vision-note-help">
              {selectedActivity?.prompt ?? 'Describe qué notaste y cuándo ocurrió.'}
            </p>
          )}
          <div className="health-form-actions">
            <button
              className={`button ${showSavedRecord ? 'secondary' : 'primary'}`}
              type="submit"
              disabled={disabled}
            >
              Revisar respuestas
            </button>
            {saved && !isVision && (
              <a className="text-button" href="#crew-health-next">
                Consultar siguiente paso
              </a>
            )}
          </div>
        </>
      )}
    </form>
  );
}
