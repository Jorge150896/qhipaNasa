interface ActivitySummary {
  id: string;
  date: string;
  title: string;
  detail: string;
}

type SavedEntry = ActivitySummary & { kind: 'health' | 'check' };
type SessionEntry = ActivitySummary & {
  kind: 'monitoring';
  context: string;
  note: string;
  readings: string[];
};
export type ActivityEntry = SavedEntry | SessionEntry;

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
