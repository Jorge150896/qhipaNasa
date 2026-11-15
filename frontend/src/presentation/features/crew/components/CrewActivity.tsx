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
  return (
    <section className="panel crew-activity" aria-labelledby="crew-activity-title">
      <h3 id="crew-activity-title">Actividad guardada</h3>
      {incomplete && <p className="sub">Algunos registros aún no están disponibles.</p>}
      {entries.length ? (
        <ul className="crew-activity-list">
          {entries.map((entry) => (
            <li key={`${entry.kind}:${entry.id}`}>
              {entry.kind === 'monitoring' ? (
                <details id={`session-${encodeURIComponent(entry.id)}`}>
                  <summary>
                    {entry.title} · {entry.detail} · {entry.date}
                  </summary>
                  <p>{entry.context}</p>
                  {entry.note && <p>{entry.note}</p>}
                  <ul>
                    {entry.readings.map((reading) => (
                      <li key={reading}>{reading}</li>
                    ))}
                  </ul>
                </details>
              ) : entry.kind === 'check' ? (
                <details id={`check-${encodeURIComponent(entry.id)}`}>
                  <summary>
                    {entry.title} · {entry.detail} · {entry.date}
                  </summary>
                  {entry.check.contextLabel && <p>{entry.check.contextLabel}</p>}
                  <dl className="daily-check-summary">
                    {[
                      { label: 'Sueño', value: entry.check.sleep },
                      { label: 'Fatiga', value: entry.check.fatigue },
                      { label: 'Ánimo', value: entry.check.mood },
                      ...entry.check.details,
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                  {entry.check.note && <p>{entry.check.note}</p>}
                  {entry.check.savedAttachment && (
                    <details>
                      <summary>Ver datos adjuntos del chequeo</summary>
                      <CheckAttachments data={entry.check.savedAttachment} />
                    </details>
                  )}
                </details>
              ) : (
                <>
                  <button type="button" className="text-button" onClick={() => onOpen(entry)}>
                    {entry.title}
                  </button>
                  <span>
                    {entry.detail} · {entry.date}
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        !incomplete && (
          <p className="sub">Los registros de esta persona aparecerán aquí al guardarlos.</p>
        )
      )}
    </section>
  );
}
import { CheckAttachments } from '../../daily-check/components/CheckAttachments';
import type { describeDailyCheck } from '../../daily-check/dailyCheckDetails';
