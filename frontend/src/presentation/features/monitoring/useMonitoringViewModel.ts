'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CaptureMonitoring } from '@/domain/usecases/CaptureMonitoring';
import type {
  LoadMonitoringJournal,
  SaveMonitoringSession,
} from '@/domain/usecases/ManageMonitoringJournal';
import type { CaptureAttempt, MonitoringSession } from '@/domain/monitoring/models';
import { telemetryDefinitions } from '@/domain/measurements/HealthMeasurement';
import {
  activityOptions,
  metricNames,
  type ActivityKey,
  type Mode,
  type MonitoringActions,
  type MonitoringData,
} from './types';

export interface MonitoringDependencies {
  apiConfigured: boolean;
  capture: Record<Mode, Pick<CaptureMonitoring, 'execute'>>;
  load: Pick<LoadMonitoringJournal, 'execute'>;
  save: Pick<SaveMonitoringSession, 'execute'>;
  now(): string;
  nextId(): string;
}
const formatAt = (at: string) =>
  new Date(at).toLocaleString('es-PE', { timeZone: 'UTC', hour12: false }) + ' UTC';
const formatValue = (value: number | null) =>
  value === null ? '—' : value.toLocaleString('es-PE', { maximumFractionDigits: 2 });
const message = (error: unknown) =>
  error instanceof Error ? error.message : 'No se pudo completar la operación.';

export function useMonitoringViewModel(
  deps: MonitoringDependencies,
  person: { id: string; name: string; location: string },
) {
  const [step, setStep] = useState<MonitoringData['step']>('prepare');
  const [mode, setMode] = useState<Mode>(deps.apiConfigured ? 'api' : 'demo');
  const [apiSubject, setApiSubject] = useState('');
  const [activity, setActivity] = useState<ActivityKey>('cabin');
  const [phase, setPhase] = useState<'before' | 'during' | 'after'>('before');
  const [location, setLocation] = useState(deps.apiConfigured ? '' : person.location);
  const [equipment, setEquipment] = useState('');
  const [checks, setChecks] = useState([false, false, false]);
  const [attempts, setAttempts] = useState<CaptureAttempt[]>([]);
  const [sessions, setSessions] = useState<readonly MonitoringSession[]>([]);
  const [busy, setBusy] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [journalError, setJournalError] = useState('');
  const [journalLoading, setJournalLoading] = useState(true);
  const [note, setNote] = useState('');
  const [now, setNow] = useState('');
  const controller = useRef<AbortController | null>(null);
  const sessionId = useRef('');
  const mounted = useRef(false);
  const subjectId = mode === 'demo' ? person.id : apiSubject.trim();
  const subjectLabel = mode === 'demo' ? person.name : `Sujeto API: ${subjectId}`;
  const ready =
    checks.every(Boolean) &&
    Boolean(subjectId && equipment.trim() && location.trim()) &&
    (mode === 'demo' || deps.apiConfigured);

  const load = useCallback(() => {
    return deps.load
      .execute()
      .then((result) => {
        if (mounted.current) {
          setSessions(result);
          setJournalError('');
          setJournalLoading(false);
        }
      })
      .catch((err) => {
        if (mounted.current) {
          setJournalError(message(err));
          setJournalLoading(false);
        }
      });
  }, [deps]);
  useEffect(() => {
    mounted.current = true;
    void load();
    const timer = setInterval(() => setNow(deps.now()), 1000);
    return () => {
      mounted.current = false;
      controller.current?.abort();
      clearInterval(timer);
    };
  }, [deps, load]);

  const capture = useCallback(async () => {
    if (controller.current || step !== 'capture' || attempts.length >= 20) return;
    const current = new AbortController();
    controller.current = current;
    setBusy(true);
    setError('');
    try {
      const attempt = await deps.capture[mode].execute({
        requestId: deps.nextId(),
        subjectId,
        signal: current.signal,
      });
      if (current.signal.aborted || !mounted.current) return;
      for (const sample of attempt.measurements) {
        const existing = attempts.flatMap((a) => a.measurements).find((m) => m.id === sample.id);
        if (
          existing &&
          (existing.indicator !== sample.indicator ||
            existing.value !== sample.value ||
            existing.unit !== sample.unit ||
            existing.source.id !== sample.source.id ||
            existing.time.kind !== 'instant' ||
            sample.time.kind !== 'instant' ||
            existing.time.at !== sample.time.at)
        )
          throw new Error(
            'Un identificador de muestra fue reutilizado con otros datos. Revisa el servicio.',
          );
        const previous = attempts
          .flatMap((a) => a.measurements)
          .filter((m) => m.indicator === sample.indicator)
          .at(-1);
        if (
          previous?.time.kind === 'instant' &&
          sample.time.kind === 'instant' &&
          (Date.parse(sample.time.at) < Date.parse(previous.time.at) ||
            (sample.id === previous.id &&
              (sample.value !== previous.value || sample.time.at !== previous.time.at)))
        )
          throw new Error(
            'Se recibió una muestra anterior o un identificador reutilizado. Revisa el servicio.',
          );
      }
      setAttempts((items) => [...items, attempt]);
      setNow(deps.now());
      if (attempts.length >= 19) setRunning(false);
    } catch (err) {
      if (!current.signal.aborted && mounted.current) {
        setError(message(err));
        setRunning(false);
      }
    } finally {
      if (controller.current === current) {
        controller.current = null;
        if (mounted.current) setBusy(false);
      }
    }
  }, [attempts, deps, mode, step, subjectId]);
  useEffect(() => {
    if (!running || busy || step !== 'capture') return;
    const timer = setTimeout(() => void capture(), 5000);
    return () => clearTimeout(timer);
  }, [running, busy, step, capture]);

  const stop = () => {
    setRunning(false);
    controller.current?.abort();
  };
  const save = async () => {
    if (busy || step !== 'review' || journalError || journalLoading) return;
    setBusy(true);
    setError('');
    try {
      const saved = await deps.save.execute({
        id: sessionId.current,
        subjectId,
        subjectLabel,
        mode,
        context: { activity, phase, location: location.trim(), equipment: equipment.trim() },
        attempts,
        note: note.trim(),
        savedAt: deps.now(),
      });
      if (mounted.current) {
        setSessions(saved);
        setStep('saved');
      }
    } catch (err) {
      if (mounted.current) setError(message(err));
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const last = attempts.at(-1);
  const metrics = Object.entries(telemetryDefinitions).map(([id, definition]) => {
    const sample = last?.measurements.find((m) => m.indicator === id);
    const previous = attempts
      .slice(0, -1)
      .flatMap((a) => a.measurements)
      .filter((m) => m.indicator === id)
      .at(-1);
    const at = sample?.time.kind === 'instant' ? sample.time.at : '';
    const ageSeconds =
      at && now ? Math.max(0, Math.floor((Date.parse(now) - Date.parse(at)) / 1000)) : 0;
    const points = attempts.map((a, index) => {
      const value = a.measurements.find((m) => m.indicator === id)?.value;
      return { x: index, value: value ?? null };
    });
    const numbers = points.flatMap((p) => (p.value === null ? [] : [p.value]));
    const min = Math.min(...numbers),
      max = Math.max(...numbers);
    const path = points
      .map((p) =>
        p.value === null
          ? '|'
          : `${(p.x * 200) / Math.max(1, points.length - 1)},${40 - ((p.value - min) / (max - min || 1)) * 30}`,
      )
      .join(' ');
    return {
      id,
      label: metricNames[id as keyof typeof metricNames],
      value: formatValue(sample?.value ?? null),
      unit: definition.unit,
      status: !sample
        ? 'Sin muestra en esta captura'
        : sample.quality === 'missing'
          ? 'Muestra ausente'
          : sample.quality === 'stale'
            ? 'Marcada antigua por la fuente'
            : sample.id === previous?.id
              ? 'Repetida; sin muestra nueva'
              : 'Lectura recibida',
      source: sample
        ? `${sample.source.kind === 'synthetic' ? 'Sintético' : 'Dispositivo'} · ${sample.source.id}`
        : 'Sin procedencia recibida',
      at: at ? formatAt(at) : 'Sin fecha',
      age: at ? `Hace ${ageSeconds} s` : '',
      delta:
        sample?.value != null && previous?.value != null
          ? `Cambio entre capturas: ${formatValue(sample.value - previous.value)} ${definition.unit}`
          : 'Sin comparación disponible',
      points: path,
    };
  });
  const data: MonitoringData = {
    step,
    mode,
    apiConfigured: deps.apiConfigured,
    subjectId: apiSubject,
    subjectLabel,
    activity,
    phase,
    location,
    equipment,
    checks,
    ready,
    busy,
    running,
    error,
    journalError,
    journalLoading,
    note,
    captureCount: attempts.length,
    metrics,
    attempts: attempts.map((a) => ({
      id: a.id,
      at: formatAt(a.receivedAt),
      samples: a.measurements.map((m) => ({
        id: m.id,
        label: metricNames[m.indicator as keyof typeof metricNames],
        value: `${formatValue(m.value)} ${m.unit}`,
        detail: `${m.time.kind === 'instant' ? formatAt(m.time.at) : ''} · ${m.source.id} · ${m.quality}`,
      })),
    })),
    sessions: sessions
      .filter((s) => s.mode === mode && s.subjectId === subjectId)
      .map((s) => ({
        id: s.id,
        subject: s.subjectLabel,
        context: `${s.context.location} · ${s.context.equipment} · ${s.context.phase === 'before' ? 'Antes' : s.context.phase === 'during' ? 'Durante' : 'Después'} de la actividad`,
        source: s.mode === 'demo' ? 'Sintético' : 'API',
        at: formatAt(s.savedAt),
        activity:
          activityOptions.find((a) => a.id === s.context.activity)?.label ?? s.context.activity,
        count: s.attempts.length,
        note: s.note,
        readings: s.attempts.map(
          (a, i) =>
            `Captura ${i + 1} · recibida ${formatAt(a.receivedAt)} · ${a.measurements.map((m) => `${metricNames[m.indicator as keyof typeof metricNames]}: ${formatValue(m.value)} ${m.unit} (${m.quality}, ${m.source.id}, muestra ${m.id}, observada ${m.time.kind === 'instant' ? formatAt(m.time.at) : 'sin fecha'})`).join(' · ') || 'Sin muestras'}`,
        ),
      })),
  };
  const actions: MonitoringActions = {
    setMode: (value) => {
      setMode(value);
      setLocation(value === 'demo' ? person.location : '');
      setEquipment('');
      setChecks([false, false, false]);
    },
    setSubjectId: setApiSubject,
    setActivity,
    setPhase,
    setLocation,
    setEquipment,
    setCheck: (index, value) =>
      setChecks((items) => items.map((item, i) => (i === index ? value : item))),
    begin: () => {
      if (ready) {
        sessionId.current = deps.nextId();
        setStep('capture');
        setError('');
      }
    },
    capture: () => void capture(),
    toggleRunning: () => {
      if (running) stop();
      else {
        setRunning(true);
        void capture();
      }
    },
    review: () => {
      stop();
      if (attempts.length) {
        setError('');
        setStep('review');
      }
    },
    resume: () => {
      setError('');
      setStep('capture');
    },
    setNote,
    save: () => void save(),
    reset: () => {
      stop();
      setStep('prepare');
      setAttempts([]);
      setChecks([false, false, false]);
      setNote('');
      setError('');
    },
    retryJournal: () => {
      setJournalLoading(true);
      void load();
    },
  };
  return { data, actions };
}
