import { useEffect, useMemo, useRef, useState } from 'react';
import { HealthValidationError, type HealthJournal } from '@/domain/health/models';
import type { Clock } from '@/domain/mission/models';
import type {
  LoadCrewHealth,
  RecordCrewHealth,
  ReviewCrewHealth,
} from '@/domain/usecases/ManageCrewHealth';
import { mapCrewHealthPresentation } from './mapCrewHealthPresentation';
import type { BodySystemKey, CrewHealthContext, HealthFormValues } from './types';
interface Dependencies {
  load: LoadCrewHealth;
  record: RecordCrewHealth;
  review: ReviewCrewHealth;
  clock: Clock;
}
export function useCrewHealthViewModel(
  dependencies: Dependencies,
  context: CrewHealthContext,
  systemId: BodySystemKey,
) {
  const [journal, setJournal] = useState<HealthJournal | null>(null);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(false),
    [revision, setRevision] = useState(0);
  const [saving, setSaving] = useState(false);
  const [today, setToday] = useState('');
  const [message, setMessage] = useState<{ scope: string; text: string; error: boolean } | null>(
    null,
  );
  const busy = useRef(false);
  const scope = `${context.habitatId}:${context.mission.selected.id}:${systemId}`;
  useEffect(() => {
    let active = true;
    void dependencies.load
      .execute()
      .then((result) => {
        if (active) {
          setJournal(result);
          setLoading(false);
          setError(false);
          setToday(dependencies.clock.now().toISOString().slice(0, 10));
        }
      })
      .catch(() => {
        if (active) {
          setJournal(null);
          setLoading(false);
          setError(true);
        }
      });
    return () => {
      active = false;
    };
  }, [dependencies, revision]);
  const data = useMemo(
    () => mapCrewHealthPresentation(context, journal, systemId, today),
    [context, journal, systemId, today],
  );
  return {
    data,
    loading,
    error,
    saving,
    message: message?.scope === scope ? message : null,
    retry() {
      setLoading(true);
      setError(false);
      setRevision((value) => value + 1);
    },
    async save(values: HealthFormValues) {
      if (busy.current || loading || error) return false;
      busy.current = true;
      setSaving(true);
      setMessage(null);
      try {
        const result = await dependencies.record.execute({
          crewId: context.mission.selected.id,
          systemId,
          reportedState: values.state,
          note: values.note,
          activity: systemId === 'fitness' ? values.activity : '',
          minutes:
            systemId === 'fitness' && values.minutes.trim() !== '' ? Number(values.minutes) : null,
        });
        setJournal(result);
        setToday(dependencies.clock.now().toISOString().slice(0, 10));
        setMessage({
          scope,
          text: 'Autorregistro de demostración guardado en este navegador.',
          error: false,
        });
        return true;
      } catch (cause) {
        setMessage({
          scope,
          text:
            cause instanceof HealthValidationError
              ? cause.message
              : 'No se pudo guardar. Revisa los permisos o el espacio de almacenamiento; tus registros anteriores se conservan.',
          error: true,
        });
        return false;
      } finally {
        busy.current = false;
        setSaving(false);
      }
    },
    async review() {
      if (busy.current || loading || error) return;
      busy.current = true;
      setSaving(true);
      setMessage(null);
      try {
        setJournal(
          await dependencies.review.execute(context.mission.selected.id, systemId, !data.reviewed),
        );
        setToday(dependencies.clock.now().toISOString().slice(0, 10));
        setMessage({
          scope,
          text: data.reviewed
            ? 'La revisión vuelve a estar pendiente.'
            : 'Revisión documental registrada hoy en UTC. No acredita una evaluación clínica.',
          error: false,
        });
      } catch {
        setMessage({
          scope,
          text: 'No se pudo guardar la revisión. Los registros anteriores se conservan.',
          error: true,
        });
      } finally {
        busy.current = false;
        setSaving(false);
      }
    },
  };
}
