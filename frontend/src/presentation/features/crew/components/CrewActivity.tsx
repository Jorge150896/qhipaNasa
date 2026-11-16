import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
interface ActivitySummary {
  id: string;
  date: string;
  title: string;
  detail: string;
}

type SavedEntry = ActivitySummary & { kind: 'health' };
type DailyEntry = ActivitySummary & {
  kind: 'check';
  check: ReturnType<typeof describeDailyCheck>;
};
type SessionEntry = ActivitySummary & {
  kind: 'monitoring';
  context: string;
  note: string;
  readings: string[];
};
export type ActivityEntry = SavedEntry | DailyEntry | SessionEntry;

export function CrewActivity({
  entries,
  incomplete,
  onOpen,
}: {
  entries: ActivityEntry[];
  incomplete: boolean;
  onOpen(entry: SavedEntry): void;
}) {
  const t = useTranslation();
  return (
    <section className="panel crew-activity" aria-labelledby="crew-activity-title">
      <h3 id="crew-activity-title">{t('Actividad guardada')}</h3>
      {incomplete && <p className="sub">{t('Algunos registros aún no están disponibles.')}</p>}
      {entries.length ? (
        <ul className="crew-activity-list">
          {entries.map((entry) => (
            <li key={`${entry.kind}:${entry.id}`}>
              {entry.kind === 'monitoring' ? (
                <details id={`session-${encodeURIComponent(entry.id)}`}>
                  <summary>
                    {t(entry.title)} · {t(entry.detail)} · {t(entry.date)}
                  </summary>
                  <p>{t(entry.context)}</p>
                  {entry.note && <p>{entry.note}</p>}
                  <ul>
                    {entry.readings.map((reading) => (
                      <li key={reading}>{t(reading)}</li>
                    ))}
                  </ul>
                </details>
              ) : entry.kind === 'check' ? (
                <details id={`check-${encodeURIComponent(entry.id)}`}>
                  <summary>
                    {t(entry.title)} · {t(entry.detail)} · {t(entry.date)}
                  </summary>
                  {entry.check.contextLabel && <p>{t(entry.check.contextLabel)}</p>}
                  <dl className="daily-check-summary">
                    {[
                      { label: 'Sueño', value: entry.check.sleep },
                      { label: 'Fatiga', value: entry.check.fatigue },
                      { label: 'Ánimo', value: entry.check.mood },
                      ...entry.check.details,
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <dt>{t(label)}</dt>
                        <dd>{t(value)}</dd>
                      </div>
                    ))}
                  </dl>
                  {entry.check.note && <p>{entry.check.note}</p>}
                  {entry.check.savedAttachment && (
                    <details>
                      <summary>{t('Ver datos adjuntos del chequeo')}</summary>
                      <CheckAttachments data={entry.check.savedAttachment} />
                    </details>
                  )}
                </details>
              ) : (
                <>
                  <button type="button" className="text-button" onClick={() => onOpen(entry)}>
                    {t(entry.title)}
                  </button>
                  <span>
                    {t(entry.detail)} · {t(entry.date)}
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        !incomplete && (
          <p className="sub">{t('Los registros de esta persona aparecerán aquí al guardarlos.')}</p>
        )
      )}
    </section>
  );
}
import { CheckAttachments } from '../../daily-check/components/CheckAttachments';
import type { describeDailyCheck } from '../../daily-check/dailyCheckDetails';
