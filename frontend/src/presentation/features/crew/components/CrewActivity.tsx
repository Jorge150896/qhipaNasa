export interface ActivityEntry {
  id: string;
  date: string;
  title: string;
  kind: 'health' | 'check' | 'monitoring';
  detail: string;
}

export function CrewActivity({
  entries,
  incomplete,
  onOpen,
}: {
  entries: ActivityEntry[];
  incomplete: boolean;
  onOpen(entry: ActivityEntry): void;
}) {
  return (
    <section className="panel crew-activity" aria-labelledby="crew-activity-title">
      <h3 id="crew-activity-title">Actividad guardada</h3>
      {incomplete && <p className="sub">Algunos registros aún no están disponibles.</p>}
      {entries.length ? (
        <ul>
          {entries.map((entry) => (
            <li key={`${entry.kind}:${entry.id}`}>
              <button type="button" className="text-button" onClick={() => onOpen(entry)}>
                {entry.title}
              </button>
              <span>
                {entry.detail} · {entry.date}
              </span>
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
