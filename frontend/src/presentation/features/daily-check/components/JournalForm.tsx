import { useState, type FormEvent } from 'react';
import type { CheckFormValues } from '../../mission/types';
import { Icon } from '@/ui/Icon';
export function JournalForm({
  personName,
  saving,
  onSave,
}: {
  personName: string;
  saving: boolean;
  onSave(values: CheckFormValues): Promise<boolean>;
}) {
  const [values, setValues] = useState<CheckFormValues>({
    sleep: '',
    fatigue: '2',
    mood: 'neutral',
    note: '',
  });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSave(values);
  }
  return (
    <form className="journal-form" onSubmit={submit}>
      <div className="form-intro">
        <span className="icon-chip">
          <Icon name="clipboard" />
        </span>
        <div>
          <h3>Chequeo de {personName}</h3>
          <p>Usa valores ficticios. Se guarda en este navegador.</p>
        </div>
      </div>
      <div className="form-grid">
        <label>
          Horas de sueño
          <input
            name="sleep"
            aria-label="Horas de sueño"
            aria-describedby="sleep-hint"
            type="number"
            min="0"
            max="24"
            step="0.1"
            required
            placeholder="Ej. 7,5"
            value={values.sleep}
            onChange={(event) => setValues({ ...values, sleep: event.target.value })}
          />
          <span id="sleep-hint" className="field-hint">
            Último periodo de descanso · 0 a 24 h
          </span>
        </label>
        <label>
          Fatiga percibida
          <select
            name="fatigue"
            value={values.fatigue}
            onChange={(event) => setValues({ ...values, fatigue: event.target.value })}
          >
            <option value="1">1 · Muy poca</option>
            <option value="2">2 · Poca</option>
            <option value="3">3 · Moderada</option>
            <option value="4">4 · Alta</option>
            <option value="5">5 · Muy alta</option>
          </select>
          <span className="field-hint">Escala de demostración, sin validación clínica</span>
        </label>
      </div>
      <fieldset>
        <legend>¿Cómo describirías tu ánimo?</legend>
        <div className="mood-options">
          {[
            { value: 'good', label: 'Bien' },
            { value: 'neutral', label: 'Regular' },
            { value: 'low', label: 'Bajo' },
          ].map((option) => (
            <label key={option.value} className={values.mood === option.value ? 'selected' : ''}>
              <input
                type="radio"
                name="mood"
                value={option.value}
                checked={values.mood === option.value}
                onChange={() =>
                  setValues({ ...values, mood: option.value as CheckFormValues['mood'] })
                }
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        Nota de demostración <span className="optional">Opcional</span>
        <textarea
          name="note"
          maxLength={400}
          rows={3}
          placeholder="Ej. Se interrumpió el descanso por una tarea del escenario."
          value={values.note}
          onChange={(event) => setValues({ ...values, note: event.target.value })}
        />
        <span className="field-hint">
          {values.note.length} / 400 · No introduzcas información médica real.
        </span>
      </label>
      <div className="form-footer">
        <span>
          <Icon name="shield" size={14} />
          Guardado local · Sin sincronización
        </span>
        <button className="button primary" disabled={saving} type="submit">
          <Icon name={saving ? 'loader' : 'check'} className={saving ? 'spin' : ''} />
          {saving ? 'Guardando…' : 'Guardar chequeo'}
        </button>
      </div>
    </form>
  );
}
