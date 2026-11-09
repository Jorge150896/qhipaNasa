import { useEffect, useMemo, useRef, useState } from 'react';
import type { CrewJournal, MissionSnapshot } from '@/domain/mission/models';
import { CheckValidationError } from '@/domain/mission/models';
import type { LoadMission } from '@/domain/usecases/LoadMission';
import type {
  LoadCrewJournal,
  RecordDailyCheck,
  ReviewObservation,
} from '@/domain/usecases/ManageCrewJournal';
import { mapMissionPresentation } from './mapMissionPresentation';
import type { CheckFormValues, MissionActions, ScenarioKey, SensorKey } from './types';
interface Dependencies {
  initialScenario?: ScenarioKey;
  loadMission: LoadMission;
  loadJournal: LoadCrewJournal;
  recordCheck: RecordDailyCheck;
  reviewObservation: ReviewObservation;
}
export function useMission(dependencies: Dependencies) {
  const [snapshot, setSnapshot] = useState<MissionSnapshot | null>(null);
  const [journal, setJournal] = useState<CrewJournal>({ checks: [], reviewedObservationIds: [] });
  const [scenario, setScenario] = useState<ScenarioKey>(
    dependencies.initialScenario ?? 'sleep-change',
  );
  const [crewId, setCrewId] = useState('elena');
  const [metricId, setMetricId] = useState<SensorKey>('heartRate');
  const [zoneId, setZoneId] = useState('habitat');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);
  const [today, setToday] = useState('');
  const savingRef = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const [mission, entries] = await Promise.all([
          dependencies.loadMission.execute(scenario, controller.signal),
          dependencies.loadJournal.execute(),
        ]);
        if (controller.signal.aborted) return;
        setSnapshot(mission);
        setJournal(entries);
        setError(null);
        setLoading(false);
        setToday(new Date().toISOString().slice(0, 10));
      } catch {
        if (!controller.signal.aborted) {
          setError(
            'No pudimos cargar la misión o el registro local. Comprueba que el navegador permita guardar datos y vuelve a intentarlo.',
          );
          setLoading(false);
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [dependencies, scenario, revision]);
  const data = useMemo(
    () =>
      snapshot ? mapMissionPresentation(snapshot, journal, crewId, metricId, zoneId, today) : null,
    [snapshot, journal, crewId, metricId, zoneId, today],
  );
  const actions: MissionActions = {
    selectCrew(id) {
      const person = snapshot?.crew.find((item) => item.id === id);
      if (person) {
        setCrewId(id);
        setZoneId(person.zoneId);
        setMessage(null);
      }
    },
    selectMetric: setMetricId,
    selectZone(id) {
      if (snapshot?.zones.some((zone) => zone.id === id)) setZoneId(id);
    },
    selectScenario(id) {
      if (id !== scenario) {
        setLoading(true);
        setError(null);
        setScenario(id);
      }
    },
    async saveCheck(values: CheckFormValues) {
      if (savingRef.current) return false;
      savingRef.current = true;
      setSaving(true);
      setMessage(null);
      try {
        const next = await dependencies.recordCheck.execute({
          crewId: data?.selected.id ?? crewId,
          sleepHours: values.sleep.trim() ? Number(values.sleep) : NaN,
          fatigue: Number(values.fatigue),
          mood: values.mood,
          note: values.note,
        });
        setJournal(next);
        setToday(new Date().toISOString().slice(0, 10));
        setMessage({ text: 'Chequeo de demostración guardado en este navegador.', error: false });
        return true;
      } catch (cause) {
        setMessage({
          text:
            cause instanceof CheckValidationError
              ? cause.message
              : 'No se pudo guardar el chequeo. Revisa los permisos de almacenamiento del navegador.',
          error: true,
        });
        return false;
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
    },
    async reviewObservation(id, reviewed) {
      if (savingRef.current) return;
      savingRef.current = true;
      setSaving(true);
      try {
        setJournal(await dependencies.reviewObservation.execute(id, reviewed));
        setMessage({
          text: reviewed
            ? 'Observación marcada como revisada.'
            : 'La observación vuelve a estar pendiente.',
          error: false,
        });
      } catch {
        setMessage({ text: 'No se pudo guardar la revisión en este navegador.', error: true });
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
    },
    retry() {
      setLoading(true);
      setError(null);
      setRevision((value) => value + 1);
    },
    dismissMessage() {
      setMessage(null);
    },
  };
  return { data, loading, error, message, saving, actions };
}
