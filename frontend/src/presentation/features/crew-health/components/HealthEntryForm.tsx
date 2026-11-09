import { useId, useState, type FormEvent } from 'react';
import type { BodySystemKey, HealthFormValues } from '../types';
export function HealthEntryForm({
  systemId,
  name,
  disabled,
  onSave,
}: {
  systemId: BodySystemKey;
  name: string;
  disabled: boolean;
  onSave(values: HealthFormValues): Promise<boolean>;
}) {
  const stateId = useId();
  const [values, setValues] = useState<HealthFormValues>({
    state: 'not-assessed',
    note: '',
    activity: '',
    minutes: '',
  });
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (disabled) return;
    if (await onSave(values))
      setValues({ state: 'not-assessed', note: '', activity: '', minutes: '' });
  }
  return (
    <form className="health-entry-form" onSubmit={submit}>
      <h4>Nuevo autorregistro</h4>
      <p>Datos ficticios de {name}. No modifica las lecturas de los sensores.</p>
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
      {systemId === 'fitness' && (
        <div className="health-form-row">
          <label>
            Actividad registrada
            <input
              maxLength={80}
              value={values.activity}
              placeholder="Ejemplo ficticio: bicicleta"
              disabled={disabled}
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
        {systemId === 'vision' ? 'Observación visual' : 'Observación y contexto'}
        <textarea
          value={values.note}
          maxLength={600}
          rows={3}
          disabled={disabled}
          placeholder="Describe solo información ficticia de la demo."
          onChange={(event) => setValues({ ...values, note: event.target.value })}
        />
      </label>
      <button className="button primary" type="submit" disabled={disabled}>
        Guardar autorregistro
      </button>
    </form>
  );
}
